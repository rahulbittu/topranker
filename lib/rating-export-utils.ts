/**
 * Sprint 461: Rating Export Utilities
 * Extracted from components/profile/RatingExport.tsx (Sprint 433/454)
 *
 * Pure utility functions for rating data export: CSV generation,
 * JSON formatting, summary stats, date filtering.
 */

export type ExportFormat = "csv" | "json";

export interface ExportableRating {
  businessName: string;
  businessSlug?: string;
  rawScore: string;
  weight: string;
  weightedScore: string;
  q1Score: number;
  q2Score: number;
  q3Score: number;
  wouldReturn: boolean;
  note: string | null;
  visitType?: string;
  createdAt: string;
}

const CSV_HEADERS = [
  "Business", "Date", "Visit Type", "Overall Score", "Food", "Dimension 2", "Dimension 3",
  "Would Return", "Weight", "Weighted Score", "Note",
];

export function escapeCSV(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function getVisitTypeLabel(vt?: string): string {
  if (vt === "dine_in") return "Dine-in";
  if (vt === "delivery") return "Delivery";
  if (vt === "takeaway") return "Takeaway";
  return "Unknown";
}

export function ratingsToCSV(ratings: ExportableRating[]): string {
  const rows = [CSV_HEADERS.join(",")];
  for (const r of ratings) {
    const vt = r.visitType || "dine_in";
    const dim2Label = vt === "dine_in" ? "Service" : vt === "delivery" ? "Packaging" : "Wait Time";
    const dim3Label = vt === "dine_in" ? "Vibe" : "Value";
    const date = new Date(r.createdAt).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
    rows.push([
      escapeCSV(r.businessName),
      date,
      getVisitTypeLabel(r.visitType),
      parseFloat(r.rawScore).toFixed(1),
      String(r.q1Score),
      `${r.q2Score} (${dim2Label})`,
      `${r.q3Score} (${dim3Label})`,
      r.wouldReturn ? "Yes" : "No",
      parseFloat(r.weight).toFixed(2),
      parseFloat(r.weightedScore).toFixed(2),
      escapeCSV(r.note || ""),
    ].join(","));
  }
  return rows.join("\n");
}

// Sprint 454: Summary statistics for export
export function computeExportSummary(ratings: ExportableRating[]) {
  if (ratings.length === 0) return null;
  const scores = ratings.map(r => parseFloat(r.rawScore));
  const weights = ratings.map(r => parseFloat(r.weight));
  const wouldReturnCount = ratings.filter(r => r.wouldReturn).length;
  const visitTypes: Record<string, number> = {};
  for (const r of ratings) {
    const vt = getVisitTypeLabel(r.visitType);
    visitTypes[vt] = (visitTypes[vt] || 0) + 1;
  }
  return {
    totalRatings: ratings.length,
    avgScore: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
    avgWeight: (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(2),
    wouldReturnPct: Math.round((wouldReturnCount / ratings.length) * 100),
    visitTypes,
    dateRange: {
      earliest: ratings.map(r => r.createdAt).sort()[0],
      latest: ratings.map(r => r.createdAt).sort().reverse()[0],
    },
  };
}

// Sprint 454: JSON export format
export function ratingsToJSON(ratings: ExportableRating[], username: string): string {
  const summary = computeExportSummary(ratings);
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    username,
    summary,
    ratings: ratings.map(r => ({
      business: r.businessName,
      slug: r.businessSlug || null,
      date: r.createdAt,
      visitType: getVisitTypeLabel(r.visitType),
      overallScore: parseFloat(r.rawScore),
      food: r.q1Score,
      dimension2: r.q2Score,
      dimension3: r.q3Score,
      wouldReturn: r.wouldReturn,
      weight: parseFloat(r.weight),
      weightedScore: parseFloat(r.weightedScore),
      note: r.note || null,
    })),
  }, null, 2);
}

// Sprint 454: Filter ratings by date range
export function filterByDateRange(
  ratings: ExportableRating[],
  startDate?: string,
  endDate?: string,
): ExportableRating[] {
  let filtered = ratings;
  if (startDate) {
    const start = new Date(startDate).getTime();
    filtered = filtered.filter(r => new Date(r.createdAt).getTime() >= start);
  }
  if (endDate) {
    const end = new Date(endDate).getTime() + 86400000; // inclusive end
    filtered = filtered.filter(r => new Date(r.createdAt).getTime() < end);
  }
  return filtered;
}
