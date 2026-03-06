# Top Ranker — Community-Ranked Local Business Leaderboard

## Overview

A dark-themed mobile leaderboard app for local businesses in Dallas. Communities rank restaurants, cafes, street food, bars, bakeries, and fast food using weighted credibility-based voting. Features live challenger events, member credibility tiers, and rich business profiles.

## Architecture

- **Frontend**: Expo Router (React Native) — file-based routing
- **Backend**: Express.js (TypeScript) on port 5000
- **Data**: In-memory mock data (lib/data.ts) — no database needed for MVP
- **State**: AsyncStorage-ready context pattern, React Query for future API calls

## App Structure

```
app/
  _layout.tsx              # Root stack with dark navy theme
  (tabs)/
    _layout.tsx            # Tab bar (NativeTabs + liquid glass on iOS 26)
    index.tsx              # Leaderboard screen
    challenger.tsx         # Live challenge events
    search.tsx             # Discover/search
    profile.tsx            # Member profile with credibility breakdown
  business/[id].tsx        # Business profile detail
  rate/[id].tsx            # Rating submission (modal)
lib/
  data.ts                  # All mock data, types, credibility algorithm, helpers
  query-client.ts          # React Query client + API utilities
constants/
  colors.ts                # Design system tokens (dark navy palette)
```

## Design System

- **Background**: #0D1B2A (dark navy)
- **Surface/Cards**: #1B2A4A
- **Raised Surface**: #243452
- **Border**: #2E3F5C / #3A4F6E
- **Gold accent**: #C9973A — used for #1 rank, scores, CTAs, Top Reviewer tier
- **Silver**: #9AAABB — #2 rank
- **Bronze**: #CD7F32 — #3 rank
- **Green**: #1A6B3C (dark) / #22C55E (bright) — upward movement
- **Red**: #B03030 (dark) / #EF4444 (bright) — downward movement / challengers
- **Font**: Inter (400 Regular, 500 Medium, 600 SemiBold, 700 Bold)

## Categories

Restaurants, Cafes, Street Food, Bars, Bakeries, Fast Food

## Credibility Tier System

| Tier | Key | Weight | Color | Score Range |
|------|-----|--------|-------|-------------|
| New Member | new | 0.10x | #556677 | 10–99 |
| Regular | regular | 0.35x | #4A7FBB | 100–299 |
| Trusted | trusted | 0.70x | #7B4EA8 | 300–599 |
| Top Reviewer | top | 1.00x | #C9973A | 600–1000 |

### Tier Requirements
- **Regular**: Score ≥ 100, 10+ ratings, 2+ categories, 14+ days active
- **Trusted**: Score ≥ 300, 35+ ratings, 3+ categories, 45+ days, variance ≥ 0.8
- **Top**: Score ≥ 600, 80+ ratings, 4+ categories, 90+ days, variance ≥ 1.0, 0 flags

### Credibility Score Components
Base (10) + Rating Volume (2pts/rating, max 200) + Category Diversity (15pts/cat, max 100) + Account Age (0.5pts/day, max 100) + Rating Variance (×50, max 150) + Helpfulness (pioneer rate ×150) − Flag Penalty (25pts/flag)

## Key Features

1. **Leaderboard** — Top ranked per category with rank badges (gold/silver/bronze), movement indicators, weighted scores
2. **Business Profile** — Hero image, weighted score card, rating breakdown bars, distribution chart, community ratings feed, verified badges
3. **Rate a Business** — 4 structured questions (Food 1-5 / Value 1-5 / Service 1-5 / Would Return Y/N), raw_score = (food+value+service)/3, weighted_score = raw × tier_weight, 160-char note limit, score preview before submit
4. **Challenger Events** — 30-day head-to-head fight cards with weighted vote counts, progress bars, countdown timers, expandable community commentary
5. **Discover** — Filter by category/type/trending, city selector, trending cards, full-text search
6. **Member Profile** — Large credibility score display, vote weight multiplier, score breakdown table, tier requirements checklist with progress, rating history with weights

## Business Data Model

- `weightedScore` (not `score`) — the primary display score
- `rawAvgScore` — raw average before weighting
- `rankDelta` — positive = moved up, negative = moved down, 0 = stable
- `slug` — URL-friendly identifier
- `isVerified` — verified business badge

## Workflows

- `Start Backend` — runs `npm run server:dev` on port 5000
- `Start Frontend` — runs `npm run expo:dev` on port 8081
