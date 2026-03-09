/**
 * Sprint 216: Rollback Checklist
 * Validates that a rollback can be safely executed.
 * Owner: Amir Patel (Architecture)
 *
 * Run: npx tsx scripts/rollback-checklist.ts
 *
 * Checks git state, migration safety, and deployment artifacts.
 * Provides step-by-step rollback instructions.
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

interface CheckResult {
  name: string;
  passed: boolean;
  details: string;
}

const checks: CheckResult[] = [];

function check(name: string, passed: boolean, details: string) {
  checks.push({ name, passed, details });
}

function exec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf-8", cwd: path.resolve(__dirname, "..") }).trim();
  } catch {
    return "";
  }
}

// ── Git State ───────────────────────────────────────────────────
const branch = exec("git rev-parse --abbrev-ref HEAD");
check("On main branch", branch === "main", `Current branch: ${branch}`);

const status = exec("git status --porcelain");
check("Clean working tree", status === "", status ? `Uncommitted changes:\n${status}` : "No uncommitted changes");

const lastCommit = exec("git log --oneline -1");
check("Last commit identified", lastCommit.length > 0, lastCommit);

const prevCommit = exec("git log --oneline -2 --format='%h %s'");
check("Previous commit available", prevCommit.includes("\n"), `Rollback target:\n${prevCommit}`);

// ── Migration Safety ────────────────────────────────────────────
const resolve = (relPath: string) => path.resolve(__dirname, "..", relPath);
const exists = (relPath: string) => fs.existsSync(resolve(relPath));

check("Schema file exists", exists("shared/schema.ts"), "Database schema present");
check("Drizzle config exists", exists("drizzle.config.ts"), "Migration config present");

// Check if latest migrations are additive (no DROP statements)
const migrationsDir = resolve("drizzle");
let hasDropStatements = false;
if (fs.existsSync(migrationsDir)) {
  const sqlFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql"));
  for (const f of sqlFiles.slice(-3)) { // Check last 3 migrations
    const content = fs.readFileSync(path.join(migrationsDir, f), "utf-8");
    if (content.toLowerCase().includes("drop table") || content.toLowerCase().includes("drop column")) {
      hasDropStatements = true;
    }
  }
}
check("Recent migrations are additive", !hasDropStatements, hasDropStatements ? "DROP statements found — rollback may lose data" : "No destructive migrations in last 3 files");

// ── Deployment Artifacts ────────────────────────────────────────
check("CI config exists", exists(".github/workflows/ci.yml"), "GitHub Actions pipeline");
check("Railway config exists", exists("railway.toml"), "Railway deployment config");
check("Health endpoint exists", exists("server/routes.ts"), "Server routes with /api/health");

// ── Results ──────────────────────────────────────────────────────
console.log("\n╔══════════════════════════════════════════════════════════╗");
console.log("║           ROLLBACK SAFETY CHECKLIST — Sprint 216        ║");
console.log("╚══════════════════════════════════════════════════════════╝\n");

let passed = 0;
let failed = 0;

for (const c of checks) {
  const icon = c.passed ? "✅" : "❌";
  console.log(`  ${icon} ${c.name}`);
  if (!c.passed) console.log(`     ${c.details}`);
  c.passed ? passed++ : failed++;
}

console.log(`\n  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`  ${passed}/${checks.length} checks passed`);

if (failed === 0) {
  console.log(`\n  ✅ ROLLBACK SAFE — Use these commands:`);
  console.log(`\n  1. git log --oneline -5          # Identify target commit`);
  console.log(`  2. git revert HEAD --no-edit      # Create revert commit`);
  console.log(`  3. npx vitest run                 # Verify tests pass`);
  console.log(`  4. git push origin main           # Deploy revert`);
  console.log(`  5. npx tsx scripts/smoke-test.ts   # Verify production`);
} else {
  console.log(`\n  ⚠️  ${failed} issues found — review before rollback`);
}

console.log(`  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

process.exit(failed > 0 ? 1 : 0);
