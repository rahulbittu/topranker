/**
 * Seed Categories — Populate categories table from CategoryRegistry
 * Owner: Sage (Backend Engineer #2)
 *
 * Run: npx tsx server/seed-categories.ts
 * Idempotent — uses ON CONFLICT DO NOTHING on slug.
 */
import { db } from "./db";
import { categories } from "@shared/schema";
import { CATEGORY_REGISTRY } from "@/lib/category-registry";
import { sql } from "drizzle-orm";

export async function seedCategories() {
  let inserted = 0;

  for (const cat of CATEGORY_REGISTRY) {
    const result = await db
      .insert(categories)
      .values({
        slug: cat.slug,
        label: cat.label,
        emoji: cat.emoji,
        vertical: cat.vertical,
        atAGlanceFields: cat.atAGlanceFields,
        scoringHints: cat.scoringHints,
        isActive: cat.isActive,
      })
      .onConflictDoNothing({ target: categories.slug });

    if (result.rowCount && result.rowCount > 0) {
      inserted++;
    }
  }

  return { total: CATEGORY_REGISTRY.length, inserted };
}

// Direct execution
if (require.main === module) {
  seedCategories()
    .then(({ total, inserted }) => {
      console.log(`Seeded ${inserted}/${total} categories`);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}
