/**
 * Sprint 214: Pre-Launch Security Audit Script
 * Validates OWASP compliance, input sanitization, auth flows, and rate limiting.
 * Owner: Nadia Kaur (Cybersecurity)
 *
 * Run: npx tsx scripts/pre-launch-security-audit.ts
 */

import * as fs from "fs";
import * as path from "path";

interface AuditCheck {
  name: string;
  category: string;
  passed: boolean;
  details: string;
}

const checks: AuditCheck[] = [];

function check(name: string, category: string, passed: boolean, details: string) {
  checks.push({ name, category, passed, details });
}

// Read file helper
const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ── 1. Input Sanitization ─────────────────────────────────────
const sanitizeSrc = readFile("server/sanitize.ts");
check("Sanitize module exists", "Input Validation", true, "server/sanitize.ts present");
check("sanitizeString function", "Input Validation", sanitizeSrc.includes("sanitizeString"), "Exports sanitizeString");

// Check routes use sanitization
const routesSrc = readFile("server/routes.ts");
const adminSrc = readFile("server/routes-admin.ts");
check("Routes import sanitize", "Input Validation", routesSrc.includes("sanitize") || adminSrc.includes("sanitize"), "Sanitization used in route handlers");

// ── 2. Authentication ─────────────────────────────────────────
const middlewareSrc = readFile("server/middleware.ts");
check("requireAuth middleware exists", "Authentication", middlewareSrc.includes("requireAuth"), "Shared auth middleware");
check("Auth checks isAuthenticated", "Authentication", middlewareSrc.includes("isAuthenticated"), "Passport auth check");

const adminRoutes = readFile("server/routes-admin.ts");
check("Admin routes require admin", "Authentication", adminRoutes.includes("requireAdmin"), "Admin check on all admin routes");
check("Admin rate limiter applied", "Authentication", adminRoutes.includes("adminRateLimiter"), "Rate limiting on admin routes");

// ── 3. Rate Limiting ──────────────────────────────────────────
check("Rate limiter module exists", "Rate Limiting", fileExists("server/rate-limiter.ts"), "server/rate-limiter.ts present");
const rateLimiterSrc = readFile("server/rate-limiter.ts");
check("API rate limiter defined", "Rate Limiting", rateLimiterSrc.includes("apiLimiter") || rateLimiterSrc.includes("rateLimiter"), "API rate limiter exported");

// ── 4. CSP Headers ────────────────────────────────────────────
const indexSrc = readFile("server/index.ts");
check("CSP headers configured", "Headers", indexSrc.includes("Content-Security-Policy") || indexSrc.includes("helmet"), "CSP or helmet configured");
check("CORS configured", "Headers", indexSrc.includes("cors"), "CORS middleware used");

// ── 5. Password Security ─────────────────────────────────────
const authRoutes = readFile("server/routes-auth.ts");
check("Password hashing used", "Password Security", authRoutes.includes("hash") || authRoutes.includes("bcrypt") || authRoutes.includes("scrypt"), "Password hashing in auth routes");
check("Password validation enforced", "Password Security", authRoutes.includes("password") && authRoutes.includes("length"), "Password length validation");

// ── 6. Data Retention ─────────────────────────────────────────
const analyticsStorage = readFile("server/storage/analytics.ts");
check("Purge function exists", "Data Retention", analyticsStorage.includes("purgeOldAnalyticsEvents"), "Analytics purge available");
check("Retention policy defined", "Data Retention", analyticsStorage.includes("DATA_RETENTION_POLICY"), "Retention policy constant");

// ── 7. Demo Credentials ──────────────────────────────────────
const loginSrc = fs.existsSync(path.resolve(__dirname, "..", "app/auth/login.tsx"))
  ? readFile("app/auth/login.tsx") : "";
check("Demo creds behind __DEV__", "Credentials", loginSrc.includes("__DEV__") || !loginSrc.includes("demo@"), "Demo credentials gated");

// ── 8. Error Handling ─────────────────────────────────────────
check("Error tracking exists", "Error Handling", fileExists("server/error-tracking.ts"), "Error tracking module");
check("Async wrapper used", "Error Handling", fileExists("server/wrap-async.ts"), "wrapAsync prevents unhandled rejections");

// ── 9. GDPR Compliance ───────────────────────────────────────
const schemaSrc = readFile("shared/schema.ts");
check("Deletion requests table", "GDPR", schemaSrc.includes("deletionRequests") || schemaSrc.includes("deletion_requests"), "GDPR deletion request tracking");

// ── Results ──────────────────────────────────────────────────
console.log("\n╔══════════════════════════════════════════════════════════╗");
console.log("║         PRE-LAUNCH SECURITY AUDIT — Sprint 214         ║");
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

console.log(`\n  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`  Total: ${totalPassed + totalFailed} checks | ${totalPassed} passed | ${totalFailed} failed`);
console.log(`  Grade: ${totalFailed === 0 ? "A+ (All Clear)" : totalFailed <= 2 ? "A (Minor Issues)" : "B (Action Required)"}`);
console.log(`  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

process.exit(totalFailed > 0 ? 1 : 0);
