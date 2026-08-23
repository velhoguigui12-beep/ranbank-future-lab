const BACKEND_URL = (process.env.RANBANK_BACKEND_URL ?? "https://ranbank-api.onrender.com/api").replace(/\/$/, "");

type RouteContext = { params: Promise<{ path: string[] }> | { path: string[] } };

async function proxy(request: Request, context: RouteContext) {
  const params = await context.params;
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`${BACKEND_URL}/${params.path.join("/")}`);
  targetUrl.search = incomingUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.set("x-forwarded-proto", "https");

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
        target: targetUrl.toString(),
        preview: responseText.slice(0, 500),
      });

      const status = upstream.status >= 400 && upstream.status <= 599 ? upstream.status : 502;
      return Response.json(
        {
          message: `A API do Ranbank respondeu com erro ${status}. Tente novamente em alguns segundos.`,
          upstreamStatus: upstream.status,
          upstreamStatusText: upstream.statusText,
        },
        {
          status,
          headers: {
            "cache-control": "no-store",
            "x-ranbank-upstream-status": String(upstream.status),
          },
        },
      );
    }

    const responseHeaders = new Headers();
    for (const name of [
      "content-type", "cache-control", "set-cookie", "location", "content-security-policy",
      "permissions-policy", "referrer-policy", "strict-transport-security", "x-content-type-options",
      "x-frame-options",
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
      target: targetUrl.toString(),
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        message: "A API do Ranbank está indisponível ou iniciando. Aguarde alguns segundos e tente novamente.",
        upstream: BACKEND_URL,
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
