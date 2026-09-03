const BACKEND_URL = process.env.RANBANK_BACKEND_URL?.trim().replace(/\/$/, "") ?? "";
const PROXY_SECRET = process.env.RANBANK_PROXY_SECRET?.trim() ?? "";

type RouteContext = { params: Promise<{ path: string[] }> | { path: string[] } };

async function proxy(request: Request, context: RouteContext) {
  if (!BACKEND_URL) {
    return Response.json(
      { message: "A API do RanBank ainda não foi configurada neste ambiente." },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  const params = await context.params;
  const incomingUrl = new URL(request.url);
  let targetUrl: URL;
  try {
    targetUrl = new URL(`${BACKEND_URL}/${params.path.join("/")}`);
  } catch {
    return Response.json(
      { message: "O endereço interno da API do RanBank é inválido." },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
  targetUrl.search = incomingUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("x-ranbank-proxy-secret");
  headers.set("x-forwarded-proto", incomingUrl.protocol.replace(":", ""));
  if (PROXY_SECRET) headers.set("x-ranbank-proxy-secret", PROXY_SECRET);

  const body = request.method === "GET" || request.method === "HEAD"
    ? undefined
    : await request.arrayBuffer();

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") ?? "";

    // If Render (or another intermediary) returns an HTML/text error page,
    // convert it to JSON so the frontend can show a useful diagnostic instead
    // of falling back to the generic "Não foi possível entrar." message.
    if (!upstream.ok && !contentType.toLowerCase().includes("application/json")) {
      const responseText = await upstream.text();
      console.error("[Ranbank proxy] upstream non-JSON error", {
        status: upstream.status,
        statusText: upstream.statusText,
        target: `${targetUrl.origin}${targetUrl.pathname}`,
        preview: responseText.slice(0, 500),
      });

      const status = upstream.status >= 400 && upstream.status <= 599 ? upstream.status : 502;
      const errorHeaders = new Headers({
        "cache-control": "no-store",
        "x-ranbank-upstream-status": String(upstream.status),
      });
      const retryAfter = upstream.headers.get("retry-after");
      if (retryAfter) errorHeaders.set("retry-after", retryAfter);

      return Response.json(
        {
          message: `A API do Ranbank respondeu com erro ${status}. Tente novamente em alguns segundos.`,
          upstreamStatus: upstream.status,
          upstreamStatusText: upstream.statusText,
        },
        {
          status,
          headers: errorHeaders,
        },
      );
    }

    const responseHeaders = new Headers();
    for (const name of [
      "content-type", "cache-control", "set-cookie", "location", "content-security-policy",
      "permissions-policy", "referrer-policy", "strict-transport-security", "x-content-type-options",
      "x-frame-options", "retry-after",
    ]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    responseHeaders.set("x-ranbank-upstream-status", String(upstream.status));

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[Ranbank proxy] failed to reach backend", {
      target: `${targetUrl.origin}${targetUrl.pathname}`,
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        message: "A API do Ranbank está indisponível ou iniciando. Aguarde alguns segundos e tente novamente.",
      },
      {
        status: 503,
        headers: { "cache-control": "no-store" },
      },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
