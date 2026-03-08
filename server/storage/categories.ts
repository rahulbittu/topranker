/**
 * Category Storage — DB operations for categories and suggestions
 * Owner: Sage (Backend Engineer #2)
 */
import { db } from "../db";
import { categories, categorySuggestions } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export async function getDbCategories(activeOnly = true) {
  if (activeOnly) {
    return db.select().from(categories).where(eq(categories.isActive, true));
  }
  return db.select().from(categories);
}

export async function createCategorySuggestion(data: {
  name: string;
  description: string;
  vertical: string;
  suggestedBy: string;
}) {
  const [suggestion] = await db
    .insert(categorySuggestions)
    .values({
      name: data.name,
      description: data.description,
      vertical: data.vertical,
      suggestedBy: data.suggestedBy,
    })
    .returning();
  return suggestion;
}

export async function getPendingSuggestions() {
  return db
    .select()
    .from(categorySuggestions)
    .where(eq(categorySuggestions.status, "pending"))
    .orderBy(desc(categorySuggestions.voteCount));
}

export async function reviewSuggestion(
  id: string,
  status: "approved" | "rejected",
  reviewedBy: string,
) {
  const [updated] = await db
    .update(categorySuggestions)
    .set({ status, reviewedBy, reviewedAt: new Date() })
    .where(eq(categorySuggestions.id, id))
    .returning();
  return updated;
}
