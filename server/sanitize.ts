/**
 * Input Sanitization Utilities — Sprint 109
 * Prevents XSS, SQL injection, and malformed data.
 * Owner: Nadia Kaur (Cybersecurity)
 */

/** Strip HTML tags from string input */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/** Sanitize string input — strip HTML, limit length, trim whitespace */
export function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== "string") return "";
  return stripHtml(input).slice(0, maxLength).trim();
}

/** Validate and clamp numeric input */
export function sanitizeNumber(input: unknown, min: number, max: number, fallback: number): number {
  const num = Number(input);
  if (isNaN(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

/** Sanitize email format */
export function sanitizeEmail(input: unknown): string {
  if (typeof input !== "string") return "";
  const trimmed = input.toLowerCase().trim();
  // Basic email pattern check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : "";
}

/** Sanitize slug (URL-safe) */
export function sanitizeSlug(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 100);
}
