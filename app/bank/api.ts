export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export type AccountLoadState = {
  status: "idle" | "loading" | "ready" | "error";
  message: string;
};

type ExpectedSession = {
  customerName: string;
  accountNumber: string;
};

let accountLoadState: AccountLoadState = { status: "idle", message: "" };
let dashboardReadyOnce = false;
let expectedSession: ExpectedSession | null = null;
const accountLoadListeners = new Set<() => void>();

const SESSION_START_TIMEOUT_MS = 155000;
const DASHBOARD_TIMEOUT_MS = 90000;
const WARMUP_TIMEOUT_MS = 150000;
const WARMUP_READY_TTL_MS = 5 * 60 * 1000;
const TRANSIENT_RETRY_DELAY_MS = 12000;
const transientStatuses = new Set([429, 502, 503, 504]);

let backendWarmupPromise: Promise<void> | null = null;
let backendReadyAt = 0;

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
      headers: {
        ...init.headers,
        "X-Ranbank-Client": "web-v4",
      },
    });
  } finally {
    if (timeout !== null && typeof window !== "undefined") window.clearTimeout(timeout);
  }
};

const retryAfterMilliseconds = (response: Response, fallback = TRANSIENT_RETRY_DELAY_MS) => {
  const header = response.headers.get("Retry-After");
  if (!header) return fallback;

  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.min(Math.max(seconds * 1000, fallback), 30000);

  const timestamp = Date.parse(header);
  if (Number.isNaN(timestamp)) return fallback;
  return Math.min(Math.max(timestamp - Date.now(), fallback), 30000);
};

const sameAccount = (actual: unknown, expected: string) =>
  typeof actual === "string" && actual.trim() === expected.trim();

const rememberAuthenticatedAccount = async (response: Response) => {
  if (!response.ok) return response;

  const payload = await response.clone().json().catch(() => null) as {
    customerName?: string;
    accountNumber?: string;
  } | null;

  if (payload?.customerName && payload.accountNumber) {
    expectedSession = {
      customerName: payload.customerName,
      accountNumber: payload.accountNumber,
    };
  }

  return response;
};

/**
 * Render Free can take a long time to wake the Java service. Only one browser
 * request is allowed to wake/verify the backend at a time. Session restore,
 * login and the dashboard all await this same promise instead of creating a
 * request burst that can trigger 429 responses while the instance is cold.
 */
export const warmBackend = () => {
  if (Date.now() - backendReadyAt < WARMUP_READY_TTL_MS) return Promise.resolve();
  if (backendWarmupPromise) return backendWarmupPromise;

  backendWarmupPromise = (async () => {
    let lastResponse: Response | null = null;
    let lastError: unknown = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await request("/health", {
          headers: { "X-Ranbank-Warmup": "1" },
        }, WARMUP_TIMEOUT_MS);
        lastResponse = response;

        if (response.ok) {
          backendReadyAt = Date.now();
          return;
        }

        if (!transientStatuses.has(response.status)) {
          throw new Error(`A API do RanBank respondeu com erro ${response.status}.`);
        }

        if (attempt < 2) {
          await sleep(retryAfterMilliseconds(response, 15000 + attempt * 5000));
        }
      } catch (error) {
        lastError = error;
        if (attempt < 2) await sleep(15000 + attempt * 5000);
      }
    }

    if (lastResponse?.status === 429) {
      throw new Error("O Render ainda está limitando temporariamente a API do RanBank. Aguarde cerca de 30 segundos e tente novamente.");
    }

    if (lastResponse) {
      throw new Error(`A API do RanBank não ficou pronta (erro ${lastResponse.status}).`);
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("A API do RanBank não ficou pronta.");
  })().finally(() => {
    backendWarmupPromise = null;
  });

  return backendWarmupPromise;
};

const requestSessionStart = async (path: string, init: RequestInit) => {
  let response = await request(path, init, SESSION_START_TIMEOUT_MS);

  if (response.status === 429) {
    await sleep(retryAfterMilliseconds(response));
    response = await request(path, init, SESSION_START_TIMEOUT_MS);
  }

  return response;
};

export async function apiFetch(path: string, init: RequestInit = {}) {
  const method = (init.method ?? "GET").toUpperCase();
  const startsNewSession = method === "POST" && (path === "/auth/login" || path === "/demo-accounts");
  const logsOut = method === "POST" && path === "/auth/logout";

  if (path !== "/health") {
    await warmBackend();
  }

  if (startsNewSession) {
    dashboardReadyOnce = false;
    expectedSession = null;
    setAccountLoadState({ status: "idle", message: "" });

    try {
      const response = await requestSessionStart(path, init);
      return rememberAuthenticatedAccount(response);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("O servidor ainda está iniciando. Aguarde alguns segundos e tente novamente.");
      }
      throw error;
    }
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
      ? `Carregando a conta de ${expectedSession.customerName}…`
      : "Carregando os dados da conta autenticada…",
  });

  let response: Response;
  try {
    response = await request(path, init, DASHBOARD_TIMEOUT_MS);

    if (transientStatuses.has(response.status)) {
      setAccountLoadState({
        status: "loading",
        message: response.status === 429
          ? "O acesso ao servidor foi limitado temporariamente. Aguardando para tentar novamente…"
          : "O servidor está concluindo a inicialização. Tentando mais uma vez…",
      });
      await sleep(retryAfterMilliseconds(response));
      response = await request(path, init, DASHBOARD_TIMEOUT_MS);
    }
  } catch (error) {
    setAccountLoadState({
      status: "error",
      message: "O RanBank não conseguiu carregar sua conta agora. Tente novamente em alguns segundos.",
    });
    throw error;
  }

  if (!response.ok) {
    setAccountLoadState({
      status: "error",
      message: response.status === 401 || response.status === 403
        ? "Sua sessão não foi reconhecida. Entre novamente."
        : response.status === 429
          ? "O acesso ao servidor continua limitado temporariamente. Aguarde um pouco e tente novamente."
          : `Não foi possível carregar sua conta (erro ${response.status}).`,
    });
    return response;
  }

  if (expectedSession) {
    const dashboard = await response.clone().json().catch(() => null) as { account?: string } | null;
    if (!dashboard || !sameAccount(dashboard.account, expectedSession.accountNumber)) {
      setAccountLoadState({
        status: "error",
        message: `A sessão retornou uma conta diferente de ${expectedSession.customerName}. Entre novamente para proteger seus dados.`,
      });
      return new Response(
        JSON.stringify({ message: "A sessão retornou uma conta diferente da autenticada." }),
        { status: 409, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } },
      );
    }
  }

  dashboardReadyOnce = true;
  setAccountLoadState({ status: "ready", message: "" });
  return response;
}

export async function responseMessage(response: Response, fallback: string) {
  const body = await response.json().catch(() => ({ message: fallback }));
  return typeof body.message === "string" ? body.message : fallback;
}
