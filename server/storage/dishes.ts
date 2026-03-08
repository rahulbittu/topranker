import { eq, and, desc, sql } from "drizzle-orm";
import { dishes, type Dish } from "@shared/schema";
import { db } from "../db";

export async function getBusinessDishes(
  businessId: string,
  limit: number = 5,
): Promise<Dish[]> {
  return db
    .select()
    .from(dishes)
    .where(and(eq(dishes.businessId, businessId), eq(dishes.isActive, true)))
    .orderBy(desc(dishes.voteCount))
    .limit(limit);
}

export async function searchDishes(
  businessId: string,
  query: string,
): Promise<Dish[]> {
  const normalized = query.slice(0, 100).replace(/[%_\\]/g, "").toLowerCase().trim();

  if (normalized.length < 2) {
    return getBusinessDishes(businessId, 5);
  }

  let results = await db
    .select()
    .from(dishes)
    .where(
      and(
        eq(dishes.businessId, businessId),
        eq(dishes.isActive, true),
        sql`${dishes.nameNormalized} ILIKE ${normalized + "%"}`,
      ),
    )
    .orderBy(desc(dishes.voteCount))
    .limit(5);

  if (results.length < 3) {
    const containsResults = await db
      .select()
      .from(dishes)
      .where(
        and(
          eq(dishes.businessId, businessId),
          eq(dishes.isActive, true),
          sql`${dishes.nameNormalized} ILIKE ${"%" + normalized + "%"}`,
        ),
      )
      .orderBy(desc(dishes.voteCount))
      .limit(5);

    const existingIds = new Set(results.map(r => r.id));
    for (const r of containsResults) {
      if (!existingIds.has(r.id)) {
        results.push(r);
      }
    }
  }

  return results.slice(0, 5);
}
