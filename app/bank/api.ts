export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";
export type AccountLoadState = { status: "idle" | "loading" | "ready" | "error"; message: string };
type ExpectedSession = { customerName: string; accountNumber: string };
let accountLoadState: AccountLoadState = { status: "idle", message: "" };
let expectedSession: ExpectedSession | null = null;
let sessionGeneration = 0;
const listeners = new Set<() => void>();
const transientStatuses = new Set([429, 502, 503, 504]);
const REQUEST_TIMEOUT_MS = 20000;
const WARMUP_TIMEOUT_MS = 60000;
let warmup: Promise<void> | null = null;
let readyUntil = 0;
export const subscribeAccountLoad = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getAccountLoadSnapshot = () => accountLoadState;
const update = (status: AccountLoadState["status"], message = "") => { accountLoadState = { status, message }; listeners.forEach(listener => listener()); };
export const clearAccountSession = () => { sessionGeneration++; expectedSession = null; update("idle"); };

// One deadline covers headers AND body, and remains effective with caller cancellation.
const request = async (path: string, init: RequestInit = {}, timeoutMs = REQUEST_TIMEOUT_MS) => {
  const deadline = AbortSignal.timeout(timeoutMs);
  const signal = init.signal ? AbortSignal.any([init.signal, deadline]) : deadline;
  const response = await fetch(`${API_BASE}${path}`, { ...init, signal, credentials: "include", cache: "no-store" });
  if (response.headers.get("content-type")?.includes("text/event-stream")) return response;
  const body = await response.arrayBuffer();
  return new Response(response.status === 204 || response.status === 205 || response.status === 304 ? null : body, {
    status: response.status, statusText: response.statusText, headers: response.headers,
  });
};

/** Shared wakeup only for access restoration/sign-in. Never gates logout or money operations. */
export const warmBackend = () => {
  if (Date.now() < readyUntil) return Promise.resolve();
  if (warmup) return warmup;
  warmup = request("/health", {}, WARMUP_TIMEOUT_MS).then(async response => {
    if (!response.ok) throw new Error(await responseMessage(response, "O servidor está indisponível. Tente novamente."));
    readyUntil = Date.now() + 60000;
  }).finally(() => { warmup = null; });
  return warmup;
};

const pause = (ms: number, signal?: AbortSignal | null) => new Promise<void>((resolve, reject) => {
  const abort = () => { clearTimeout(timer); reject(signal?.reason); };
  const timer = setTimeout(() => { signal?.removeEventListener("abort", abort); resolve(); }, ms);
  if (signal?.aborted) abort(); else signal?.addEventListener("abort", abort, { once: true });
});

async function readWithRetry(path: string, init: RequestInit) {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await request(path, init);
      if (attempt || !transientStatuses.has(response.status)) return response;
      const retry = response.headers.get("retry-after");
      const seconds = retry ? Number(retry) : NaN;
      const delay = retry && !Number.isFinite(seconds) ? Date.parse(retry) - Date.now() : seconds * 1000;
      // Longer rate limits are surfaced to the user, never retried prematurely.
      if (Number.isFinite(delay) && delay > 5000) return response;
      await pause(Number.isFinite(delay) ? Math.max(1000, delay) : 1000, init.signal);
    } catch (error) {
      if (attempt || init.signal?.aborted) throw error;
      await pause(1000, init.signal);
    }
  }
}

async function remember(response: Response) {
  if (response.ok) {
    const body = await response.clone().json().catch(() => null);
    if (typeof body?.customerName === "string" && typeof body.accountNumber === "string") {
      expectedSession = { customerName: body.customerName, accountNumber: body.accountNumber };
    }
  }
  return response;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const method = (init.method ?? "GET").toUpperCase();
  const startsSession = method === "POST" && (path === "/auth/login" || path === "/demo-accounts");
  const restoresSession = method === "GET" && path === "/auth/session";
  const dashboard = method === "GET" && path === "/dashboard";
  if (method === "POST" && path === "/auth/logout") clearAccountSession();
  if (startsSession) clearAccountSession();
  const generation = sessionGeneration;
  if (dashboard) update("loading", "Conferindo o saldo e as movimentações da sua conta…");
  try {
    if (startsSession || restoresSession) {
      // Wakeup failure must not prevent an otherwise healthy login endpoint from answering.
      await warmBackend().catch(() => undefined);
      init.signal?.throwIfAborted();
    }
    const response = method === "GET" ? await readWithRetry(path, init) : await request(path, init);
    if (generation !== sessionGeneration) throw new Error("A sessão mudou durante a solicitação.");
    if (startsSession || restoresSession) await remember(response);
    if (dashboard) {
      if (!response.ok) throw new Error(await responseMessage(response, "Não foi possível atualizar sua conta."));
      const body = await response.clone().json();
      if (expectedSession && body.account !== expectedSession.accountNumber) {
        throw new Error("A conta da sessão mudou. Saia e entre novamente para continuar com segurança.");
      }
      update("ready");
    }
    return response;
  } catch (error) {
    const timeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    const message = timeout ? "O servidor demorou para responder. Tente novamente em alguns segundos."
      : error instanceof TypeError ? "Não foi possível conectar. Confira sua internet e tente novamente."
      : error instanceof Error ? error.message : "Serviço indisponível. Tente novamente.";
    if (dashboard && generation === sessionGeneration) update("error", message);
    throw new Error(message, { cause: error });
  }
}

export async function responseMessage(response: Response, fallback: string) {
  const body = await response.json().catch(() => null);
  return typeof body?.message === "string" ? body.message : fallback;
}
