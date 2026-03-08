# Changelog

All notable changes to TopRanker are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Sprint 68 — Profile Extraction + Achievement Badges + Docs Reorganization (March 8, 2026)
#### Added
- **Achievement Badges System** — 56 Apple Fitness-style badges (35 user + 21 business)
  - 4 rarity tiers: Common, Rare, Epic, Legendary with distinct color systems
  - 6 categories: Milestone, Streak, Explorer, Social, Seasonal, Special
  - User badges: First Taste through Legendary Judge (rating milestones), On a Roll through Monthly Devotion (streaks), Curious Palate through Texas Tour (exploration), Connector through Community Leader (social)
  - Business badges: On the Map through Legendary Spot (volume), Top 10 through Number One (ranking), Highly Rated through Perfect Reputation (quality), Trusted Approved, Top Judge's Pick (social proof)
  - Pure evaluation functions with progress tracking (0-100%)
- `components/profile/BadgeGrid.tsx` — Apple Fitness-style badge display with progress rings, rarity-colored borders, category sections, compact mode
- 25 new badge tests (total: 139 across 10 test files)

#### Changed
- Extracted `TierBadge`, `HistoryRow`, `BreakdownRow`, `SavedRow`, `LoggedOutView` from `profile.tsx` into `components/profile/SubComponents.tsx`
- Removed 180+ unused styles from profile.tsx
- `profile.tsx` reduced from 1,056 to 745 LOC (-29%)
- Reorganized `/docs/` — moved 67 sprint docs into `/docs/sprints/` subdirectory
- Updated Team Performance Dashboard through Sprint 68

### Sprint 67 — Rate Page Extraction + API Response Timing + Team Expansion (March 8, 2026)
#### Changed
- Extracted `CircleScorePicker`, `CircleScoreLabels`, `ProgressBar`, `StepIndicator`, `DishPill`, `RatingConfirmation` from `rate/[id].tsx` into `components/rate/SubComponents.tsx`
- `rate/[id].tsx` reduced from 1,104 to 803 LOC (-27%)
- Removed ~100 unused styles from rate/[id].tsx StyleSheet

#### Added
- API response time logging middleware on all `/api/*` routes — logs method, URL, status, duration
- Requests >200ms tagged `[SLOW]` at warn level via structured logger
- Senior Management Meeting process: weekly CEO/CTO/VP meeting for backlog prioritization and hiring
- 5 new hires approved: Senior Frontend Engineer, QA Automation Engineer, Content Moderation Specialist, Legal Counsel, Junior Backend Engineer

### Sprint 66 — Search Extraction + Rich Favicons (March 8, 2026)
#### Changed
- Extracted `DiscoverPhotoStrip`, `BusinessCard`, `MapBusinessCard`, `haversineKm` from `search.tsx` into `components/search/SubComponents.tsx`
- `search.tsx` reduced from 1,159 to 833 LOC (-28%)
- Removed unused imports: `Animated`, `useWindowDimensions`, `Linking`, `usePressAnimation`, `useBookmarks`
- Removed ~75 unused styles from search.tsx StyleSheet
- `app.json` favicon switched from SVG to PNG (Expo compatibility)
- `+html.tsx` now declares multi-size favicons (32, 48, 180, 192px)

#### Added
- Rich SVG favicon source with navy gradient, gold podium, star accent, rank numbers, shadows, glow effects
- `scripts/generate-favicons.js` — sharp-based PNG generation pipeline (6 sizes from SVG master)
- `favicon.png` (48px), `favicon-32.png`, `favicon-192.png`, `favicon-512.png` — all brand-aligned
- `apple-touch-icon.png` (180px) — dedicated iOS home screen icon
- `splash-icon.png` replaced with rich branded version (was crude blocky podium)
- Legal compliance roadmap: ToS, Privacy Policy, content moderation planned for Sprints 67-70

### Sprint 65 — UI Polish + Team Domain Commitments (March 8, 2026)
#### Changed
- Search bar redesign: amber icon circle, 48px height, brand-aligned placeholder "Find the best of what you want..."
- Header subtitle: "Find the best in {city}, with confidence"
- Documented all 8 team members' personal domain commitments for TopRanker perfection

