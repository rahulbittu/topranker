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
import { Analytics } from "@/lib/analytics";

type VisitType = "dine_in" | "delivery" | "takeaway";

// Sprint 266: Async photo upload after rating submission
async function uploadRatingPhoto(ratingId: string, uri: string): Promise<void> {
  // Read the photo file as base64
  const response = await fetch(uri);
  const blob = await response.blob();
  const reader = new FileReader();
  const base64 = await new Promise<string>((resolve, reject) => {
    reader.onloadend = () => {
      const result = reader.result as string;
      // Strip data URL prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const mimeType = blob.type || "image/jpeg";
  await apiRequest("POST", `/api/ratings/${ratingId}/photo`, {
    data: base64,
    mimeType,
    isReceipt: false,
  });
}

interface UseRatingSubmitOptions {
  slug: string;
  businessId?: string;
  q1Score: number;
  q2Score: number;
  q3Score: number;
  wouldReturn: boolean | null;
  visitType: VisitType | null;
  selectedDish: string;
  dishInput: string;
  note: string;
  photoUri: string | null;
  timeOnPageMs: number;
  // Sprint 343: Per-dimension timing (ms spent on each scoring dimension)
  dimensionTimingMs?: number[];
  onSuccess: () => void;
  onBadgeEarned: (badge: Badge) => void;
  setSubmitError: (msg: string) => void;
}

export function useRatingSubmit({
  slug,
  businessId,
  q1Score, q2Score, q3Score,
  wouldReturn,
  visitType,
  selectedDish,
  dishInput,
  note,
  photoUri,
  timeOnPageMs,
  dimensionTimingMs,
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
        visitType: visitType || undefined,
        dishName: dishName || undefined,
        note: note.trim() || undefined,
        timeOnPageMs: timeOnPageMs > 0 ? timeOnPageMs : undefined,
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
      } else if (msg.includes("business owner") || msg.includes("cannot rate your own")) {
        setSubmitError("As the business owner, you cannot rate your own restaurant. This ensures trust and fairness.");
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

      // Sprint 343: Track per-dimension timing analytics
      if (dimensionTimingMs && dimensionTimingMs.some(t => t > 0)) {
        const timingPayload = {
          businessId,
          visitType: visitType || "dine_in",
          q1Ms: dimensionTimingMs[0] || 0,
          q2Ms: dimensionTimingMs[1] || 0,
          q3Ms: dimensionTimingMs[2] || 0,
          returnMs: dimensionTimingMs[3] || 0,
          totalMs: dimensionTimingMs.reduce((a, b) => a + b, 0),
        };
        Analytics.track("rate_dimension_timing", timingPayload);
        // Sprint 356: Report timing to server for admin aggregation
        apiRequest("POST", "/api/analytics/dimension-timing", timingPayload).catch(() => {});
      }

      // Sprint 266: Async photo upload — doesn't block confirmation
      const ratingId = responseData?.data?.rating?.id;
      if (photoUri && ratingId) {
        uploadRatingPhoto(ratingId, photoUri).then(() => {
          qc.invalidateQueries({ queryKey: ["business", slug] });
        }).catch(() => {
          // Photo upload failure is non-critical — rating already submitted
        });
      }

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
