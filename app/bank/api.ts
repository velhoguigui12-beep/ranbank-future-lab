export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export type AccountLoadState = {
  status: "idle" | "loading" | "ready" | "error";
  message: string;
};

type ExpectedSession = {
  customerName: string;
  accountNumber: string;
  identification?: string;
  pin?: string;
};

let accountLoadState: AccountLoadState = { status: "idle", message: "" };
let dashboardReadyOnce = false;
let expectedSession: ExpectedSession | null = null;
const accountLoadListeners = new Set<() => void>();
const transientStatuses = new Set([429, 502, 503, 504]);
const retryDelays = [0, 180];
const INITIAL_DASHBOARD_TIMEOUT_MS = 1800;

export const subscribeAccountLoad = (listener: () => void) => {
  accountLoadListeners.add(listener);
  return () => accountLoadListeners.delete(listener);
};

export const getAccountLoadSnapshot = () => accountLoadState;

const setAccountLoadState = (next: AccountLoadState) => {
  if (accountLoadState.status === next.status && accountLoadState.message === next.message) return;
  accountLoadState = next;
  accountLoadListeners.forEach((listener) => listener());
};

const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const request = async (path: string, init: RequestInit = {}, timeoutMs?: number) => {
  const controller = timeoutMs && !init.signal ? new AbortController() : null;
  const timeout = controller && typeof window !== "undefined"
    ? window.setTimeout(() => controller.abort(), timeoutMs)
    : null;
  try {
    return await fetch(`${API_BASE}${path}`, {
      ...init,
      cache: init.cache ?? "no-store",
      signal: init.signal ?? controller?.signal,
      credentials: "include",
    });
  } finally {
    if (timeout !== null && typeof window !== "undefined") window.clearTimeout(timeout);
  }
};

const bodyAsObject = (init: RequestInit) => {
  if (typeof init.body !== "string") return {} as Record<string, unknown>;
  try {
    return JSON.parse(init.body) as Record<string, unknown>;
  } catch {
    return {} as Record<string, unknown>;
  }
};

const errorResponse = (message: string, status = 409) => new Response(
  JSON.stringify({ message }),
  { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } },
);

const sameAccount = (actual: unknown, expected: string) =>
  typeof actual === "string" && actual.trim() === expected.trim();

const forceExpectedLogin = async () => {
  if (!expectedSession?.identification || !expectedSession.pin) return false;
  try {
    const response = await request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identification: expectedSession.identification,
        pin: expectedSession.pin,
      }),
    }, 3500);
    if (!response.ok) return false;
    const session = await request("/auth/session", {}, 1800);
    if (!session.ok) return false;
    const data = await session.json().catch(() => null) as { accountNumber?: string } | null;
    return Boolean(data && sameAccount(data.accountNumber, expectedSession.accountNumber));
  } catch {
    return false;
  }
};

const rememberAuthenticatedAccount = async (path: string, init: RequestInit, response: Response) => {
  if (!response.ok) return response;
  const payload = await response.clone().json().catch(() => null) as {
    customerName?: string;
    accountNumber?: string;
  } | null;
  if (!payload?.customerName || !payload.accountNumber) return response;

  const submitted = bodyAsObject(init);
  if (path === "/auth/login") {
    expectedSession = {
      customerName: payload.customerName,
      accountNumber: payload.accountNumber,
      identification: typeof submitted.identification === "string" ? submitted.identification : undefined,
      pin: typeof submitted.pin === "string" ? submitted.pin : undefined,
    };
    return response;
  }

  if (path === "/demo-accounts") {
    expectedSession = {
      customerName: payload.customerName,
      accountNumber: payload.accountNumber,
      identification: typeof submitted.documentId === "string" ? submitted.documentId : undefined,
      pin: typeof submitted.accessPin === "string" ? submitted.accessPin : undefined,
    };

    // The creation endpoint also authenticates the new account, but browsers that
    // already had the presentation account open have shown a stale session cookie
    // in production. Re-login explicitly with the just-created credentials so the
    // cookie replacement is deterministic before the dashboard is requested.
    const switched = await forceExpectedLogin();
    if (!switched) {
      setAccountLoadState({
        status: "error",
        message: `A conta ${payload.customerName} foi criada, mas a sessão não mudou para ela. Entre novamente com o CPF criado.`,
      });
      return errorResponse(
        `Conta criada para ${payload.customerName}, mas não foi possível confirmar a nova sessão. Entre com o CPF e o PIN cadastrados.`,
      );
    }
  }

  return response;
};

