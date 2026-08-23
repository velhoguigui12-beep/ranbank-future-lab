export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export const apiFetch = (path: string, init: RequestInit = {}) =>
  fetch(`${API_BASE}${path}`, { ...init, credentials: "include" });

export async function responseMessage(response: Response, fallback: string) {
  const body = await response.json().catch(() => ({ message: fallback }));
  return typeof body.message === "string" ? body.message : fallback;
}