### Sprint 64 — UI/UX Design Sprint (March 8, 2026)
#### Changed
- Animated splash: replaced emoji crown with `LeaderboardMark` SVG, added "TOP"/"Ranker" wordmark hierarchy, navy background
- Custom SVG favicon with brand mark on navy (replaced default Expo chevron)
- Web metadata: updated title, description, OG tags for multi-city, theme-color to navy
- Splash/Android adaptive icon backgrounds changed from cream to navy (#0D1B2A)
- Onboarding slide 1 uses `LeaderboardMark` SVG with gradient circle

### Sprint 63 — Chart Extraction + Type Safety (March 7, 2026)
#### Changed
- Extracted `RatingDistribution` and `RankHistoryChart` from `business/[id].tsx` into SubComponents
- `business/[id].tsx` reduced from 921 to 816 LOC (total -33% from original 1210)
- Typed `FighterPhoto` component prop as `ApiBusiness` instead of `any`
- Removed 3 `as any` casts (36 -> 33 total in frontend)

### Sprint 62 — Integration Tests + supertest (March 7, 2026)
#### Added
- `supertest` + `@types/supertest` dev dependencies for HTTP integration testing
- 20 integration tests covering: health, leaderboard, business CRUD, auth middleware, input validation, member endpoints, response shape consistency
- Total test count: 114 (up from 94, +21%)
- `as any` audit analysis: 36 casts categorized by type (14 RN width, 10 Ionicons, 5 style, 3 window, 2 API, 2 misc)

### Sprint 61 — Component Extraction: business/[id].tsx (March 7, 2026)
#### Changed
- Extracted 7 presentational components from `app/business/[id].tsx` into `components/business/SubComponents.tsx`
  - SubScoreBar, DistributionChart, RatingRow, ActionButton, CollapsibleReviews, AnimatedScore, DishPill
- Reduced `app/business/[id].tsx` from 1,210 LOC to 921 LOC (-24%)
- Removed ~80 lines of unused styles and cleaned up unused imports
- Moved Android LayoutAnimation setup to SubComponents.tsx where it's consumed

### Sprint 60 — Architectural Audit #2 + Search Sanitization (March 7, 2026)
#### Security
- Search input sanitization: strip ILIKE wildcards (`%`, `_`, `\`), truncate to 100 chars
- Applied to both `searchBusinesses` and `searchDishes` storage functions

#### Added
- 9 new tests for search sanitization (total: 94)
- Architectural Audit #2 document (`docs/audits/ARCH-AUDIT-60.md`)

### Sprint 59 — Rate Limiting + CORS (March 7, 2026)
#### Security
- Rate limiter factory pattern: `createRateLimiter(name, maxRequests, windowMs)`
- API rate limit (100 req/min) applied to all 8 public endpoint prefixes
- Production CORS whitelist: topranker.com, www.topranker.com

#### Added
- 7 new tests for rate limiting (total: 85)

### Sprint 58 — Structured Logging (March 7, 2026)
#### Added
- `server/logger.ts` — Structured logger with 4 levels, tagged modules, JSON serialization
- 8 new tests for logger (total: 78)

#### Changed
- Migrated 8 server files from raw `console.log`/`console.error` to structured logger

### Sprint 57 — Storage Domain Split + TypeScript Fix (March 7, 2026)
#### Changed
- Split monolithic `server/storage.ts` (1,010 LOC) into 6 domain modules (max 230 LOC each)
  - `server/storage/members.ts`, `businesses.ts`, `ratings.ts`, `challengers.ts`, `dishes.ts`, `helpers.ts`
- Fixed `NodeJS.Timeout` to `ReturnType<typeof setTimeout>` — zero TypeScript errors achieved

### Sprint 56 — Architectural Audit CRITICAL Fixes (March 7, 2026)
#### Security
- **CRITICAL**: Removed hardcoded session secret fallback — server now crashes on missing `SESSION_SECRET`
- **CRITICAL**: Centralized admin email whitelist in `shared/admin.ts` — removed from 3 duplicated locations
- Removed `alex@demo.com` from admin access (demo accounts should never be admins)

#### Added
- `server/config.ts` — Centralized environment configuration with startup validation
- `shared/admin.ts` — Single source of truth for admin emails with `isAdminEmail()` helper
- 31 new tests: admin whitelist (8), env config (7), auth validation (16)
- Total test count: 70 (up from 39)

#### Changed
- `server/auth.ts` — Uses centralized config instead of direct `process.env` access
- `server/routes.ts` — Uses `isAdminEmail()` instead of hardcoded array
- `app/(tabs)/profile.tsx` — Uses `isAdminEmail()` instead of hardcoded array
- `app/admin/index.tsx` — Uses `isAdminEmail()` instead of local constant

### Sprint 55 — Multi-City Data Seeding (March 7, 2026)
#### Added
- `server/seed-cities.ts` — 32 real businesses across 4 Texas cities
  - Austin (10): Franklin BBQ, Uchi, Torchy's, Salt Lick, Ramen Tatsu-Ya, Odd Duck, Jo's Coffee, Rainey Street, Whataburger, Quack's Bakery
  - Houston (8): Killen's, Pappas Bros, Crawfish & Noodles, Tacos Tierra Caliente, Buc-ee's, Blacksmith, Julep, Common Bond
  - San Antonio (7): 2M Smokehouse, Mi Tierra, Garcia's, Estate Coffee, Whataburger, Esquire Tavern, Bird Bakery
  - Fort Worth (7): Heim BBQ, Joe T. Garcia's, Salsa Limon, Avoca Coffee, Whataburger, The Usual, Swiss Pastry
- POST `/api/admin/seed-cities` endpoint (admin-only)
- `npm run seed:cities` CLI command

### Sprint 54 — Tier Perks Engine + Profile UI (March 7, 2026)
#### Added
- `lib/tier-perks.ts` — 15 perks across 4 credibility tiers
- "Your Rewards" section on profile showing unlocked perks
- "Unlock with [Next Tier]" preview showing 3 locked perks

### Sprint 53 — Testing Foundation (March 7, 2026)
#### Added
- Vitest testing infrastructure with path aliases
- `tests/credibility.test.ts` — 24 tests for credibility scoring system
- `tests/tier-perks.test.ts` — 15 tests for gamification perks
- 39 tests passing in 97ms

### Sprint 52 — Production Bugfixes + Rating Redesign (March 7, 2026)
#### Fixed
- NetworkBanner: switched from non-existent `/api/health` to Google's `generate_204`
- Rate gating: changed from 7 days to correct 3 days
- Tab dot indicator positioning

#### Changed
- Rating flow collapsed from 6 screens to 2 screens
- GET `/api/health` endpoint added (lightest possible — no DB, no auth)
- Backlog refinement process documented

### Sprint 51 — Featured Placement / Promoted Listings (March 7, 2026)
#### Added
- Featured/Promoted business listings in search ($199/week)
- FeaturedSection component with gold border, "Featured" badge
- Mock promoted data with 3 sample businesses

## [Earlier Sprints]
Sprints 1-50 covered initial development from leaderboard MVP through accessibility, offline support, analytics, referral system, and app store metadata. See individual sprint docs in `docs/SPRINT-N-*.md`.
