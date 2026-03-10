/**
 * Sprint 333: Database Migration Verification Script
 *
 * Checks that all tables defined in the Drizzle schema exist in the
 * target database. Reports missing tables and optionally creates them
 * via drizzle-kit push.
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/verify-schema.ts [--fix]
 *
 * Options:
 *   --fix    Run drizzle-kit push to create missing tables
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";

// All table names from shared/schema.ts (must match pgTable first arg)
const EXPECTED_TABLES = [
  "members",
  "businesses",
  "ratings",
  "rating_responses",
  "dishes",
  "dish_votes",
  "challengers",
  "rank_history",
  "business_claims",
  "business_photos",
  "qr_scans",
  "rating_flags",
  "member_badges",
  "credibility_penalties",
  "categories",
  "category_suggestions",
  "payments",
  "webhook_events",
  "featured_placements",
  "analytics_events",
  "deletion_requests",
  "dish_leaderboards",
  "dish_leaderboard_entries",
  "dish_suggestions",
  "dish_suggestion_votes",
  "notifications",
  "referrals",
  "beta_invites",
  "user_activity",
  "beta_feedback",
  "rating_photos",
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL not set");
    process.exit(1);
  }

  const shouldFix = process.argv.includes("--fix");
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  console.log("🔍 Verifying database schema...\n");
  console.log(`Target: ${databaseUrl.replace(/:[^@]*@/, ":***@")}\n`);

  // Query existing tables
  const result = await db.execute(
    sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
  );
  const existingTables = new Set((result.rows as any[]).map((r) => r.table_name));

  const missing: string[] = [];
  const present: string[] = [];

  for (const table of EXPECTED_TABLES) {
    if (existingTables.has(table)) {
      present.push(table);
    } else {
      missing.push(table);
    }
  }

  // Report
  console.log(`✅ Present: ${present.length}/${EXPECTED_TABLES.length} tables`);
  if (missing.length > 0) {
    console.log(`\n❌ Missing ${missing.length} table(s):`);
    for (const t of missing) {
      console.log(`   - ${t}`);
    }
  }

  // Check for extra tables not in schema
  const schemaSet = new Set(EXPECTED_TABLES);
  const extras = [...existingTables].filter(
    (t) => !schemaSet.has(t) && !t.startsWith("__") && t !== "session"
  );
  if (extras.length > 0) {
    console.log(`\n⚠️  Extra tables not in schema: ${extras.join(", ")}`);
  }

  if (missing.length === 0) {
    console.log("\n✅ All schema tables present. No action needed.");
    await pool.end();
    process.exit(0);
  }

  if (shouldFix) {
    console.log("\n🔧 Running drizzle-kit push to create missing tables...");
    const { execSync } = await import("child_process");
    try {
      execSync("npx drizzle-kit push", { stdio: "inherit" });
      console.log("\n✅ Schema push complete. Re-run without --fix to verify.");
    } catch (err) {
      console.error("\n❌ drizzle-kit push failed. May need manual intervention.");
      console.log("   See docs/sprints/SPRINT-333-MIGRATION-TOOLING.md for manual SQL.");
    }
  } else {
    console.log("\n💡 Run with --fix to auto-create missing tables:");
    console.log("   npx tsx --env-file=.env scripts/verify-schema.ts --fix");
  }

  await pool.end();
  process.exit(missing.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
