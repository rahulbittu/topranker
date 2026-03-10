/**
 * Sprint 493: Enhanced Search Autocomplete
 *
 * Extends autocomplete beyond business name/category to include:
 * 1. Dish name matching — "biryani" matches businesses that serve biryani
 * 2. Fuzzy matching — "biriyani" matches "biryani" via edit distance
 * 3. Result type tagging — each suggestion tagged as "business" or "dish"
 *
 * Pure function module — no side effects, testable in isolation.
 */

export interface AutocompleteSuggestion {
  id: string;
  text: string;
  subtext: string;
  type: "business" | "dish" | "cuisine" | "category";
  slug?: string;
  score?: number;
}

/**
 * Compute Levenshtein edit distance between two strings.
 * Used for fuzzy matching when exact prefix match fails.
 */
export function editDistance(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;

  const dp: number[][] = Array.from({ length: la + 1 }, () => Array(lb + 1).fill(0));
  for (let i = 0; i <= la; i++) dp[i][0] = i;
  for (let j = 0; j <= lb; j++) dp[0][j] = j;

  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[la][lb];
}

/**
 * Check if query is a fuzzy match for target (within edit distance threshold).
 * Threshold: max 2 edits for words >= 4 chars, max 1 for shorter.
 */
export function isFuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  // Exact prefix match — always passes
  if (t.startsWith(q)) return true;

  // Contains match
  if (t.includes(q)) return true;

  // Edit distance check for typo tolerance
  const threshold = q.length >= 4 ? 2 : 1;
  const dist = editDistance(q, t.slice(0, q.length + threshold));
  return dist <= threshold;
}

/**
 * Score a suggestion for relevance ranking.
 * Lower = better. Exact prefix > contains > fuzzy.
 */
export function scoreSuggestion(query: string, text: string, type: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();

  let score = 0;

  // Type priority: business > dish > cuisine > category
  if (type === "business") score += 0;
  else if (type === "dish") score += 10;
  else if (type === "cuisine") score += 20;
  else score += 30;

  // Match quality
  if (t.startsWith(q)) score += 0;
  else if (t.includes(q)) score += 5;
  else score += 10 + editDistance(q, t.slice(0, q.length + 2));

  return score;
}

/**
 * Merge and deduplicate suggestions from multiple sources.
 * Keeps top N sorted by relevance score.
 */
export function mergeSuggestions(
  suggestions: AutocompleteSuggestion[],
  limit: number = 8,
): AutocompleteSuggestion[] {
  const seen = new Set<string>();
  const unique: AutocompleteSuggestion[] = [];

  for (const s of suggestions) {
    const key = `${s.type}:${s.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(s);
    }
  }

  return unique
    .sort((a, b) => (a.score ?? 50) - (b.score ?? 50))
    .slice(0, limit);
}

/**
 * Build dish-based suggestions from dish vote data.
 * Maps dish names to the businesses that serve them.
 */
export function buildDishSuggestions(
  query: string,
  dishes: { name: string; businessName: string; businessSlug: string; businessId: string; voteCount: number }[],
): AutocompleteSuggestion[] {
  const q = query.toLowerCase();
  const results: AutocompleteSuggestion[] = [];

  for (const dish of dishes) {
    if (isFuzzyMatch(q, dish.name)) {
      results.push({
        id: `dish-${dish.businessId}-${dish.name}`,
        text: dish.name,
        subtext: `at ${dish.businessName} (${dish.voteCount} votes)`,
        type: "dish",
        slug: dish.businessSlug,
        score: scoreSuggestion(q, dish.name, "dish"),
      });
    }
  }

  return results;
}
