/**
 * Sprint 478: Business Owner Dashboard Analytics
 *
 * Pure utility functions for computing dashboard-specific analytics:
 * - Weekly/monthly rating volume (for sparkline charts)
 * - Rating velocity trends
 * - Dimension score breakdown over time
 */

export interface RatingVolumePoint {
  period: string;   // ISO date string for start of period
  count: number;    // Number of ratings in this period
  avgScore: number; // Average raw score in this period
}

export interface DashboardTrend {
  weeklyVolume: RatingVolumePoint[];   // Last 12 weeks
  monthlyVolume: RatingVolumePoint[];  // Last 6 months
  velocityChange: number;              // % change in rating frequency (current vs previous period)
  sparklineScores: number[];           // Last 20 ratings' scores for sparkline
}

/**
 * Compute weekly rating volume for the last N weeks.
 */
export function computeWeeklyVolume(
  ratings: { createdAt: string; rawScore: string }[],
  weeks: number = 12,
): RatingVolumePoint[] {
  const now = new Date();
  const result: RatingVolumePoint[] = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const weekStart = new Date(now.getTime() - (w + 1) * 7 * 86400000);
    const weekEnd = new Date(now.getTime() - w * 7 * 86400000);
    const weekRatings = ratings.filter(r => {
      const d = new Date(r.createdAt).getTime();
      return d >= weekStart.getTime() && d < weekEnd.getTime();
    });
    const scores = weekRatings.map(r => parseFloat(r.rawScore));
    result.push({
      period: weekStart.toISOString().split("T")[0],
      count: weekRatings.length,
      avgScore: scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : 0,
    });
  }

  return result;
}

/**
 * Compute monthly rating volume for the last N months.
 */
export function computeMonthlyVolume(
  ratings: { createdAt: string; rawScore: string }[],
  months: number = 6,
): RatingVolumePoint[] {
  const now = new Date();
  const result: RatingVolumePoint[] = [];

  for (let m = months - 1; m >= 0; m--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 1);
    const monthRatings = ratings.filter(r => {
      const d = new Date(r.createdAt).getTime();
      return d >= monthStart.getTime() && d < monthEnd.getTime();
    });
    const scores = monthRatings.map(r => parseFloat(r.rawScore));
    result.push({
      period: monthStart.toISOString().split("T")[0],
      count: monthRatings.length,
      avgScore: scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : 0,
    });
  }

  return result;
}

/**
 * Compute velocity change: % change in ratings this period vs previous period.
 */
export function computeVelocityChange(weeklyVolume: RatingVolumePoint[]): number {
  if (weeklyVolume.length < 4) return 0;
  const recent = weeklyVolume.slice(-2).reduce((sum, w) => sum + w.count, 0);
  const previous = weeklyVolume.slice(-4, -2).reduce((sum, w) => sum + w.count, 0);
  if (previous === 0) return recent > 0 ? 100 : 0;
  return Math.round(((recent - previous) / previous) * 100);
}

/**
 * Extract sparkline scores from the most recent N ratings.
 */
export function extractSparklineScores(
  ratings: { rawScore: string }[],
  limit: number = 20,
): number[] {
  return ratings
    .slice(0, limit)
    .map(r => parseFloat(r.rawScore))
    .reverse(); // Oldest to newest for chart rendering
}

/**
 * Build complete dashboard trend data.
 */
export function buildDashboardTrend(
  ratings: { createdAt: string; rawScore: string }[],
): DashboardTrend {
  const weeklyVolume = computeWeeklyVolume(ratings);
  const monthlyVolume = computeMonthlyVolume(ratings);
  return {
    weeklyVolume,
    monthlyVolume,
    velocityChange: computeVelocityChange(weeklyVolume),
    sparklineScores: extractSparklineScores(ratings),
  };
}
