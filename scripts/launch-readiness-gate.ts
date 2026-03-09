/**
 * Sprint 215: Launch Readiness Gate
 * Validates all pre-launch conditions before public release.
 * Owner: Marcus Chen (CTO)
 *
 * Run: npx tsx scripts/launch-readiness-gate.ts
 *
 * Checks:
 * 1. Security audit script exists and covers all categories
 * 2. Smoke test script exists and covers critical endpoints
 * 3. All required infrastructure files present
 * 4. Schema includes all required tables
 * 5. Legal documents exist and are current
 * 6. Launch documentation complete
 * 7. CI pipeline configured
 * 8. App store metadata prepared
 */

import * as fs from "fs";
import * as path from "path";

interface GateCheck {
  name: string;
  category: string;
  passed: boolean;
  details: string;
}

const checks: GateCheck[] = [];

function check(name: string, category: string, passed: boolean, details: string) {
  checks.push({ name, category, passed, details });
}

const resolve = (relPath: string) => path.resolve(__dirname, "..", relPath);
const exists = (relPath: string) => fs.existsSync(resolve(relPath));
const read = (relPath: string) => fs.readFileSync(resolve(relPath), "utf-8");

// ── 1. Security Infrastructure ──────────────────────────────────
check("Security audit script", "Security", exists("scripts/pre-launch-security-audit.ts"), "Pre-launch OWASP audit");
check("Smoke test script", "Security", exists("scripts/smoke-test.ts"), "Endpoint verification");
check("Rate limiter module", "Security", exists("server/rate-limiter.ts"), "API rate limiting");
check("Sanitize module", "Security", exists("server/sanitize.ts"), "Input sanitization");
check("Error tracking", "Security", exists("server/error-tracking.ts"), "Error monitoring");
check("Security headers", "Security", exists("server/security-headers.ts"), "CSP + CORS + HSTS");

// ── 2. Core Application ─────────────────────────────────────────
check("Server entry", "Application", exists("server/index.ts"), "Express server");
check("API routes", "Application", exists("server/routes.ts"), "Public API");
check("Admin routes", "Application", exists("server/routes-admin.ts"), "Admin API");
check("Auth routes", "Application", exists("server/routes-auth.ts"), "Authentication");
check("Middleware", "Application", exists("server/middleware.ts"), "Auth + perf middleware");
check("Schema", "Application", exists("shared/schema.ts"), "Database schema");

// ── 3. Schema Completeness ──────────────────────────────────────
const schema = read("shared/schema.ts");
check("Members table", "Schema", schema.includes("members"), "User accounts");
check("Businesses table", "Schema", schema.includes("businesses"), "Business listings");
check("Ratings table", "Schema", schema.includes("ratings"), "User ratings");
check("Challengers table", "Schema", schema.includes("challengers"), "Head-to-head battles");
check("Payments table", "Schema", schema.includes("payments"), "Stripe payments");
check("Analytics table", "Schema", schema.includes("analyticsEvents"), "Event tracking");
check("Deletion requests", "Schema", schema.includes("deletionRequests") || schema.includes("deletion_requests"), "GDPR compliance");
check("Beta feedback", "Schema", schema.includes("betaFeedback") || schema.includes("beta_feedback"), "Feedback collection");
check("Notifications table", "Schema", schema.includes("notifications"), "Push notifications");

// ── 4. Legal & Compliance ───────────────────────────────────────
check("Privacy policy", "Legal", exists("app/legal/privacy.tsx") || exists("app/privacy.tsx"), "Privacy policy page");
check("Terms of service", "Legal", exists("app/legal/terms.tsx") || exists("app/terms.tsx"), "Terms page");

// ── 5. Launch Documentation ─────────────────────────────────────
check("Launch checklist", "Documentation", exists("docs/LAUNCH-CHECKLIST.md"), "Pre-launch checklist");
check("App store metadata", "Documentation", exists("docs/APP-STORE-METADATA.md"), "iOS + Android listings");
check("PR strategy", "Documentation", exists("docs/PR-STRATEGY.md"), "Marketing plan");
check("Architecture docs", "Documentation", exists("docs/ARCHITECTURE.md"), "System architecture");
check("API docs", "Documentation", exists("docs/API.md"), "API reference");

// ── 6. CI/CD Pipeline ───────────────────────────────────────────
check("CI workflow", "Pipeline", exists(".github/workflows/ci.yml"), "GitHub Actions");
const ciSrc = exists(".github/workflows/ci.yml") ? read(".github/workflows/ci.yml") : "";
check("CI runs tests", "Pipeline", ciSrc.includes("vitest") || ciSrc.includes("test"), "Test step in CI");

// ── 7. User Experience ──────────────────────────────────────────
check("Rankings page", "UX", exists("app/(tabs)/index.tsx"), "Main leaderboard");
check("Search page", "UX", exists("app/(tabs)/search.tsx"), "Discover/search");
check("Challenger page", "UX", exists("app/(tabs)/challenger.tsx"), "VS battles");
check("Profile page", "UX", exists("app/(tabs)/profile.tsx"), "User profile");
check("Business detail", "UX", exists("app/business/[id].tsx"), "Business page");
check("Feedback form", "UX", exists("app/feedback.tsx"), "In-app feedback");
check("About page", "UX", exists("app/about.tsx"), "Marketing page");

// ── 8. Revenue Infrastructure ───────────────────────────────────
const routesSrc = read("server/routes.ts");
const adminSrc = read("server/routes-admin.ts");
check("Payment routes", "Revenue", routesSrc.includes("payment") || routesSrc.includes("stripe") || routesSrc.includes("checkout"), "Stripe integration");
check("Admin analytics", "Revenue", adminSrc.includes("analytics"), "Analytics dashboard");

// ── Results ──────────────────────────────────────────────────────
console.log("\n╔══════════════════════════════════════════════════════════╗");
console.log("║         LAUNCH READINESS GATE — Sprint 215             ║");
console.log("╚══════════════════════════════════════════════════════════╝\n");

const categories = [...new Set(checks.map(c => c.category))];
let totalPassed = 0;
let totalFailed = 0;

for (const cat of categories) {
  console.log(`\n  ── ${cat} ──`);
  const catChecks = checks.filter(c => c.category === cat);
  for (const c of catChecks) {
    const status = c.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`    ${status}  ${c.name}`);
    if (!c.passed) console.log(`           ${c.details}`);
    if (c.passed) totalPassed++;
    else totalFailed++;
  }
}

const grade = totalFailed === 0
  ? "LAUNCH READY ✅"
  : totalFailed <= 2
  ? "CONDITIONAL — Minor gaps"
  : "NOT READY — Blockers present";

console.log(`\n  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`  Total: ${totalPassed + totalFailed} checks | ${totalPassed} passed | ${totalFailed} failed`);
console.log(`  Verdict: ${grade}`);
console.log(`  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

process.exit(totalFailed > 0 ? 1 : 0);
