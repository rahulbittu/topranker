/**
 * Sprint 197: Beta invite tracking storage.
 * Records who was invited, when, and whether they joined.
 */

import { eq } from "drizzle-orm";
import { betaInvites, members, type BetaInvite } from "@shared/schema";
import { db } from "../db";

export async function createBetaInvite(params: {
  email: string;
  displayName: string;
  referralCode: string;
  invitedBy?: string;
}): Promise<BetaInvite> {
  const [invite] = await db
    .insert(betaInvites)
    .values({
      email: params.email,
      displayName: params.displayName,
      referralCode: params.referralCode,
      invitedBy: params.invitedBy,
    })
    .returning();
  return invite;
}

export async function getBetaInviteByEmail(email: string): Promise<BetaInvite | undefined> {
  const [invite] = await db
    .select()
    .from(betaInvites)
    .where(eq(betaInvites.email, email));
  return invite;
}

export async function markBetaInviteJoined(email: string, memberId: string): Promise<void> {
  await db
    .update(betaInvites)
    .set({ status: "joined", joinedAt: new Date(), memberId })
    .where(eq(betaInvites.email, email));
}

export async function getBetaInviteStats(): Promise<{
  total: number;
  joined: number;
  pending: number;
  invites: BetaInvite[];
}> {
  const invites = await db.select().from(betaInvites);
  const joined = invites.filter(i => i.status === "joined").length;
  return {
    total: invites.length,
    joined,
    pending: invites.length - joined,
    invites,
  };
}
