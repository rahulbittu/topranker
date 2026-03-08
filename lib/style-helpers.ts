/**
 * Style Helpers — Type-safe React Native style utilities
 * Owner: Mei Lin (Type Safety Lead)
 *
 * Eliminates `as any` casts for DimensionValue percentages.
 * React Native expects DimensionValue for width/height but template literals
 * like `${n}%` are typed as `string`, not `DimensionValue`.
 */
import type { DimensionValue } from "react-native";

/**
 * Type-safe percentage for width/height styles.
 * Usage: `{ width: pct(75) }` instead of `{ width: '75%' as any }`
 */
export function pct(n: number): DimensionValue {
  return `${n}%` as DimensionValue;
}

/**
 * Format large numbers for display. Reduces false precision.
 * 893.233 → "893"  |  2235.65 → "2.2k"  |  45123 → "45.1k"
 */
export function formatCompact(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return Math.round(n).toLocaleString();
}

/**
 * Format "Would Return" percentage safely for low-data cases.
 * Returns "--" when sample size is too small to be meaningful.
 */
export function formatReturnRate(positiveCount: number, totalCount: number): string {
  if (totalCount < 2) return "--";
  return `${Math.round((positiveCount / totalCount) * 100)}%`;
}
