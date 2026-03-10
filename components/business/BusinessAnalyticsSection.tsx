/**
 * Sprint 589: Extracted from app/business/[id].tsx
 * Analytics section: score → trust → sub-scores → review summary → city comparison → claim → breakdowns → distributions → rank history
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import {
  ScoreCard, TrustExplainerCard, SubScoresCard,
  RatingDistribution, RankHistoryChart,
  type MappedRating, type RankHistoryPoint,
} from "@/components/business/SubComponents";
import { ReviewSummaryCard } from "@/components/business/ReviewSummaryCard";
import { CityComparisonCard } from "@/components/business/CityComparisonCard";
import { ClaimStatusCard } from "@/components/business/ClaimStatusCard";
import { ScoreBreakdown } from "@/components/business/ScoreBreakdown";
import { DimensionScoreCard } from "@/components/business/DimensionScoreCard";
import { DimensionComparisonCard } from "@/components/business/DimensionComparisonCard";
import { ScoreTrendSparkline } from "@/components/business/ScoreTrendSparkline";
import { TopDishes } from "@/components/business/TopDishes";
import { DishRankings } from "@/components/business/DishRankings";

interface CityStatsData {
  totalBusinesses: number;
  avgWeightedScore: number;
  avgRatingCount: number;
  avgWouldReturnPct: number;
  dimensionAvgs: Record<string, number>;
}

interface Props {
  business: {
    id: string;
    name: string;
    slug: string;
    category: string;
    city: string;
    weightedScore: number;
    ratingCount: number;
    rank: number;
    googleRating?: string | number | null;
    isClaimed: boolean;
  };
  ratings: MappedRating[];
  cityStats?: CityStatsData;
  rankHistoryData?: RankHistoryPoint[];
}

export function BusinessAnalyticsSection({ business, ratings, cityStats, rankHistoryData }: Props) {
  const avgQ1 = ratings.length > 0 ? ratings.reduce((a, r) => a + r.q1, 0) / ratings.length : 0;
  const avgQ2 = ratings.length > 0 ? ratings.reduce((a, r) => a + r.q2, 0) / ratings.length : 0;
  const avgQ3 = ratings.length > 0 ? ratings.reduce((a, r) => a + r.q3, 0) / ratings.length : 0;

  return (
    <>
      <ScoreCard
        weightedScore={business.weightedScore}
        ratingCount={business.ratingCount}
        rank={business.rank}
        googleRating={business.googleRating}
      />

      <TrustExplainerCard
        ratingCount={business.ratingCount}
        weightedScore={business.weightedScore}
        category={business.category}
        ratings={ratings}
        trustedRaterCount={ratings.filter(r => r.userTier === "trusted" || r.userTier === "top").length}
        lastRatedDate={ratings.length > 0 ? new Date(ratings[0].createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : undefined}
      />

      {ratings.length > 0 && (
        <SubScoresCard avgQ1={avgQ1} avgQ2={avgQ2} avgQ3={avgQ3} ratings={ratings} />
      )}

      <ReviewSummaryCard ratings={ratings} />

      {cityStats && cityStats.totalBusinesses > 0 && (
        <CityComparisonCard
          businessName={business.name}
          city={business.city || "Dallas"}
          bizScore={business.weightedScore}
          bizRatingCount={business.ratingCount || 0}
          bizWouldReturnPct={ratings.length > 0 ? Math.round((ratings.filter(r => r.wouldReturn).length / Math.max(1, ratings.filter(r => r.wouldReturn != null).length)) * 100) : null}
          cityAvgScore={cityStats.avgWeightedScore}
          cityAvgRatingCount={cityStats.avgRatingCount}
          cityAvgWouldReturnPct={cityStats.avgWouldReturnPct}
          cityTotalBusinesses={cityStats.totalBusinesses}
          dimensionComparisons={Object.entries(cityStats.dimensionAvgs).map(([label, cityAvg]) => ({
            label: label.charAt(0).toUpperCase() + label.slice(1),
            bizAvg: 0,
            cityAvg,
          }))}
        />
      )}

      {business.id && business.slug && <ClaimStatusCard businessId={business.id} businessSlug={business.slug} businessName={business.name} />}
      {business.id && <ScoreBreakdown businessId={business.id} category={business.category} />}
      {business.id && <DimensionScoreCard businessId={business.id} />}
      {business.id && business.city && <DimensionComparisonCard businessId={business.id} city={business.city} />}
      {business.id && <ScoreTrendSparkline businessId={business.id} />}
      {business.id && <DishRankings businessId={business.id} />}
      {business.id && <TopDishes businessId={business.id} businessName={business.name} />}

      {ratings.length >= 3 && <RatingDistribution ratings={ratings} />}

      {rankHistoryData && rankHistoryData.length >= 2 && (
        <RankHistoryChart points={rankHistoryData} />
      )}

      <View style={styles.sectionDivider} />
    </>
  );
}

const styles = StyleSheet.create({
  sectionDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
});