export async function apiFetch(path: string, init: RequestInit = {}) {
  const method = (init.method ?? "GET").toUpperCase();
  const startsNewSession = method === "POST" && (path === "/auth/login" || path === "/demo-accounts");
  const logsOut = method === "POST" && path === "/auth/logout";

  if (startsNewSession) {
    dashboardReadyOnce = false;
    setAccountLoadState({ status: "idle", message: "" });
    const response = await request(path, init);
    return rememberAuthenticatedAccount(path, init, response);
  }

  if (logsOut) {
    dashboardReadyOnce = false;
    expectedSession = null;
    setAccountLoadState({ status: "idle", message: "" });
    return request(path, init);
  }

  const protectsInitialAccount = method === "GET" && path === "/dashboard" && !dashboardReadyOnce;
  if (!protectsInitialAccount) return request(path, init);

  setAccountLoadState({
    status: "loading",
    message: expectedSession
      ? `Confirmando a conta de ${expectedSession.customerName}…`
      : "Carregando os dados da conta autenticada…",
  });

  let lastResponse: Response | null = null;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < retryDelays.length; attempt += 1) {
    if (retryDelays[attempt] > 0) await sleep(retryDelays[attempt]);
    try {
      let response = await request(path, init, INITIAL_DASHBOARD_TIMEOUT_MS);
      lastResponse = response;

      if (response.ok && expectedSession) {
        const dashboard = await response.clone().json().catch(() => null) as { account?: string } | null;
        if (!dashboard || !sameAccount(dashboard.account, expectedSession.accountNumber)) {
          const switched = await forceExpectedLogin();
          if (switched) {
            response = await request(path, init, INITIAL_DASHBOARD_TIMEOUT_MS);
            lastResponse = response;
          }

          if (response.ok) {
            const retryDashboard = await response.clone().json().catch(() => null) as { account?: string } | null;
            if (!retryDashboard || !sameAccount(retryDashboard.account, expectedSession.accountNumber)) {
              setAccountLoadState({
                status: "error",
                message: `A sessão retornou uma conta diferente de ${expectedSession.customerName}. Por segurança, o dashboard foi bloqueado.`,
              });
              return errorResponse("A sessão retornou uma conta diferente da que acabou de ser autenticada.");
            }
          }
        }
      }

      if (response.ok) {
        dashboardReadyOnce = true;
        setAccountLoadState({ status: "ready", message: "" });
        return response;
      }

      if (!transientStatuses.has(response.status)) {
        setAccountLoadState({
          status: "error",
          message: response.status === 401 || response.status === 403
            ? "Sua sessão não foi reconhecida. Recarregue a página ou entre novamente."
            : `Não foi possível carregar sua conta (erro ${response.status}).`,
        });
        return response;
      }
    } catch (error) {
      lastError = error;
    }
  }

  setAccountLoadState({
    status: "error",
    message: "O RanBank não conseguiu carregar sua conta agora. Tente novamente em alguns segundos.",
  });

  if (lastResponse) return lastResponse;
  throw lastError instanceof Error ? lastError : new Error("Não foi possível carregar a conta.");
}

export async function responseMessage(response: Response, fallback: string) {
  const body = await response.json().catch(() => ({ message: fallback }));
  return typeof body.message === "string" ? body.message : fallback;
}
