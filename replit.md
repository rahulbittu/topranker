# Top Ranker — Community-Ranked Local Business Leaderboard

## Overview

A dark-themed mobile leaderboard app for local businesses in Dallas. Communities rank restaurants, cafes, street food, bars, bakeries, and fast food using weighted credibility-based voting. Features live challenger events, member credibility tiers, 6-step rating flow, dish voting, anomaly detection, and rich business profiles.

## Architecture

- **Frontend**: Expo Router (React Native) — file-based routing
- **Backend**: Express.js (TypeScript) on port 5000
- **Database**: PostgreSQL via Drizzle ORM (13 tables)
- **Auth**: Passport.js (local strategy) + express-session with connect-pg-simple
- **State**: React Query for server state, AuthContext for auth session

## Database Schema (13 tables)

members, businesses, ratings, challengers, rank_history, business_claims, dishes, dish_votes, business_photos, qr_scans, rating_flags, member_badges, credibility_penalties

## App Structure

```
app/
  _layout.tsx              # Root stack (AuthProvider + QueryClient)
  (tabs)/
    _layout.tsx            # Tab bar (NativeTabs + liquid glass on iOS 26)
    index.tsx              # Leaderboard screen — PRD Section 5 layout
    challenger.tsx         # Live challenge events
    search.tsx             # Discover/search
    profile.tsx            # Member profile
  business/[id].tsx        # Business profile — 9 sections per PRD Section 6
  rate/[id].tsx            # 6-step rating flow per PRD Section 7-8
  auth/
    login.tsx              # Login screen — dark navy with Google button (disabled)
    signup.tsx             # Signup screen — dark navy with tier preview
lib/
  api.ts                   # API fetch helpers + response mappers
  auth-context.tsx         # AuthProvider + useAuth hook
  data.ts                  # Constants, types, credibility engine, tier helpers
  query-client.ts          # React Query client + apiRequest + getApiUrl
server/
  index.ts                 # Express entry point
  routes.ts                # API routes with 16-step rating submission
  storage.ts               # Drizzle CRUD + credibility algorithm + anomaly detection
  auth.ts                  # Passport.js setup
  db.ts                    # Database connection pool
  seed.ts                  # Seed script (35 businesses, dishes, 2 challengers, demo user)
shared/
  schema.ts                # Drizzle schema (13 tables)
constants/
  colors.ts                # Design system tokens (dark navy palette)
```

## API Endpoints

- `GET /api/leaderboard?city=&category=&limit=` — ranked businesses
- `GET /api/businesses/:slug` — business detail + recent ratings + dishes
- `GET /api/businesses/search?q=&city=&category=` — search businesses
- `GET /api/businesses/:id/ratings?page=&per_page=` — paginated ratings
- `GET /api/dishes/search?business_id=&q=` — dish search with fuzzy matching
- `POST /api/ratings` (auth required) — 16-step rating submission
- `GET /api/members/me` (auth required) — member profile with credibility breakdown
- `GET /api/challengers/active?city=` — active challenger events
- `POST /api/auth/signup` — create account
- `POST /api/auth/login` — login
- `POST /api/auth/logout` — logout
- `GET /api/auth/me` — current session user

## Rating Columns

- q1Score: primary quality (food/drinks/service quality depending on category)
- q2Score: value for money
- q3Score: service/experience

## Credibility Tier System (PRD Section 9)

| Tier | Key | Weight | Color | Score Range |
|------|-----|--------|-------|-------------|
| Community Member | community | 0.10x | #556677 | 10–99 |
| City Judge | city | 0.35x | #4A7FBB | 100–299 |
| Trusted Judge | trusted | 0.70x | #7B4EA8 | 300–599 |
| Top Judge | top | 1.00x | #C9973A | 600–1000 |

## Credibility Formula

Base(10) + Volume(2pts/rating, max 200) + Diversity(15pts/category, max 100) + Age(0.5pts/day, max 100) + Variance(×60, max 150) + Helpfulness(max 100) - Penalties

## Anomaly Detection (6 flags)

burst_velocity, perfect_score_pattern, one_star_bomber, single_business_fixation, new_account_high_volume, coordinated_new_account_burst

## Categories (15 food categories)

Restaurants, Fast Food, Fine Dining, Cafes, Bakeries, Bubble Tea, Ice Cream, Street Food, Bars, Breweries, Casual Dining, Buffets, Brunch, Dessert Bars, Food Halls

## Demo User

- Email: alex@demo.com
- Password: demo123
- Tier: city (credibility score ~142)

## Design System

- **Background**: #0D1B2A (dark navy)
- **Surface/Cards**: #1B2A4A
- **Raised Surface**: #243452
- **Gold accent**: #C9973A — #1 rank, scores, CTAs, Top Judge tier
- **Silver**: #9AAABB — #2 rank
- **Bronze**: #CD7F32 — #3 rank
- **Font**: Inter (400 Regular, 500 Medium, 600 SemiBold, 700 Bold)

## Workflows

- `Start Backend` — runs `npm run server:dev` on port 5000
- `Start Frontend` — runs `npm run expo:dev` on port 8081 (console output type)
