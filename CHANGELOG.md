# Changelog

All notable changes to TopRanker are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

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
