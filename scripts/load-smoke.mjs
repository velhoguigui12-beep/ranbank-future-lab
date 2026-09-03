import { performance } from "node:perf_hooks";

const baseUrl = (process.argv[2] ?? "").replace(/\/$/, "");
const total = Number.parseInt(process.argv[3] ?? "40", 10);
const concurrency = Number.parseInt(process.argv[4] ?? "8", 10);

if (!baseUrl || !Number.isFinite(total) || !Number.isFinite(concurrency)
    || total < 1 || concurrency < 1) {
  console.error("Uso: npm run test:load -- https://site.example 40 8");
  process.exit(2);
}

const results = [];
let nextRequest = 0;

async function worker() {
  while (nextRequest < total) {
    const id = nextRequest;
    nextRequest += 1;
    const startedAt = performance.now();
    try {
      const response = await fetch(`${baseUrl}/api/health`, { cache: "no-store" });
      await response.arrayBuffer();
      results.push({ id, status: response.status, duration: performance.now() - startedAt });
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

await Promise.all(Array.from({ length: Math.min(concurrency, total) }, () => worker()));

const durations = results.map(({ duration }) => duration).sort((a, b) => a - b);
const percentile = (ratio) => durations[Math.min(durations.length - 1, Math.floor(durations.length * ratio))];
const statuses = Object.groupBy(results, ({ status }) => String(status));
const summary = {
  requests: total,
  concurrency,
  statuses: Object.fromEntries(Object.entries(statuses).map(([status, values]) => [status, values.length])),
  latencyMs: {
    p50: Math.round(percentile(0.50)),
    p95: Math.round(percentile(0.95)),
    max: Math.round(durations.at(-1)),
  },
};

console.log(JSON.stringify(summary, null, 2));
process.exit(results.every(({ status }) => status === 200) ? 0 : 1);
