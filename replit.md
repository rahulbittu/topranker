# Ranked — Local Business Ranking Platform

## Overview

A dark-themed mobile leaderboard app where the number is the product. Think Nielsen ratings meets a live sports scoreboard. Communities rank local businesses with weighted credibility-based voting.

## Architecture

- **Frontend**: Expo Router (React Native) — file-based routing
- **Backend**: Express.js (TypeScript) on port 5000
- **Data**: In-memory mock data (lib/data.ts) — no database needed for MVP
- **State**: AsyncStorage-ready context pattern, React Query for future API calls

## App Structure

```
app/
  _layout.tsx              # Root stack with dark theme
  (tabs)/
    _layout.tsx            # Tab bar (NativeTabs + liquid glass on iOS 26)
    index.tsx              # Leaderboard screen
    challenger.tsx         # Live challenge events
    search.tsx             # Discover/search
    profile.tsx            # Member profile
  business/[id].tsx        # Business profile detail
  rate/[id].tsx            # Rating submission (modal)
lib/
  data.ts                  # All mock data, types, helper functions
  query-client.ts          # React Query client + API utilities
constants/
  colors.ts                # Design system tokens
```

## Design System

- **Background**: #0A0A0A (near black)
- **Surface**: #141414 / #1C1C1C
- **Gold accent**: #F5C518 — used for #1 rank, scores, CTAs
- **Silver**: #B0B0B0 — #2 rank
- **Bronze**: #CD7F32 — #3 rank
- **Green**: #22C55E — upward movement
- **Red**: #EF4444 — downward movement / challengers
- **Font**: Inter (400, 500, 600, 700)

## Key Features

1. **Leaderboard** — Top 10 per category with rank numbers, gold #1 billboard treatment, movement arrows
2. **Business Profile** — Full ranking details, weighted score, rating distribution chart, recent ratings feed
3. **Rate a Business** — 4 structured questions (Food/Value/Service/WouldReturn), credibility tier shown, before/after rank reveal
4. **Challenger Events** — Head-to-head fight cards with live vote counts, countdown timers, member commentary
5. **Search & Discover** — Filter by category/type/trending, city selector, trending businesses
6. **Member Profile** — Credibility tier (New Member → Regular → Trusted → Top Reviewer), progress bar, rating history

## Credibility Tiers

| Tier | Weight | Color |
|------|--------|-------|
| New Member | 0.5x | Gray |
| Regular | 1.0x | Blue |
| Trusted | 1.5x | Purple |
| Top Reviewer | 2.0x | Gold |

## Workflows

- `Start Backend` — runs `npm run server:dev` on port 5000
- `Start Frontend` — runs `npm run expo:dev` on port 8081
