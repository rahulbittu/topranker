/**
 * Sprint 214: Production Smoke Test Script
 * Verifies critical endpoints are responding correctly.
 * Owner: Sarah Nakamura (Lead Eng)
 *
 * Run: npx tsx scripts/smoke-test.ts [baseUrl]
 * Default: http://localhost:5000
 */

const BASE_URL = process.argv[2] || "http://localhost:5000";

interface SmokeResult {
  endpoint: string;
  method: string;
  expectedStatus: number;
  actualStatus: number | null;
  passed: boolean;
  latencyMs: number;
  error?: string;
}

const SMOKE_TESTS = [
  { method: "GET", path: "/api/health", expectedStatus: 200 },
  { method: "GET", path: "/api/leaderboard?city=dallas", expectedStatus: 200 },
  { method: "GET", path: "/api/trending?city=dallas", expectedStatus: 200 },
  { method: "GET", path: "/api/categories", expectedStatus: 200 },
  { method: "GET", path: "/api/categories/popular", expectedStatus: 200 },
  { method: "GET", path: "/api/autocomplete?q=pizza", expectedStatus: 200 },
  { method: "GET", path: "/api/search?q=pizza&city=dallas", expectedStatus: 200 },
  { method: "GET", path: "/api/auth/me", expectedStatus: 401 }, // unauthenticated
  { method: "POST", path: "/api/feedback", expectedStatus: 401 }, // unauthenticated
  { method: "GET", path: "/api/admin/perf", expectedStatus: 401 }, // unauthenticated
];

async function runSmokeTest(test: typeof SMOKE_TESTS[0]): Promise<SmokeResult> {
  const url = `${BASE_URL}${test.path}`;
  const start = performance.now();
  try {
    const res = await fetch(url, {
      method: test.method,
      headers: { "Content-Type": "application/json" },
    });
    const latency = performance.now() - start;
    return {
      endpoint: `${test.method} ${test.path}`,
      method: test.method,
      expectedStatus: test.expectedStatus,
      actualStatus: res.status,
      passed: res.status === test.expectedStatus,
      latencyMs: Math.round(latency),
    };
  } catch (err) {
    return {
      endpoint: `${test.method} ${test.path}`,
      method: test.method,
      expectedStatus: test.expectedStatus,
      actualStatus: null,
      passed: false,
      latencyMs: Math.round(performance.now() - start),
      error: String(err),
    };
  }
}

async function main() {
  console.log(`\n🔥 Smoke Testing: ${BASE_URL}\n`);

  const results: SmokeResult[] = [];
  for (const test of SMOKE_TESTS) {
    const result = await runSmokeTest(test);
    results.push(result);
    const status = result.passed ? "✅" : "❌";
    const statusCode = result.actualStatus ?? "ERR";
    console.log(`  ${status} ${result.endpoint} → ${statusCode} (${result.latencyMs}ms)`);
    if (result.error) console.log(`     Error: ${result.error}`);
  }

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const avgLatency = Math.round(results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length);

  console.log(`\n  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Results: ${passed}/${results.length} passed | Avg latency: ${avgLatency}ms`);
  console.log(`  Status: ${failed === 0 ? "ALL CLEAR ✅" : `${failed} FAILURES ❌`}`);
  console.log(`  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main();
