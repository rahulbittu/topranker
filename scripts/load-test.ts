/**
 * Sprint 194: Load Testing Script
 *
 * Simulates concurrent users hitting key API endpoints.
 * Usage: npx tsx scripts/load-test.ts [baseUrl] [concurrency] [duration]
 *
 * Defaults: http://localhost:5000, 50 concurrent, 30 seconds
 * Reports: requests/sec, avg latency, p95 latency, error rate
 */

const BASE_URL = process.argv[2] || "http://localhost:5000";
const CONCURRENCY = parseInt(process.argv[3] || "50");
const DURATION_MS = parseInt(process.argv[4] || "30") * 1000;

interface EndpointConfig {
  name: string;
  path: string;
  weight: number; // probability weight (higher = more traffic)
}

const ENDPOINTS: EndpointConfig[] = [
  { name: "leaderboard", path: "/api/leaderboard?city=Dallas&category=restaurant", weight: 30 },
  { name: "search", path: "/api/businesses/search?q=pizza&city=Dallas", weight: 20 },
  { name: "autocomplete", path: "/api/businesses/autocomplete?q=piz&city=Dallas", weight: 25 },
  { name: "trending", path: "/api/trending?city=Dallas", weight: 10 },
  { name: "categories", path: "/api/leaderboard/categories?city=Dallas", weight: 5 },
  { name: "popular-cats", path: "/api/businesses/popular-categories?city=Dallas", weight: 5 },
  { name: "health", path: "/api/health", weight: 5 },
];

const totalWeight = ENDPOINTS.reduce((sum, e) => sum + e.weight, 0);

function pickEndpoint(): EndpointConfig {
  let r = Math.random() * totalWeight;
  for (const ep of ENDPOINTS) {
    r -= ep.weight;
    if (r <= 0) return ep;
  }
  return ENDPOINTS[0];
}

interface Result {
  endpoint: string;
  status: number;
  latencyMs: number;
  error: boolean;
}

const results: Result[] = [];
let running = true;

async function worker() {
  while (running) {
    const ep = pickEndpoint();
    const start = performance.now();
    try {
      const res = await fetch(`${BASE_URL}${ep.path}`);
      const latencyMs = performance.now() - start;
      results.push({
        endpoint: ep.name,
        status: res.status,
        latencyMs,
        error: res.status >= 400,
      });
    } catch {
      const latencyMs = performance.now() - start;
      results.push({ endpoint: ep.name, status: 0, latencyMs, error: true });
    }
  }
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil(sorted.length * p / 100) - 1;
  return sorted[Math.max(0, idx)];
}

function printReport() {
  const durationSec = DURATION_MS / 1000;
  const total = results.length;
  const errors = results.filter(r => r.error).length;
  const latencies = results.map(r => r.latencyMs).sort((a, b) => a - b);
  const avg = latencies.reduce((s, v) => s + v, 0) / latencies.length;

  console.log("\n" + "=".repeat(60));
  console.log("  LOAD TEST REPORT");
  console.log("=".repeat(60));
  console.log(`  Target:        ${BASE_URL}`);
  console.log(`  Concurrency:   ${CONCURRENCY}`);
  console.log(`  Duration:      ${durationSec}s`);
  console.log(`  Total Requests: ${total}`);
  console.log(`  Requests/sec:  ${(total / durationSec).toFixed(1)}`);
  console.log(`  Error Rate:    ${((errors / total) * 100).toFixed(1)}%`);
  console.log(`  Avg Latency:   ${avg.toFixed(0)}ms`);
  console.log(`  P50 Latency:   ${percentile(latencies, 50).toFixed(0)}ms`);
  console.log(`  P95 Latency:   ${percentile(latencies, 95).toFixed(0)}ms`);
  console.log(`  P99 Latency:   ${percentile(latencies, 99).toFixed(0)}ms`);
  console.log(`  Max Latency:   ${latencies[latencies.length - 1]?.toFixed(0) || 0}ms`);

  // Per-endpoint breakdown
  console.log("\n  Per-Endpoint Breakdown:");
  console.log("  " + "-".repeat(58));
  const byEndpoint = new Map<string, Result[]>();
  for (const r of results) {
    if (!byEndpoint.has(r.endpoint)) byEndpoint.set(r.endpoint, []);
    byEndpoint.get(r.endpoint)!.push(r);
  }
  for (const [name, epResults] of byEndpoint) {
    const epLatencies = epResults.map(r => r.latencyMs).sort((a, b) => a - b);
    const epAvg = epLatencies.reduce((s, v) => s + v, 0) / epLatencies.length;
    const epErrors = epResults.filter(r => r.error).length;
    console.log(`  ${name.padEnd(16)} | ${epResults.length.toString().padStart(5)} req | avg ${epAvg.toFixed(0).padStart(4)}ms | p95 ${percentile(epLatencies, 95).toFixed(0).padStart(4)}ms | err ${((epErrors / epResults.length) * 100).toFixed(0).padStart(3)}%`);
  }
  console.log("=".repeat(60));

  // Pass/fail criteria
  const passRps = total / durationSec >= 10;
  const passLatency = avg < 500;
  const passErrors = (errors / total) < 0.05;
  console.log(`\n  VERDICT: ${passRps && passLatency && passErrors ? "✅ PASS" : "❌ FAIL"}`);
  if (!passRps) console.log("    ⚠ RPS below 10 (target: 10+)");
  if (!passLatency) console.log("    ⚠ Avg latency above 500ms (target: <500ms)");
  if (!passErrors) console.log("    ⚠ Error rate above 5% (target: <5%)");
  console.log();
}

async function main() {
  console.log(`\nStarting load test: ${CONCURRENCY} concurrent → ${BASE_URL} for ${DURATION_MS / 1000}s\n`);

  // Launch workers
  const workers = Array.from({ length: CONCURRENCY }, () => worker());

  // Stop after duration
  await new Promise(r => setTimeout(r, DURATION_MS));
  running = false;

  // Wait for in-flight requests
  await Promise.allSettled(workers);

  printReport();
}

main().catch(console.error);
