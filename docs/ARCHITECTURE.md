# TopRanker Architecture

## System Overview

```
+------------------+     +------------------+     +------------------+
|  Expo Router     | --> |  Express.js API  | --> |  PostgreSQL      |
|  (React Native)  |     |  (port 5000)     |     |  (Drizzle ORM)  |
+------------------+     +------------------+     +------------------+
       |                         |
       v                         v
  React Query              Passport.js
  (server state)           (session auth)
```

## Frontend Architecture

### Stack
- **Framework**: Expo Router (file-based routing on React Native)
- **State**: React Query for server data, AuthContext for auth session
- **Styling**: React Native StyleSheet, no external UI library
- **Animations**: react-native-reanimated (FadeInDown, springs, layout animations)
- **Brand**: Playfair Display 900 headings, DM Sans body, Amber #C49A1A / Navy #0D1B2A

### Screen Map
```
(tabs)/
  index.tsx         -> Leaderboard (city selector, category tabs, ranked cards)
  challenger.tsx    -> Live Challenges (VS layout, countdown, vote)
  search.tsx        -> Discover (filters, trending, featured, map view)
  profile.tsx       -> Member Profile (tier, stats, perks, history)

business/[id].tsx   -> Business Profile (hero, scores, ratings, dishes, map)
rate/[id].tsx       -> Rating Flow (2-step: scores + optional extras)
admin/index.tsx     -> Admin Dashboard (5 tabs: overview, claims, flags, challengers, users)
auth/login.tsx      -> Login/Signup
```

### Key Client Libraries
| Library | Purpose |
|---------|---------|
| `lib/data.ts` | Credibility scoring, tier logic, vote weights, temporal decay |
| `lib/tier-perks.ts` | 15 gamification perks across 4 tiers |
| `lib/auth-context.tsx` | Auth state, login/logout/signup methods |
| `constants/brand.ts` | Brand colors, fonts, categories, tier display names |

## Backend Architecture

### Stack
- **Runtime**: Node.js + Express.js (TypeScript)
- **ORM**: Drizzle with PostgreSQL
- **Auth**: Passport.js (local + Google OAuth), express-session with connect-pg-simple
- **Config**: Centralized `server/config.ts` — crashes on missing required env vars

### Module Map
```
server/
  index.ts          -> App entry, CORS, static serving, Vite dev proxy
  routes.ts         -> Core API route handlers
  routes-admin.ts   -> Admin endpoints (claims, flags, users, analytics)
  routes-payments.ts -> Payment & subscription endpoints
  routes-badges.ts  -> Badge award & progress endpoints
  routes-experiments.ts -> A/B experiment CRUD & exposure tracking
  storage.ts        -> Database operations (Drizzle queries)
  auth.ts           -> Passport strategies, registration, Google OAuth
  config.ts         -> Env var validation, typed config object
  db.ts             -> PostgreSQL pool + Drizzle instance
  email.ts          -> Email sending (console/Resend pluggable)
  payments.ts       -> Payment processing (mock/Stripe pluggable)
  push.ts           -> Push notifications (console/Expo API pluggable)
  photos.ts         -> Photo proxy for Google Places
  deploy.ts         -> GitHub webhook deploy handler
  seed.ts           -> Initial Dallas data seed
  seed-cities.ts    -> Multi-city seed (Austin, Houston, SA, Fort Worth)
```

### Pluggable Providers
The backend uses a pluggable pattern for external services:

| Service | Development | Production |
|---------|------------|------------|
| Email | Console logger | Resend API |
| Payments | Mock (always succeeds) | Stripe |
| Push | Console logger | Expo Push API |
| Photos | Unsplash fallbacks | Google Places API |

## Database Schema

### 20 Tables
```sql
members              -- User accounts, credibility scores, tiers
businesses           -- Restaurant/business listings, scores, ranks
ratings              -- User ratings (3 scores + would-return + note)
challengers          -- Head-to-head challenge events
rank_history         -- Historical rank snapshots
business_claims      -- Business owner claim requests
dishes               -- Top dishes per business
dish_votes           -- User votes on dishes
business_photos      -- Photos attached to businesses
qr_scans             -- QR code scan tracking
rating_flags         -- Flagged/reported ratings
member_badges        -- Achievement badges
credibility_penalties -- Score penalties for bad behavior
analytics_events     -- Event tracking for dashboards and funnels
categories           -- Business category taxonomy
category_suggestions -- User-submitted category proposals
deletion_requests    -- GDPR deletion queue with 30-day grace period
featured_placements  -- Paid featured business placements
webhook_events       -- Inbound/outbound webhook log
sessions             -- Express session store (connect-pg-simple)
```

### Key Relationships
```
members 1--* ratings *--1 businesses
members 1--* dish_votes *--1 dishes *--1 businesses
businesses 1--* business_photos
businesses 1--* rank_history
members 1--* member_badges
members 1--* credibility_penalties
```

## Security Model

### Authentication
- Password hashing: bcrypt (10 rounds)
- Sessions: express-session + connect-pg-simple (PostgreSQL-backed)
- Session secret: Required env var, server crashes without it (no fallback)
- Google OAuth: ID token verification against Google's tokeninfo endpoint
- Rate limiting: 10 auth attempts per IP per minute

