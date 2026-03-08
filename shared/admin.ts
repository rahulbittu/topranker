/**
 * Single source of truth for admin email whitelist.
 * Phase 1: Shared constant (Sprint 56)
 * Phase 2: Database-stored RBAC (Sprint 57-58)
 */
export const ADMIN_EMAILS: readonly string[] = Object.freeze([
  "rahul@topranker.com",
  "admin@topranker.com",
]);

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
