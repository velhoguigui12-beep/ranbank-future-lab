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
    });

    const responseHeaders = new Headers();
    for (const name of ["content-type", "cache-control", "set-cookie", "location"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      { message: "A API está iniciando. Aguarde alguns segundos e tente novamente." },
      { status: 503 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;