### Authorization
- Admin access: Centralized email whitelist in `shared/admin.ts`
- Rate gating: 3-day account age required to submit ratings
- All mutation endpoints require authentication (`requireAuth` middleware)

### Input Validation
- Username: `/^[a-zA-Z0-9_]{2,30}$/`
- Email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Display name: 1-50 characters
- Rating scores: 1-10 (validated by Zod schema)

## Credibility System

### Tiers
| Tier | Score Range | Vote Weight | Requirements |
|------|------------|-------------|--------------|
| New Member | 10-99 | 0.10x | Default tier |
| Regular | 100-299 | 0.35x | 10+ ratings, 2+ categories, 14+ days active |
| Trusted | 300-599 | 0.70x | 35+ ratings, 3+ categories, 45+ days, variance 0.8+ |
| Top Judge | 600-1000 | 1.00x | 80+ ratings, 4+ categories, 90+ days, variance 1.0+, zero flags |

### Score Calculation
```
credibilityScore = (ratingsGiven * 3) + (daysActive * 0.5) + (dishVotes * 1)
                   + (challengeVotes * 2) + (photoUploads * 2)
                   - (flagCount * 15)
                   [capped at 500, floored at 0]
```

### Temporal Decay
Ratings lose influence over time:
- 0-30 days: 1.0x multiplier
- 30-90 days: 0.85x
- 90-180 days: 0.65x
- 180-365 days: 0.45x
- 365+ days: 0.25x

## Data Flow

### Rating Submission
```
User taps "Rate" -> rate/[id].tsx
  -> Screen 1: Enter 3 scores + would-return
  -> Screen 2: Optional dish, note, photo
  -> POST /api/ratings (requireAuth)
    -> Validate rate gating (3-day rule)
    -> Validate rating schema (Zod)
    -> Insert rating
    -> Recalculate business score (weighted by credibility)
    -> Recalculate user credibility score
    -> Return updated rank + tier progress
  -> Confirmation screen (confetti, rank delta)
```

### Leaderboard
```
User opens app -> GET /api/leaderboard?city=Dallas&category=restaurant
  -> Query businesses by city + category
  -> Sort by score DESC
  -> Return ranked list with rank, score, delta, photo
  -> Display with rank badges (gold/silver/bronze for top 3)
```

## Testing Strategy

### Current Coverage (2117 tests across 92 files, <2s execution)

The test suite covers credibility scoring, auth validation, tier perks, admin logic, env config, API endpoint integration, A/B experiment pipelines, tier freshness contracts (FRESH vs SNAPSHOT), GDPR deletion flows, payment processing, badge awards, and SSE real-time updates.

### Testing Principles (CEO Mandate)
- No code ships without testing
- Unit tests for all business logic
- Integration tests for all API endpoints (in progress)
- TypeScript must be clean (zero new errors)

## Architectural Decisions

### ADR-1: Express over Supabase
PRD specifies Supabase. We use Express + Drizzle. This gives us full control over business logic, custom credibility scoring, and temporal decay calculations that would be complex in Supabase RPC.

### ADR-2: Centralized Config
All env vars read once at startup via `server/config.ts`. Required vars crash the process if missing. No silent fallbacks for security-critical values (session secret, database URL).

### ADR-3: Admin Whitelist over RBAC (Phase 1)
Sprint 56 uses a centralized email whitelist (`shared/admin.ts`). Database-backed RBAC with roles table is planned for Sprint 58. The whitelist is a frozen array — mutation attempts throw at runtime.

### ADR-4: 2-Screen Rating Flow
Original PRD specified 6 screens. Sprint 52 collapsed to 2 screens after CEO feedback that the flow was too long. Screen 1 captures all required data, Screen 2 handles optional extras.

### ADR-5: Temporal Decay over Simple Average
Business scores use temporal decay so recent ratings matter more. A restaurant that improved 6 months ago shouldn't be held back by ratings from 2 years ago. Decay is linear with configurable thresholds.

## Additional Systems

### A/B Testing Framework
`lib/ab-testing.ts` provides deterministic user bucketing via `shared/hash.ts`. The experiment tracker (`server/experiment-tracker.ts`) records exposures and outcomes, computes Wilson score confidence intervals, and powers the experiment dashboard. Active experiments are managed through `routes-experiments.ts`.

### SSE Real-Time Updates
`hooks/use-realtime.ts` establishes Server-Sent Event connections for live leaderboard and challenge updates. The server pushes rank changes and vote events without polling. SSE connections are hardened with reconnection backoff and auth token validation.

### GDPR Deletion
Deletion requests enter a 30-day grace period stored in the `deletion_requests` table. During the grace period, members can cancel. After expiry, a background job permanently purges all member data (ratings, badges, photos, credibility history). The flow is integration-tested end-to-end.

## Audit Cadence
- **Every 5 sprints**: Full architectural audit
- **Output**: `docs/audits/ARCH-AUDIT-N.md`
- **Pipeline**: CRITICAL -> P0 next sprint, HIGH -> P1 within 2 sprints
- **Last audit**: Arch Audit #12 at Sprint 140 (A-), 0 Critical, 0 High
- **Grade trajectory**: C+ -> A+ -> B+ -> A+ -> B+ -> A-
- **Automated checks**: `scripts/arch-health-check.sh` covers file sizes, type casts, @types, test count, duplications
