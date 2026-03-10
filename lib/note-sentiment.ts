/**
 * Sprint 464: Note Sentiment Analysis
 *
 * Client-side keyword-based sentiment classification for rating notes.
 * Gives users real-time feedback on their note's tone.
 * NOT used for moderation — purely UX guidance.
 */

export type SentimentType = "positive" | "neutral" | "negative";

export interface SentimentResult {
  type: SentimentType;
  score: number; // -1.0 to 1.0
  label: string;
  icon: string;
  color: string;
}

const POSITIVE_WORDS = [
  "amazing", "awesome", "best", "delicious", "excellent", "fantastic", "fresh",
  "good", "great", "incredible", "love", "loved", "outstanding", "perfect",
  "recommend", "tasty", "wonderful", "worth", "favorite", "beautiful",
  "friendly", "helpful", "clean", "fast", "authentic", "generous", "heavenly",
];

const NEGATIVE_WORDS = [
  "awful", "bad", "bland", "cold", "dirty", "disgusting", "horrible",
  "never", "overpriced", "rude", "slow", "stale", "terrible", "worst",
  "disappointing", "mediocre", "underwhelming", "avoid", "waste", "gross",
  "unfriendly", "overcooked", "undercooked", "greasy", "tiny", "dry",
];

export function analyzeSentiment(text: string): SentimentResult {
  if (!text || text.trim().length < 3) {
    return { type: "neutral", score: 0, label: "", icon: "", color: "" };
  }

  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of words) {
    const cleaned = word.replace(/[^a-z]/g, "");
    if (POSITIVE_WORDS.includes(cleaned)) positiveCount++;
    if (NEGATIVE_WORDS.includes(cleaned)) negativeCount++;
  }

  const total = positiveCount + negativeCount;
  if (total === 0) {
    return { type: "neutral", score: 0, label: "", icon: "", color: "" };
  }

  const score = (positiveCount - negativeCount) / total;

  if (score > 0.2) {
    return {
      type: "positive",
      score,
      label: "Positive tone",
      icon: "happy-outline",
      color: "#2D8F4E",
    };
  }
  if (score < -0.2) {
    return {
      type: "negative",
      score,
      label: "Critical tone",
      icon: "alert-circle-outline",
      color: "#C0392B",
    };
  }
  return {
    type: "neutral",
    score,
    label: "Balanced tone",
    icon: "remove-circle-outline",
    color: "#8B8B8B",
  };
}
