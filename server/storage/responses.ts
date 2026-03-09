/**
 * Rating Responses Storage — Sprint 177
 * Business owners can respond to individual ratings on their dashboard.
 */
import { eq, and, desc, inArray } from "drizzle-orm";
import { ratingResponses, type RatingResponse } from "@shared/schema";
import { db } from "../db";

export async function submitRatingResponse(
  ratingId: string,
  businessId: string,
  ownerId: string,
  responseText: string,
): Promise<RatingResponse> {
  // Upsert: if response exists for this rating, update it
  const [existing] = await db
    .select()
    .from(ratingResponses)
    .where(eq(ratingResponses.ratingId, ratingId));

  if (existing) {
    const [updated] = await db
      .update(ratingResponses)
      .set({ responseText, updatedAt: new Date() })
      .where(eq(ratingResponses.id, existing.id))
      .returning();
    return updated;
  }

  const [response] = await db
    .insert(ratingResponses)
    .values({ ratingId, businessId, ownerId, responseText })
    .returning();
  return response;
}

export async function getRatingResponse(
  ratingId: string,
): Promise<RatingResponse | undefined> {
  const [response] = await db
    .select()
    .from(ratingResponses)
    .where(eq(ratingResponses.ratingId, ratingId));
  return response;
}

export async function getBusinessResponses(
  businessId: string,
  limit: number = 20,
): Promise<RatingResponse[]> {
  return db
    .select()
    .from(ratingResponses)
    .where(eq(ratingResponses.businessId, businessId))
    .orderBy(desc(ratingResponses.createdAt))
    .limit(limit);
}

export async function getResponsesForRatings(
  ratingIds: string[],
): Promise<Record<string, RatingResponse>> {
  if (ratingIds.length === 0) return {};
  const responses = await db
    .select()
    .from(ratingResponses)
    .where(inArray(ratingResponses.ratingId, ratingIds));
  const map: Record<string, RatingResponse> = {};
  for (const r of responses) {
    map[r.ratingId] = r;
  }
  return map;
}

export async function deleteRatingResponse(
  ratingId: string,
  ownerId: string,
): Promise<boolean> {
  const [deleted] = await db
    .delete(ratingResponses)
    .where(
      and(
        eq(ratingResponses.ratingId, ratingId),
        eq(ratingResponses.ownerId, ownerId),
      ),
    )
    .returning();
  return !!deleted;
}
