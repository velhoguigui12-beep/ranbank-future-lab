const BACKEND_URL = (process.env.RANBANK_BACKEND_URL ?? "https://ranbank-api.onrender.com/api").replace(/\/$/, "");
const UPSTREAM_TIMEOUT_MS = 145000;

type RouteContext = { params: Promise<{ path: string[] }> | { path: string[] } };

async function proxy(request: Request, context: RouteContext) {
  const params = await context.params;
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`${BACKEND_URL}/${params.path.join("/")}`);
  targetUrl.search = incomingUrl.search;

  const headers = new Headers(request.headers);

  // Only the API payload/session headers are useful upstream. Do not forward
  // browser/edge forwarding metadata from the frontend service to the backend;
  // this keeps the second Render hop independent from the visitor's edge hop.
  for (const name of [
    "host",
    "content-length",
    "connection",
    "origin",
    "referer",
    "forwarded",
    "x-forwarded-for",
    "x-forwarded-host",
    "x-forwarded-port",
    "x-real-ip",
    "cf-connecting-ip",
    "accept-encoding",
    "sec-fetch-site",
    "sec-fetch-mode",
    "sec-fetch-dest",
    "sec-fetch-user",
  ]) {
    headers.delete(name);
  }
  headers.set("x-forwarded-proto", "https");
  headers.set("x-ranbank-proxy", "same-origin-v3");

  const body = request.method === "GET" || request.method === "HEAD"
    ? undefined
    : await request.arrayBuffer();

  const upstreamController = new AbortController();
  const abortUpstream = () => upstreamController.abort(request.signal.reason);
  const upstreamTimeout = setTimeout(() => upstreamController.abort(), UPSTREAM_TIMEOUT_MS);
  request.signal.addEventListener("abort", abortUpstream, { once: true });

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
      signal: upstreamController.signal,
    });

    const contentType = upstream.headers.get("content-type") ?? "";

    if (!upstream.ok && !contentType.toLowerCase().includes("application/json")) {
      const responseText = await upstream.text();
      console.error("[Ranbank proxy] upstream non-JSON error", {
        status: upstream.status,
        statusText: upstream.statusText,
        target: targetUrl.toString(),
        preview: responseText.slice(0, 500),
      });

      const status = upstream.status >= 400 && upstream.status <= 599 ? upstream.status : 502;
      return Response.json(
        {
          message: status === 429
            ? "O serviço do RanBank foi limitado temporariamente pela infraestrutura. Aguarde alguns segundos e tente novamente."
            : `A API do RanBank respondeu com erro ${status}. Tente novamente em alguns segundos.`,
          upstreamStatus: upstream.status,
          upstreamStatusText: upstream.statusText,
          via: "same-origin-v3",
        },
        {
          status,
          headers: {
            "cache-control": "no-store",
            "x-ranbank-proxy": "same-origin-v3",
            ...(upstream.headers.get("retry-after")
              ? { "retry-after": upstream.headers.get("retry-after")! }
              : {}),
          },
        },
      );
    }

    const responseHeaders = new Headers();
    for (const name of [
      "content-type",
      "cache-control",
      "set-cookie",
      "location",
      "content-security-policy",
      "permissions-policy",
      "referrer-policy",
      "strict-transport-security",
      "x-content-type-options",
      "x-frame-options",
      "retry-after",
      "ratelimit-limit",
      "ratelimit-remaining",
      "ratelimit-reset",
    ]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    responseHeaders.set("x-ranbank-upstream-status", String(upstream.status));
    responseHeaders.set("x-ranbank-proxy", "same-origin-v3");

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[Ranbank proxy] failed to reach backend", {
      target: targetUrl.toString(),
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        message: "A API do RanBank está indisponível ou iniciando. Aguarde alguns segundos e tente novamente.",
        upstream: BACKEND_URL,
        via: "same-origin-v3",
      },
      {
        status: 503,
        headers: {
          "cache-control": "no-store",
          "retry-after": "5",
          "x-ranbank-proxy": "same-origin-v3",
        },
      },
    );
  } finally {
    clearTimeout(upstreamTimeout);
    request.signal.removeEventListener("abort", abortUpstream);
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
