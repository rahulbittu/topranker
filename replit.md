# Top Ranker — Community-Ranked Local Business Leaderboard

## Overview

A dark-themed mobile leaderboard app for local businesses in Dallas. Communities rank restaurants, cafes, street food, bars, bakeries, and fast food using weighted credibility-based voting. Features live challenger events, member credibility tiers, and rich business profiles.

## Architecture

- **Frontend**: Expo Router (React Native) — file-based routing
- **Backend**: Express.js (TypeScript) on port 5000
- **Database**: PostgreSQL via Drizzle ORM (6 tables: members, businesses, ratings, challengers, rank_history, business_claims)
- **Auth**: Passport.js (local strategy) + express-session with connect-pg-simple
- **State**: React Query for server state, AuthContext for auth session

## App Structure

```
app/
  _layout.tsx              # Root stack (AuthProvider + QueryClient)
  (tabs)/
    _layout.tsx            # Tab bar (NativeTabs + liquid glass on iOS 26)
    index.tsx              # Leaderboard screen (useQuery → /api/leaderboard)
    challenger.tsx         # Live challenge events (useQuery → /api/challengers/active)
    search.tsx             # Discover/search (useQuery → /api/businesses/search)
    profile.tsx            # Member profile (useQuery → /api/members/me, logged-out fallback)
  business/[id].tsx        # Business profile detail (param is slug, fetches /api/businesses/:slug)
  rate/[id].tsx            # Rating submission modal (param is slug, POST /api/ratings, auth guard)
  auth/
    login.tsx              # Login screen (modal)
    signup.tsx             # Signup screen (modal)
lib/
  api.ts                   # API fetch helpers + response mappers (mapApiBusiness, mapApiRating)
  auth-context.tsx         # AuthProvider + useAuth hook (login/signup/logout/refreshUser)
  data.ts                  # Constants, types, credibility tiers, formatTimeAgo/formatCountdown helpers
  query-client.ts          # React Query client + apiRequest + getApiUrl
server/
  index.ts                 # Express entry point
  routes.ts                # All API routes (leaderboard, businesses, ratings, auth, challengers, members)
  storage.ts               # Drizzle CRUD operations + credibility algorithm
  auth.ts                  # Passport.js setup + session management
  db.ts                    # Database connection pool
  seed.ts                  # Seed script (31 businesses, 2 challengers, demo user)
shared/
  schema.ts                # Drizzle schema (6 tables)
constants/
  colors.ts                # Design system tokens (dark navy palette)
```

## API Endpoints

- `GET /api/leaderboard?city=&category=&limit=` — ranked businesses
- `GET /api/businesses/:slug` — business detail + recent ratings
- `GET /api/businesses/search?q=&city=&category=` — search businesses
- `GET /api/businesses/:id/ratings?page=&per_page=` — paginated ratings
- `POST /api/ratings` (auth required) — submit rating (server calculates weight/score)
- `GET /api/members/me` (auth required) — member profile with credibility breakdown
- `GET /api/challengers/active?city=` — active challenger events
- `POST /api/auth/signup` — create account
- `POST /api/auth/login` — login
- `POST /api/auth/logout` — logout
- `GET /api/auth/me` — current session user

## Data Mapping (API → Frontend)

- `rankPosition` → `rank`
- `totalRatings` → `ratingCount`
- `inChallenger` → `isChallenger`
- `weightedScore` as string → `parseFloat()`
- `tags` as comma-separated string → `.split(",")`
- Business navigation uses `slug` (passed as `[id]` param)

## Demo User

- Email: alex@demo.com
- Password: demo123
- Tier: regular

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
| New Member | new | 0.50x | #556677 | 10–99 |
| Regular | regular | 0.35x | #4A7FBB | 100–299 |
| Trusted | trusted | 0.70x | #7B4EA8 | 300–599 |
| Top Reviewer | top | 1.00x | #C9973A | 600–1000 |

## Workflows

- `Start Backend` — runs `npm run server:dev` on port 5000
- `Start Frontend` — runs `npm run expo:dev` on port 8081
