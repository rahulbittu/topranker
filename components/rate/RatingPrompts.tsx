/**
 * Sprint 466: Rating Prompt Helpers
 * Extracted from RatingExtrasStep.tsx
 *
 * Visit-type-aware photo prompts (Sprint 459) and receipt hints (Sprint 462).
 * Pure functions — no React components, no state.
 */

export type VisitType = "dine_in" | "delivery" | "takeaway";

export interface PhotoPrompt {
  icon: string;
  label: string;
  hint: string;
}

// Sprint 459: Visit-type-aware photo prompts
export function getPhotoPromptsByVisitType(visitType?: VisitType | null): PhotoPrompt[] {
  switch (visitType) {
    case "delivery":
      return [
        { icon: "cube-outline", label: "Packaging", hint: "Photo the packaging & presentation" },
        { icon: "fast-food-outline", label: "Food", hint: "Show what you received" },
        { icon: "receipt-outline", label: "Order", hint: "Screenshot of your delivery order" },
      ];
    case "takeaway":
      return [
        { icon: "bag-handle-outline", label: "Takeaway bag", hint: "Photo the pickup container" },
        { icon: "restaurant-outline", label: "Food", hint: "Show the dish at home" },
        { icon: "time-outline", label: "Wait", hint: "Screenshot pickup time estimate" },
      ];
    case "dine_in":
    default:
      return [
        { icon: "restaurant-outline", label: "Dish", hint: "Photo your main dish" },
        { icon: "cafe-outline", label: "Vibe", hint: "Capture the restaurant atmosphere" },
        { icon: "happy-outline", label: "Experience", hint: "Share a memorable moment" },
      ];
  }
}

// Sprint 462: Visit-type-aware receipt hints
export function getReceiptHint(visitType?: VisitType | null): string {
  switch (visitType) {
    case "delivery":
      return "Upload your delivery confirmation or app screenshot for a Verified Purchase badge";
    case "takeaway":
      return "Upload your pickup order receipt or confirmation for a Verified Purchase badge";
    case "dine_in":
    default:
      return "Upload your restaurant receipt or bill for a Verified Purchase badge";
  }
}
