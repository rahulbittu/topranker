/**
 * useRatingSubmit — extracted from app/rate/[id].tsx (Sprint 172)
 * Handles rating mutation, optimistic updates, badge detection, and error mapping.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { apiRequest } from "@/lib/query-client";
import { hapticRatingSuccess, hapticConfetti } from "@/lib/audio";
import { setRatingImpact } from "@/lib/rating-impact";
import { getBadgeById, type Badge } from "@/lib/badges";
import { awardBadgeApi } from "@/lib/api";

interface UseRatingSubmitOptions {
  slug: string;
  businessId?: string;
  q1Score: number;
  q2Score: number;
  q3Score: number;
  wouldReturn: boolean | null;
  selectedDish: string;
  dishInput: string;
  note: string;
  onSuccess: () => void;
  onBadgeEarned: (badge: Badge) => void;
  setSubmitError: (msg: string) => void;
}

export function useRatingSubmit({
  slug,
  businessId,
  q1Score, q2Score, q3Score,
  wouldReturn,
  selectedDish,
  dishInput,
  note,
  onSuccess,
  onBadgeEarned,
  setSubmitError,
}: UseRatingSubmitOptions) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!businessId) throw new Error("Business not found");
      const dishName = selectedDish || (dishInput.trim() || undefined);
      const res = await apiRequest("POST", "/api/ratings", {
        businessId,
        q1Score,
        q2Score,
        q3Score,
        wouldReturn,
        dishName: dishName || undefined,
        note: note.trim() || undefined,
      });
      return res.json();
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["business", slug] });
      const prev = qc.getQueryData(["business", slug]);
      if (prev && typeof prev === "object" && "totalRatings" in (prev as any)) {
        qc.setQueryData(["business", slug], (old: any) => ({
          ...old,
          totalRatings: (old?.totalRatings ?? 0) + 1,
        }));
      }
      return { prev };
    },
    onError: (err: Error, _vars: void, context: { prev?: unknown } | undefined) => {
      if (context?.prev) {
        qc.setQueryData(["business", slug], context.prev);
      }
      const msg = err.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("Network")) {
        setSubmitError("No internet connection. Please check your network and try again.");
      } else if (msg.includes("401")) {
        setSubmitError("Your session has expired. Please sign in again.");
      } else if (msg.includes("Already rated today") || msg.includes("already rated")) {
        setSubmitError("You've already rated this place today. Come back tomorrow to rate again!");
      } else if (msg.includes("3+ days") || msg.includes("days old")) {
        setSubmitError("Your account needs a few more days before you can rate. This helps us prevent fake reviews.");
      } else if (msg.includes("suspended") || msg.includes("banned")) {
        setSubmitError("Your account has been suspended. Please contact support for more information.");
      } else {
        setSubmitError(msg || "Failed to submit rating. Please try again.");
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["business", slug] });
    },
    onSuccess: (responseData: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (responseData?.data?.prevRank && responseData?.data?.newRank && slug) {
        setRatingImpact(slug, responseData.data.prevRank, responseData.data.newRank);
      }
      qc.invalidateQueries({ queryKey: ["profile"] });
      onSuccess();
      hapticRatingSuccess();
      setTimeout(() => hapticConfetti(), 300);

      const milestoneBadgeMap: Record<number, string> = {
        1: "first-taste", 5: "getting-started", 10: "ten-strong",
        25: "quarter-century", 50: "half-century", 100: "centurion",
        250: "rating-machine", 500: "legendary-judge",
      };
      const streakBadgeMap: Record<number, string> = {
        3: "three-day-streak", 7: "week-warrior",
        14: "two-week-streak", 30: "monthly-devotion",
      };
      const profileData = qc.getQueryData<{
        totalRatings?: number;
        currentStreak?: number;
      }>(["profile"]);
      const newTotal = (profileData?.totalRatings ?? 0) + 1;
      const newStreak = (profileData?.currentStreak ?? 0) + 1;

      const milestoneBadgeId = milestoneBadgeMap[newTotal];
      const streakBadgeId = streakBadgeMap[newStreak];
      const badgeId = milestoneBadgeId || streakBadgeId;

      if (badgeId) {
        const badge = getBadgeById(badgeId);
        if (badge) {
          setTimeout(() => onBadgeEarned(badge), 1500);
          awardBadgeApi(badge.id, badge.category).catch(() => {});
        }
      }
    },
  });
}
