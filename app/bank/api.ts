export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export type AccountLoadState = {
  status: "idle" | "loading" | "ready" | "error";
  message: string;
};

let accountLoadState: AccountLoadState = { status: "idle", message: "" };
let dashboardReadyOnce = false;
const accountLoadListeners = new Set<() => void>();
const transientStatuses = new Set([429, 502, 503, 504]);
const retryDelays = [0, 250];
const INITIAL_DASHBOARD_TIMEOUT_MS = 2200;

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

const request = async (path: string, init: RequestInit, timeoutMs?: number) => {
  const controller = timeoutMs && !init.signal ? new AbortController() : null;
  const timeout = controller ? window.setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    return await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: init.signal ?? controller?.signal,
      credentials: "include",
    });
  } finally {
    if (timeout !== null) window.clearTimeout(timeout);
  }
};

export async function apiFetch(path: string, init: RequestInit = {}) {
  const method = (init.method ?? "GET").toUpperCase();
  const startsNewSession = method === "POST" && (path === "/auth/login" || path === "/demo-accounts");
  const logsOut = method === "POST" && path === "/auth/logout";

  if (startsNewSession) {
    dashboardReadyOnce = false;
    setAccountLoadState({ status: "idle", message: "" });
  }
  if (logsOut) {
    dashboardReadyOnce = false;
    setAccountLoadState({ status: "idle", message: "" });
  }

  const protectsInitialAccount = method === "GET" && path === "/dashboard" && !dashboardReadyOnce;
  if (!protectsInitialAccount) return request(path, init);

  setAccountLoadState({
    status: "loading",
    message: "Carregando os dados da conta autenticada…",
  });

  let lastResponse: Response | null = null;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < retryDelays.length; attempt += 1) {
    if (retryDelays[attempt] > 0) await sleep(retryDelays[attempt]);
    try {
      const response = await request(path, init, INITIAL_DASHBOARD_TIMEOUT_MS);
      lastResponse = response;
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
