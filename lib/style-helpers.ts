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
