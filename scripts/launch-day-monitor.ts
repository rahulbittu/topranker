/**
 * Sprint 216: Launch Day Monitor
 * Polls critical endpoints and reports system health in real-time.
 * Owner: Sarah Nakamura (Lead Eng)
 *
 * Run: npx tsx scripts/launch-day-monitor.ts [baseUrl] [intervalSeconds]
 * Default: http://localhost:5000, 30s interval
 *
 * Reports: health, response times, memory usage, error count
 * Exit code 1 if any critical check fails
 */

const BASE_URL = process.argv[2] || "http://localhost:5000";
const INTERVAL_SEC = parseInt(process.argv[3] || "30", 10);

interface MonitorResult {
  endpoint: string;
  status: number | null;
  latencyMs: number;
  healthy: boolean;
  details?: Record<string, unknown>;
  error?: string;
}

const MONITOR_ENDPOINTS = [
  { path: "/api/health", name: "Health", critical: true },
  { path: "/api/leaderboard?city=dallas", name: "Leaderboard", critical: true },
  { path: "/api/categories", name: "Categories", critical: false },
  { path: "/api/search?q=pizza&city=dallas", name: "Search", critical: true },
  { path: "/api/autocomplete?q=bbq", name: "Autocomplete", critical: false },
];

const LATENCY_THRESHOLD_MS = 500;
const MEMORY_THRESHOLD_MB = 512;

async function checkEndpoint(ep: typeof MONITOR_ENDPOINTS[0]): Promise<MonitorResult> {
  const url = `${BASE_URL}${ep.path}`;
  const start = performance.now();
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    const latency = Math.round(performance.now() - start);
    let details: Record<string, unknown> | undefined;
    if (ep.path === "/api/health") {
      try { details = await res.json() as Record<string, unknown>; } catch {}
    }
    return {
      endpoint: ep.name,
      status: res.status,
      latencyMs: latency,
      healthy: res.status === 200 && latency < LATENCY_THRESHOLD_MS,
      details,
    };
  } catch (err) {
    return {
      endpoint: ep.name,
      status: null,
      latencyMs: Math.round(performance.now() - start),
      healthy: false,
      error: String(err),
    };
  }
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

async function runMonitorCycle(): Promise<boolean> {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
  console.log(`\n┌─────────────────────────────────────────────────────────┐`);
  console.log(`│  LAUNCH DAY MONITOR — ${timestamp}          │`);
  console.log(`└─────────────────────────────────────────────────────────┘`);

  const results = await Promise.all(MONITOR_ENDPOINTS.map(checkEndpoint));
  let criticalFailure = false;

  for (const r of results) {
    const ep = MONITOR_ENDPOINTS.find(e => e.name === r.endpoint)!;
    const icon = r.healthy ? "✅" : ep.critical ? "🔴" : "⚠️";
    const statusStr = r.status !== null ? `${r.status}` : "ERR";
    const latencyWarn = r.latencyMs >= LATENCY_THRESHOLD_MS ? " [SLOW]" : "";
    console.log(`  ${icon} ${r.endpoint.padEnd(14)} ${statusStr.padEnd(4)} ${r.latencyMs}ms${latencyWarn}`);
    if (r.error) console.log(`     Error: ${r.error}`);

    if (!r.healthy && ep.critical) criticalFailure = true;

    // Health endpoint details
    if (r.details && r.endpoint === "Health") {
      const d = r.details;
      const memMB = typeof d.memory === "object" && d.memory !== null
        ? (d.memory as { heapUsed?: number }).heapUsed ?? 0
        : 0;
      const uptime = typeof d.uptime === "number" ? d.uptime : 0;
      const memWarn = memMB > MEMORY_THRESHOLD_MB ? " ⚠️ HIGH" : "";
      console.log(`     Uptime: ${formatUptime(uptime)} | Memory: ${memMB}MB${memWarn} | Version: ${d.version || "?"}`);

      if (memMB > MEMORY_THRESHOLD_MB) {
        console.log(`     🔴 MEMORY WARNING: ${memMB}MB exceeds ${MEMORY_THRESHOLD_MB}MB threshold`);
      }
    }
  }

  const passed = results.filter(r => r.healthy).length;
  const avgLatency = Math.round(results.reduce((s, r) => s + r.latencyMs, 0) / results.length);

  console.log(`\n  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  ${passed}/${results.length} healthy | Avg latency: ${avgLatency}ms`);
  if (criticalFailure) {
    console.log(`  🔴 CRITICAL FAILURE — Immediate action required`);
  } else {
    console.log(`  ✅ ALL SYSTEMS OPERATIONAL`);
  }
  console.log(`  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  return !criticalFailure;
}

async function main() {
  console.log(`\n🚀 Launch Day Monitor — ${BASE_URL}`);
  console.log(`   Polling every ${INTERVAL_SEC}s | Latency threshold: ${LATENCY_THRESHOLD_MS}ms`);
  console.log(`   Critical endpoints: ${MONITOR_ENDPOINTS.filter(e => e.critical).map(e => e.name).join(", ")}`);

  // Single run mode (for CI)
  if (process.argv.includes("--once")) {
    const healthy = await runMonitorCycle();
    process.exit(healthy ? 0 : 1);
  }

  // Continuous monitoring mode
  const healthy = await runMonitorCycle();
  if (!healthy) {
    console.log("\n⚠️  Initial check failed — continuing monitoring...");
  }

  setInterval(async () => {
    await runMonitorCycle();
  }, INTERVAL_SEC * 1000);
}

main();
