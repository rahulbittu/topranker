# Changelog

All notable changes to TopRanker are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/).

## [Sprint 108] - 2026-03-08
### Added
- E2E test framework: 21 tests covering full API contract (L1 CLOSED)
- PricingBadge reusable component
- API versioning (X-API-Version: 1.0.0) and request tracing (X-Request-Id)
### Changed
- CORS consolidated into security-headers.ts
- Hardcoded colors cleaned up (#FFD700, rgba → brand constants)
- Tech debt registry updated: TD-003, TD-004 resolved
- Accessibility statement linked from profile legal section

## [Sprint 107] - 2026-03-08
### Added
- Security posture document (docs/SECURITY.md)
- Accessibility statement page (app/legal/accessibility.tsx)
- Revenue metrics admin endpoint (GET /api/admin/revenue)
- Challenger tab onboarding tip card
- Profile tab credibility growth prompt
### Changed
- Typography migration complete: search.tsx, challenger.tsx (22 total styles)
- CHANGELOG.md updated with Sprints 97-106
- Body size limits: 1MB JSON, 5MB webhooks
- Accessibility props on SafeImage and SubComponents

## [Sprint 106] - 2026-03-08
### Added
- Performance monitoring middleware with admin endpoint (GET /api/admin/perf)
- Tech Debt Registry (docs/TECH-DEBT.md)
- Shared test utilities module (tests/helpers/test-utils.ts)
- Discover tab onboarding tip card
### Changed
- Typography migration in profile.tsx (10 styles)
- Pricing migration in dashboard.tsx and claim.tsx
- SSE hardened: max 5 connections/IP, 30-minute auto-timeout
- Cookie consent "Learn more" now links to privacy policy

## [Sprint 105] - 2026-03-08
### Added
- Content Security Policy (9 directives) in security headers
- Rate limiter middleware (100 req/min API, 10 req/min auth)
- GDPR cookie consent banner for web
### Changed
- Banner dismissal persisted via AsyncStorage
- Frontend pricing migrated to PRICING constants (3 payment entry screens)
- Typography migration started in leaderboard SubComponents

## [Sprint 104] - 2026-03-08
### Added
- OWASP security headers middleware (X-Content-Type-Options, X-Frame-Options, HSTS)
- Centralized typography system (constants/typography.ts)
- Centralized pricing constants (shared/pricing.ts)
- Rankings tab engagement banner
### Changed
- Terms of Service updated to 14 sections (real-time, webhooks, cancellation)
- Privacy Policy updated (SSE data, Resend provider, webhook logging)
- colors.ts refactored to import from brand.ts (single source of truth)

## [Sprint 103] - 2026-03-08
### Added
- Webhook replay: GET /api/admin/webhooks, POST /api/admin/webhooks/:id/replay
- Extracted processStripeEvent() for reuse from webhook handler and admin replay

## [Sprint 102] - 2026-03-08
### Added
- Email service via Resend API (native fetch, zero dependencies)
- Dev mode console logging fallback when RESEND_API_KEY not set

## [Sprint 101] - 2026-03-08
### Added
- Payment cancellation expires featured placements immediately
- expireFeaturedByPayment() storage function

## [Sprint 100] - 2026-03-08
### Added
- Architecture Audit #9: A+ grade, zero critical/high findings

## [Sprint 99] - 2026-03-08
### Fixed
- Map IntersectionObserver crash on tab navigation
- Press animation quality (timing-in, gentle spring-out)
- Tab bar dot alignment with unified spring config
- Opening hours made collapsible (today + expand all)
### Changed
- Card entry animations with staggered delays

## [Sprint 98] - 2026-03-08
### Added
- Optimistic updates on rating submission with rollback
- googlePlaceId database index

## [Sprint 97] - 2026-03-08
### Added
- Server-Sent Events (SSE) for real-time cache invalidation
- React Query invalidation via SSE event mapping
- Website URLs for 28 seed businesses

## [Unreleased]

### Sprint 90 — Architectural Audit #8 + Payment Route Extraction (March 8, 2026)
#### Changed
- Extracted 3 payment routes to `server/routes-payments.ts` (85 LOC)
- `routes.ts` reduced from 732 to 665 LOC (under 700 threshold)
- Audit #8: 5/6 ALL CLEAR, 1 WATCH resolved same-sprint

### Sprint 89 — Payment Endpoints + Claim Email Notifications (March 8, 2026)
#### Added
- POST `/api/payments/challenger` ($99 entry), `/api/payments/dashboard-pro` ($49/mo), `/api/payments/featured` ($199/week)
- Claim confirmation email (branded HTML to business owner)
- Claim admin notification email (alert to review team)
- 11 new tests for payment contracts and email notifications (total: 294)

#### Changed
- `enter-challenger.tsx` wired to real payment API (was setTimeout stub)

### Sprint 88 — Business Claims API + Real Dashboard + Admin Extraction (March 8, 2026)
#### Added
- POST `/api/businesses/:slug/claim` — real claim submission with duplicate detection
- GET `/api/businesses/:slug/dashboard` — real analytics replacing MOCK_ANALYTICS
- `server/routes-admin.ts` — 14 admin routes extracted with `requireAdmin` middleware
- `submitClaim` and `getClaimByMemberAndBusiness` storage functions
- 18 new tests for claims, dashboard, and timeAgo formatter (total: 283)

#### Changed
- `claim.tsx` wired to real API (was console.log stub)
- `dashboard.tsx` uses React Query + real data, removed MOCK_ANALYTICS
- `routes.ts` reduced by ~260 LOC from admin extraction

### Sprint 87 — Google Places Photo Pipeline + Brand Hardening (March 8, 2026)
#### Added
- `server/google-places.ts` — fetch photo refs from Google Places API (New)
- `insertBusinessPhotos`, `getBusinessesWithoutPhotos`, `deleteBusinessPhotos` storage functions
- POST `/api/admin/fetch-photos` for batch photo fetching
- On-demand photo fetch in business detail route
- `resolvePhotoUrl()` in `lib/api.ts` for Places ref → proxy URL conversion
- `navyDark` (#162940) to `BRAND.colors`
- 34 new tests: push token (13) + Google Places photos (21) (total: 265)

#### Changed
- Replaced 4 hardcoded navy gradient hex values with `BRAND.colors.navyDark`

### Sprint 86 — Teardown & Rebuild (March 8, 2026)
#### Added
- `assets/audio/AUDIO-ASSETS.md` — audio asset specifications for 5 sound files
- `.env.example` — environment variable template
- Onboarding persistence via AsyncStorage
- Push token storage endpoint: POST `/api/members/me/push-token`
- `updatePushToken` storage function

#### Fixed
- Replaced hardcoded gold hex values with brand constants (`Colors.gold`, `Colors.goldFaint`)
- Unified credibility tier system across all files

### Sprint 85 — Architectural Audit #7 + Full Badge Metadata + Admin Users Tab (March 8, 2026)
#### Added
- Architectural Audit #7: 5/6 ALL CLEAR, 1 WATCH (routes.ts file size)
- Admin Users tab with real member listing from database
- `getAdminMemberList` and `getMemberCount` storage functions
- Admin members API endpoints (GET list, GET count)

#### Changed
- Expanded server-side badge metadata from 10 to all 61 badges for share-by-link
- Admin overview uses real user count instead of hardcoded value

### Sprint 84 — Badge Share-by-Link + TypeScript Error Fixes (March 8, 2026)
#### Added
- `server/badge-share.ts` — Server-rendered badge share page with OG meta for social previews
- `/share/badge/:badgeId` endpoint serving HTML with OG tags, inline SVG image, cache-control
- "Copy Link" button in BadgeDetailModal using expo-clipboard
- `getBadgeShareUrl()` utility for constructing share URLs
- 11 new tests for share link validation (total: 231 across 20 files)

#### Fixed
- Fixed `MemberImpact.businessesMovedToFirst` type — made optional to match API interface
- Fixed `business.lat`/`business.lng` type — converted number to string for LocationCard
- All pre-existing TypeScript errors eliminated — **zero `tsc --noEmit` errors**

### Sprint 83 — Admin Claims/Flags API Wiring + Badge Leaderboard (March 8, 2026)
#### Added
- `server/storage/claims.ts` — Admin review storage for business claims and rating flags (6 functions)
- 7 new admin API routes: GET/PATCH claims, GET/PATCH flags, GET counts, GET badge leaderboard
- `app/badge-leaderboard.tsx` — Badge leaderboard screen ranking members by total badges earned
- API client functions for claims, flags, and badge leaderboard in `lib/api.ts`
- 12 new tests for admin claims/flags validation and badge leaderboard contract (total: 220 across 19 files)

#### Changed
- Admin panel claims/flags tabs now use real API endpoints instead of mock data
- Profile badge count is now tappable — navigates to badge leaderboard
- Fixed 4 pre-existing logger call errors in routes.ts (`log()` → `log.error()`)

### Sprint 82 — Google Maps Extraction + Business Detail Cleanup (March 8, 2026)
#### Changed
- Extracted `OpeningHoursCard` and `LocationCard` from business/[id].tsx into SubComponents.tsx
- Removed ~40 LOC and unused `Feather` import from business/[id].tsx
- `as any` iframe cast relocated to SubComponents.tsx (production count: 3, stable)

### Sprint 81 — useBadgeContext Hook + Team Dashboard Update (March 8, 2026)
#### Added
- `lib/hooks/useBadgeContext.ts` — Memoized hook for badge context, evaluation, and counts
- 6 new hook logic tests (total: 208 across 18 files)
- Team Performance Dashboard updated through Sprint 81 (662 total story points)

#### Changed
- Refactored profile.tsx — replaced dual badge context construction with `useBadgeContext` hook (~40 LOC reduction)

### Sprint 80 — Architectural Audit #6 + Badge Award Flow + Badge Count (March 8, 2026)
#### Added
- Architectural Audit #6: 5/6 ALL CLEAR, 1 WATCH (file size)
- Badge award persistence in rating flow — `awardBadgeApi` fires on toast trigger
- Badge count in profile stats row (amber colored, computed from evaluated badges)
- 5 new badge award flow tests (total: 202 across 17 files)

### Sprint 79 — Server-Side Badge Persistence + Badge API (March 8, 2026)
#### Added
- `server/storage/badges.ts` — CRUD for member_badges table (5 functions: getMemberBadges, getMemberBadgeCount, awardBadge, hasBadge, getEarnedBadgeIds)
- GET `/api/members/:id/badges` — list earned badges for any member
- POST `/api/badges/award` — persist earned badge for authenticated user
- GET `/api/badges/earned` — get earned badge IDs for authenticated user
- `awardBadgeApi()` and `fetchEarnedBadges()` API client functions
- 8 new badge persistence tests (total: 197 across 16 files)

### Sprint 78 — Badge Detail Modal + Admin Category Review UI (March 8, 2026)
#### Added
- `components/badges/BadgeDetailModal.tsx` — Full badge detail view with progress bar, share button, rarity display
- Admin "Suggestions" tab in admin panel — fetch, display, approve/reject category suggestions
- `reviewCategorySuggestion()` API client function for admin PATCH endpoint
- `CategorySuggestionItem` exported type for reuse
- 7 new tests for admin category review + badge detail (total: 189 across 15 files)

#### Changed
- `BadgeItem` now accepts `onPress` prop — tappable badges in profile grid
- `BadgeGridFull` and `BadgeCategorySection` forward `onBadgePress` handler
- Profile page integrates `BadgeDetailModal` with `selectedBadge` state
- Added "seasonal" to `BadgeGridFull` category list (was missing)

### Sprint 77 — Badge Sharing + Streak Toast Triggers + Maestro E2E (March 8, 2026)
#### Added
- `lib/badge-sharing.ts` — `shareBadgeCard()` utility using react-native-view-shot + expo-sharing
- Streak badge toast triggers in rating flow — 3-day, 7-day, 14-day, 30-day streak milestones
- Maestro E2E setup: `.maestro/config.yaml` + 3 initial flows (launch, search, profile)
- 9 new badge sharing + streak toast tests (total: 182 across 14 files)

#### Changed
- Badge toast now fires on both milestone AND streak thresholds (milestones take priority)

### Sprint 76 — Seasonal Rating API + Badge Toast Integration + Admin Review (March 8, 2026)
#### Added
- Server-side `getSeasonalRatingCounts()` — SQL GROUP BY month mapped to seasons
- Seasonal rating counts in `/api/members/me` response
- Badge toast integration in rating flow — milestone badges trigger on submission
- Admin PATCH `/api/admin/category-suggestions/:id` — approve/reject with RBAC

### Sprint 75 — Architectural Audit #5 + Seasonal Badges + Dashboard (March 8, 2026)
#### Added
- 5 seasonal badges: Spring Explorer, Summer Heat, Fall Harvest, Winter Chill, Year-Round Rater
- Seasonal badge evaluation with progress tracking and meta-badge (Year-Round = all 4 seasons)
- Architectural Audit #5: ALL CLEAR across all 6 dimensions
- 3 new seasonal badge tests (total: 173 across 13 files)

#### Changed
- Total badges: 56 -> 61 (40 user + 21 business)
- Updated team performance dashboard through Sprint 75 (583 story points)
- **Production `as any` casts: 3 (93% reduction — effectively complete)**

### Sprint 74 — Suggest Category Integration + API Wiring (March 8, 2026)
#### Added
- "Suggest" chip on leaderboard category row — opens SuggestCategory modal
- `submitCategorySuggestion()` and `fetchCategorySuggestions()` API client functions
- 11 new category suggestion validation tests (total: 170 across 13 files)

#### Changed
- Eliminated sortBy `as any` cast in search.tsx
- **Production `as any` casts: 4 -> 3 (93% total reduction from 43)**

### Sprint 73 — Category API + Badge Toast + Google Maps Types (March 8, 2026)
#### Added
- `server/storage/categories.ts` — CRUD for categories and suggestions tables
- `server/seed-categories.ts` — Idempotent seed from CategoryRegistry (24 categories)
- POST/GET `/api/category-suggestions` endpoints with Zod validation
- `components/badges/BadgeToast.tsx` — Animated badge notification toast with rarity colors
- `types/google-maps.d.ts` — Platform declarations for Google Maps window types

#### Changed
- Eliminated 3 `window as any` casts in search.tsx via platform declarations
- **Production `as any` casts: 7 -> 4 (91% total reduction from 43 across 4 sprints)**

### Sprint 72 — Category DB Migration + SafeImage Typed Wrapper + E2E Evaluation (March 8, 2026)
#### Added
- `categories` and `category_suggestions` tables in Drizzle schema with proper FK relations, jsonb fields, and insert validation
- `components/categories/SuggestCategory.tsx` — User-facing category suggestion form with vertical selector
- `docs/evaluations/E2E-FRAMEWORK-EVAL.md` — Maestro recommended over Detox for Expo compatibility
- 9 new schema validation tests (total: 159 across 12 files)

#### Changed
- `SafeImage` now accepts `ViewStyle | ImageStyle` — single internal cast replaces 8 external `as any` casts
- **Production `as any` casts: 17 → 7 (84% total reduction from 43 across 3 sprints)**

### Sprint 71 — Business Badge Display + DimensionValue Helper (March 8, 2026)
#### Added
- `lib/style-helpers.ts` — `pct()` DimensionValue helper for type-safe percentage widths/heights
- Business badge section on `app/business/[id].tsx` — displays earned badges via `BadgeRowCompact`

#### Changed
- Applied `pct()` across 6 files, eliminating 10 `as any` casts (27 → 17 total)
- **Total `as any` reduction: 43 → 17 (60%) across Sprints 70-71**

### Sprint 70 — Architectural Audit #4 + TypedIcon Type Safety (March 8, 2026)
#### Changed
- Created `TypedIcon` wrapper component — eliminates `as any` casts for Ionicons icon names
- Applied TypedIcon across 12 files, eliminating 16 `as any` casts (43 → 27 total)
- Architectural Audit #4: N1/N6 ALL CLEAR, 150 tests, 0 TS errors, security GOOD

### Sprint 69 — Index Extraction (Final N1/N6) + Category Registry Architecture (March 8, 2026)
#### Changed
- Extracted `PhotoMosaic`, `StarRating`, `PhotoStrip`, `HeroCard`, `RankedCard` from `index.tsx` into `components/leaderboard/SubComponents.tsx`
- `index.tsx` reduced from 1,031 to 306 LOC (-70%)
- **N1/N6 100% COMPLETE** — all 5 files resolved (total: 5,560 → 3,504 LOC, -37%)

#### Added
- `lib/category-registry.ts` — Extensible category architecture with 24 categories across 4 verticals (food, services, wellness, entertainment)
- Domain-specific at-a-glance fields per category (e.g., barbers: walkIn, specialties; gyms: equipment, classes)
- `CategorySuggestion` interface for user-requested categories with admin approval workflow
- 11 new category registry tests (total: 150 across 11 files)

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
