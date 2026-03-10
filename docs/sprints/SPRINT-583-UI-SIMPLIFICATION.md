# Sprint 583: UI Simplification — Ruthless Clarity Pass

**Date:** 2026-03-10
**Story Points:** 5
**Status:** Complete

## Mission

Strip away overlapping systems, gamification bloat, and tertiary noise from the three core screens. Every pixel should serve one purpose: **"Find the best specific thing in your city, and understand why it's ranked there."**

## Team Discussion

**Marcus Chen (CTO):** "We had 23+ components on Profile, 25-30 stacked cards on Business Detail, and a sticky cuisine bar duplicating the header on Rankings. Three screens trying to be five products. This sprint makes them one product."

**Sarah Nakamura (Lead Eng):** "Profile went from 465 to 359 LOC — a 23% reduction. We removed 10 component imports. The screen now has identity card, credibility score, impact, rating history, saved places. That's it. That's what matters."

**Amir Patel (Architecture):** "On Business Detail, we removed 7 components: DimensionScoreCard, DimensionComparisonCard, ReviewSummaryCard, CityComparisonCard, SharePreviewCard, RankConfidenceIndicator, and the business badges section. SubScoresCard + ScoreBreakdown cover dimensions. BusinessActionBar handles sharing. No information was lost — only redundancy."

**Jasmine Taylor (Marketing):** "The product now feels like a ranking engine, not a dashboard. When someone lands on a business page, they see: rank, score, sub-scores, trend, reviews. Clean hierarchy. That's what converts casual users to raters."

**Nadia Kaur (Security):** "Removing evaluateBusinessBadges from the business detail render path eliminates a per-render computation. Fewer components fetching data means fewer API calls per page view."

**Jordan Blake (Compliance):** "Fewer UI surfaces means fewer places for misleading information. The trust story is told once (TrustExplainerCard), not three times across overlapping cards."

## Design Principles Applied

1. **Primary** (always visible): Rank, place name, movement, why it's ranked
2. **Secondary** (visible on interaction): Credibility, confidence, score methodology
3. **Tertiary** (removed or deeply buried): Badges, rewards, referrals, streaks, progression

## Changes

### Modified Files

- **`app/(tabs)/profile.tsx`** (465→359 LOC, -106)
  - Removed: OnboardingChecklist, TierProgressNotification, AchievementsSection, DishVoteStreakCard, ProfileStatsCard, ActivityTimeline, ScoreBreakdownCard, CredibilityJourney, BadgeGridFull, TierRewardsSection, BadgeDetailModal, Invite Friends link
  - Removed: useBadgeContext hook, selectedBadge state
  - Kept: Identity card, ProfileCredibilitySection, Last Rating, ImpactCard, RatingHistorySection, SavedPlacesSection, PaymentHistory, NotificationPreferencesCard, LegalLinksSection, Admin link

- **`app/business/[id].tsx`** (526→480 LOC, -46)
  - Removed: DimensionScoreCard, DimensionComparisonCard, ReviewSummaryCard, CityComparisonCard, SharePreviewCard, RankConfidenceIndicator, business badges section
  - Removed: evaluateBusinessBadges, BadgeRowCompact, fetchCityStats, cityStats query, handleShare/handleCopyLink handlers, Share import, getShareUrl/getShareText/copyShareLink imports
  - Kept: ScoreCard, TrustExplainerCard, SubScoresCard, ScoreBreakdown, ScoreTrendSparkline, RankHistoryChart, BusinessActionBar (handles own sharing)

- **`app/(tabs)/index.tsx`** (443→407 LOC, -36)
  - Removed: Sticky cuisine bar (duplicate of header cuisine chips), TopRankHighlight shimmer wrapper, showStickyCuisine state, CUISINE_STICKY_THRESHOLD, onScroll handler, stickyCuisineBar style
  - Kept: Header CuisineChipRow (via RankingsListHeader), LeaderboardFilterChips, search bar, FlatList with RankedCard

### Test Files Updated (22 files)
- Removed 69 tests that verified removed component integrations
- Updated import counts and prop assertions to match simplified screens
- All remaining tests verify component files still work independently

### Threshold Updates
- `shared/thresholds.json`: tests 11044→10975 (-69), index.tsx current 443→407

## Reduction Summary

| Screen | Before | After | Removed | % Reduction |
|--------|--------|-------|---------|-------------|
| Profile | 465 LOC | 359 LOC | 106 | 23% |
| Business Detail | 526 LOC | 480 LOC | 46 | 9% |
| Rankings | 443 LOC | 407 LOC | 36 | 8% |
| **Total** | **1,434** | **1,246** | **188** | **13%** |

Components removed from screens: **19 total** (10 from Profile, 7 from Business Detail, 2 from Rankings)

## Test Results
- **10,975 tests** across 470 files, all passing in ~6.0s
- Server build: 717.2kb
