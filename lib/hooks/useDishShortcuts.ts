/**
 * Sprint 312: Dynamic dish shortcuts hook
 *
 * Fetches dish leaderboards from API and cross-references with CUISINE_DISH_MAP
 * to produce enriched dish shortcuts with real entry counts.
 *
 * Falls back to static CUISINE_DISH_MAP if API is unavailable.
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/query-client";
import { CUISINE_DISH_MAP } from "@/shared/best-in-categories";

interface DishBoard {
  dishSlug: string;
  dishName: string;
  dishEmoji: string | null;
  entryCount: number;
}

export interface DishShortcut {
  slug: string;
  name: string;
  emoji: string;
  entryCount: number;
}

/**
 * Returns dish shortcuts for a given cuisine, enriched with real entry counts.
 * Falls back to static CUISINE_DISH_MAP when API data is unavailable.
 */
export function useDishShortcuts(city: string, cuisine: string | null): DishShortcut[] {
  const { data: boards = [] } = useQuery<DishBoard[]>({
    queryKey: ["dish-boards-all", city],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/dish-leaderboards?city=${encodeURIComponent(city)}`);
      if (!res.ok) return [];
      const json = await res.json();
      return (json.data || []).map((b: any) => ({
        dishSlug: b.dishSlug,
        dishName: b.dishName,
        dishEmoji: b.dishEmoji,
        entryCount: b.entryCount || 0,
      }));
    },
    staleTime: 120000,
  });

  return useMemo(() => {
    if (!cuisine) return [];

    const staticDishes = CUISINE_DISH_MAP[cuisine] || [];
    if (staticDishes.length === 0) return [];

    // Build a lookup from API data for entry counts and emoji overrides
    const boardMap = new Map<string, DishBoard>();
    for (const b of boards) {
      boardMap.set(b.dishSlug, b);
    }

    return staticDishes.map((dish) => {
      const apiBoard = boardMap.get(dish.slug);
      return {
        slug: dish.slug,
        name: apiBoard?.dishName || dish.name,
        emoji: apiBoard?.dishEmoji || dish.emoji,
        entryCount: apiBoard?.entryCount || 0,
      };
    });
  }, [cuisine, boards]);
}
