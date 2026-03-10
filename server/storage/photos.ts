/**
 * Sprint 498: Business photo storage functions.
 * Extracted from storage/businesses.ts to reduce file size.
 */
import { eq, and, asc, sql } from "drizzle-orm";
import { businesses, businessPhotos } from "@shared/schema";
import { db } from "../db";

export async function getBusinessPhotos(businessId: string): Promise<string[]> {
  const rows = await db
    .select({ photoUrl: businessPhotos.photoUrl })
    .from(businessPhotos)
    .where(eq(businessPhotos.businessId, businessId))
    .orderBy(asc(businessPhotos.sortOrder))
    .limit(3);
  return rows.map(r => r.photoUrl);
}

export async function getBusinessPhotosMap(businessIds: string[]): Promise<Record<string, string[]>> {
  if (businessIds.length === 0) return {};
  const rows = await db
    .select({
      businessId: businessPhotos.businessId,
      photoUrl: businessPhotos.photoUrl,
      sortOrder: businessPhotos.sortOrder,
    })
    .from(businessPhotos)
    .where(sql`${businessPhotos.businessId} = ANY(ARRAY[${sql.join(businessIds.map(id => sql`${id}`), sql`,`)}]::text[])`)
    .orderBy(asc(businessPhotos.sortOrder));

  const map: Record<string, string[]> = {};
  for (const row of rows) {
    if (!map[row.businessId]) map[row.businessId] = [];
    if (map[row.businessId].length < 3) {
      map[row.businessId].push(row.photoUrl);
    }
  }
  return map;
}

export async function insertBusinessPhotos(
  businessId: string,
  photos: { photoUrl: string; isHero: boolean; sortOrder: number }[],
): Promise<void> {
  if (photos.length === 0) return;
  await db.insert(businessPhotos).values(
    photos.map((p) => ({
      businessId,
      photoUrl: p.photoUrl,
      isHero: p.isHero,
      sortOrder: p.sortOrder,
    })),
  );
}

export async function getBusinessesWithoutPhotos(
  city?: string,
  limit: number = 50,
): Promise<{ id: string; name: string; googlePlaceId: string; city: string }[]> {
  const rows = await db
    .select({
      id: businesses.id,
      name: businesses.name,
      googlePlaceId: businesses.googlePlaceId,
      city: businesses.city,
    })
    .from(businesses)
    .leftJoin(businessPhotos, eq(businesses.id, businessPhotos.businessId))
    .where(
      and(
        eq(businesses.isActive, true),
        sql`${businesses.googlePlaceId} IS NOT NULL`,
        sql`${businessPhotos.id} IS NULL`,
        ...(city ? [eq(businesses.city, city)] : []),
      ),
    )
    .limit(limit);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    googlePlaceId: r.googlePlaceId!,
    city: r.city,
  }));
}

export async function deleteBusinessPhotos(businessId: string): Promise<void> {
  await db.delete(businessPhotos).where(eq(businessPhotos.businessId, businessId));
}
