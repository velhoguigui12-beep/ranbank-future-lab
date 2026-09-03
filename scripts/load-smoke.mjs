import { performance } from "node:perf_hooks";

const baseUrl = (process.argv[2] ?? "").replace(/\/$/, "");
const total = Number.parseInt(process.argv[3] ?? "40", 10);
const concurrency = Number.parseInt(process.argv[4] ?? "8", 10);
const mode = process.argv[5] ?? "health";

if (!baseUrl || !Number.isFinite(total) || !Number.isFinite(concurrency)
    || total < 1 || concurrency < 1 || !["health", "login"].includes(mode)) {
  console.error("Uso: npm run test:load -- https://site.example 40 8 [health|login]");
  process.exit(2);
}

const results = [];
let nextRequest = 0;

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitUntilReady() {
  const startedAt = performance.now();
  let attempts = 0;
  let lastStatus = 0;
  while (performance.now() - startedAt < 180_000) {
    attempts += 1;
    try {
      const response = await fetch(`${baseUrl}/api/health`, { cache: "no-store" });
      await response.arrayBuffer();
      lastStatus = response.status;
      if (response.ok) {
        return { attempts, status: response.status, duration: performance.now() - startedAt };
      }
    } catch {
      lastStatus = 0;
    }
    await sleep(2_000);
  }
  return { attempts, status: lastStatus, duration: performance.now() - startedAt };
}

async function healthCheck() {
  const response = await fetch(`${baseUrl}/api/health`, { cache: "no-store" });
  await response.arrayBuffer();
  return response.status;
}

async function loginJourney(id) {
  const identifiers = ["12345678909", "1234-5", "ana@ranbank.demo"];
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ identification: identifiers[id % identifiers.length], pin: "2580" }),
    cache: "no-store",
  });
  await response.arrayBuffer();
  if (!response.ok) return response.status;

  const sessionCookie = response.headers.get("set-cookie")?.split(";", 1)[0];
  if (!sessionCookie) return 598;
  const authenticatedHeaders = { cookie: sessionCookie };

  const session = await fetch(`${baseUrl}/api/auth/session`, {
    headers: authenticatedHeaders,
    cache: "no-store",
  });
  await session.arrayBuffer();
  if (!session.ok) return session.status;

  const dashboard = await fetch(`${baseUrl}/api/dashboard`, {
    headers: authenticatedHeaders,
    cache: "no-store",
  });
  await dashboard.arrayBuffer();

  await fetch(`${baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: authenticatedHeaders,
    cache: "no-store",
  }).catch(() => undefined);
  return dashboard.status;
}

async function worker() {
  while (nextRequest < total) {
    const id = nextRequest;
    nextRequest += 1;
    const startedAt = performance.now();
    try {
      const status = mode === "login" ? await loginJourney(id) : await healthCheck();
      results.push({ id, status, duration: performance.now() - startedAt });
    } catch (error) {
      results.push({
        id,
        status: 0,
        duration: performance.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

const warmup = await waitUntilReady();
await Promise.all(Array.from({ length: Math.min(concurrency, total) }, () => worker()));

const durations = results.map(({ duration }) => duration).sort((a, b) => a - b);
const percentile = (ratio) => durations[Math.min(durations.length - 1, Math.floor(durations.length * ratio))];
const statuses = Object.groupBy(results, ({ status }) => String(status));
const summary = {
  mode,
  requests: total,
  concurrency,
  warmup: {
    attempts: warmup.attempts,
    status: warmup.status,
    durationMs: Math.round(warmup.duration),
  },
  statuses: Object.fromEntries(Object.entries(statuses).map(([status, values]) => [status, values.length])),
  latencyMs: {
    p50: Math.round(percentile(0.50)),
    p95: Math.round(percentile(0.95)),
    max: Math.round(durations.at(-1)),
  },
};

console.log(JSON.stringify(summary, null, 2));
process.exit(warmup.status === 200 && results.every(({ status }) => status === 200) ? 0 : 1);
