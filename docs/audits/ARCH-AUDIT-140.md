# Sprint 140 — Architectural Audit #12

**Date**: 2026-03-08
**Theme**: Post-Remediation Verification + Remaining Debt
**Tests**: 1569 across 71 files (all passing)
**Previous Audit**: #11 (Sprint 135) — Grade B+

---

## Team Discussion

**Marcus Chen (CTO)**: "This audit is a remediation check. Sprint 135 flagged 2 P1s and 4 P2s. I want to see what actually got closed. The profile extraction landed — 1073 down to 684 LOC, that's real progress. But I'm concerned that routes.ts still has 4 redundant try/catch blocks inside wrapAsync handlers. That's exactly the pattern wrapAsync was designed to eliminate."

**Amir Patel (Architecture)**: "The `requireAuth` function is copy-pasted identically in 4 route files: routes.ts, routes-admin.ts, routes-payments.ts, and routes-badges.ts. That's a textbook extract-to-shared-middleware opportunity. More importantly, `handlePhotoProxy` and `handleStripeWebhook` are async functions registered directly without `wrapAsync`. If either throws, Express 5 may handle it, but we should be explicit about error boundaries — especially on a payment webhook."

**Sarah Nakamura (Lead Eng)**: "Test coverage jumped from 1323 to 1569 — 246 new tests. We closed the storage/members.ts and storage/ratings.ts gaps from Audit #11. The `hashString` duplication between `lib/ab-testing.ts` and `server/routes-experiments.ts` is a new shared-module candidate. Same function, identical implementation, should live in `shared/`."

**Nadia Kaur (Cybersecurity)**: "Payment rate limiting is in place — `paymentRateLimiter` applied to all `/api/payments` routes. That closes the P1 security gap from last audit. The `@types/*` packages are still in production dependencies though — 5 packages that should be in devDependencies. Not a security risk, but it inflates the production bundle and signals sloppy dependency management."

---

## Audit Results

### Grade: A- (Production Ready, Minor Cleanup Remaining)

- **0 Critical (P0)**
- **0 High (P1)**
- **3 Medium (P2)** — redundant error handling, async handler wrapping, dependency hygiene
- **3 Low (P3)** — type safety, code duplication, shared module opportunity

---

### N1: Route Handler Consistency (wrapAsync) — MEDIUM (P2)

**Status**: Mostly resolved. All async inline handlers in all 5 route files use `wrapAsync`.

**Remaining issues:**

1. **Redundant try/catch inside wrapAsync**: 4 handlers in `routes.ts` still wrap their body in try/catch despite being inside `wrapAsync`. This defeats the purpose of centralized error handling.
   - Line 148: `POST /api/auth/signup`
   - Line 210: `POST /api/auth/google`
   - Line 576: `POST /api/ratings`
   - Line 729: `POST /api/category-suggestions`

2. **Async external handlers without wrapAsync**: 2 async handler functions are registered directly without `wrapAsync`:
   - `handlePhotoProxy` (server/photos.ts:12) — `app.get("/api/photos/proxy", handlePhotoProxy)`
   - `handleStripeWebhook` (server/stripe-webhook.ts:82) — `app.post("/api/webhook/stripe", handleStripeWebhook)`

**Evidence**: Routes.ts lines 752, 755 register async handlers without wrapping.

**Action**: Wrap external async handlers: `app.get("/api/photos/proxy", wrapAsync(handlePhotoProxy))`. Remove redundant try/catch from the 4 inline handlers.

**Target**: Sprint 141

---

### N2: File Sizes — LOW (P3)

**Status**: Significant improvement from Audit #11. Profile extraction closed the top P1 item.

| File | Audit #11 | Current | Delta | Status |
|------|-----------|---------|-------|--------|
| `app/(tabs)/profile.tsx` | 1073 | 684 | -389 | RESOLVED |
| `app/(tabs)/challenger.tsx` | 944 | 944 | 0 | WATCH |
| `app/business/[id].tsx` | 934 | 951 | +17 | WATCH |
| `app/(tabs)/search.tsx` | 907 | 907 | 0 | WATCH |
| `lib/badges.ts` | 886 | 886 | 0 | Stable data — acceptable |
| `server/routes.ts` | 877 | 782 | -95 | RESOLVED (under 800) |
| `app/rate/[id].tsx` | 858 | 858 | 0 | WATCH |

3 files remain above 900 LOC (challenger, business detail, search). None grew. No file crossed into critical territory (>1200 LOC).

**Action**: Extract challenger.tsx fighter card and voting section into SubComponents. Consider business/[id].tsx hero section extraction.

**Target**: Sprint 142 (non-blocking)

---

### N3: Shared Module Pattern — LOW (P3)

**Status**: `shared/` directory contains 4 modules: `admin.ts`, `credibility.ts`, `pricing.ts`, `schema.ts`.

**New duplication found:**

1. **`hashString` (DJB2)** — identical implementation in:
   - `lib/ab-testing.ts:46` (client)
   - `server/routes-experiments.ts:41` (server)

   This should be extracted to `shared/hash.ts`.

2. **Credibility calculation** — `lib/data.ts:169` (`calculateCredibilityScore`) and `server/storage/members.ts:111` (`recalculateCredibilityScore`) implement the same formula with different signatures. The shared module `shared/credibility.ts` exists but the server-side still uses its own implementation. This was flagged in Audit #11 (N5) and remains open.

3. **`requireAuth` middleware** — identical 5-line function defined in 4 files:
   - `server/routes.ts:46`
   - `server/routes-admin.ts:32`
   - `server/routes-payments.ts:15`
   - `server/routes-badges.ts:16`

   Should be extracted to `server/middleware.ts`.

**Action**: Extract `hashString` to `shared/hash.ts`. Extract `requireAuth` to `server/middleware.ts`. Evaluate unifying credibility calculation through `shared/credibility.ts`.

**Target**: Sprint 142

---

### N4: Test Coverage — LOW (P3)

**Status**: Strong improvement. 1569 tests across 71 files (up from 1323/62 at Audit #11).

**P1 gaps from Audit #11 — CLOSED:**
- `server/storage/members.ts` — covered by `sprint137-storage-members.test.ts`
- `server/storage/ratings.ts` — covered by `sprint137-storage-ratings.test.ts`

**Remaining gaps (non-critical):**
- `server/photos.ts` (handlePhotoProxy) — no dedicated test
- `server/deploy.ts` (handleWebhook, handleDeployStatus) — no dedicated test
- `server/badge-share.ts` (handleBadgeShare) — no dedicated test
- `lib/city-context.tsx` — AsyncStorage persistence logic untested
- Animation components added in Sprint 138 — unit tests exist (`sprint138-animations.test.ts`, `sprint138-transitions.test.ts`) but no integration coverage

**Action**: Add tests for photos.ts proxy and badge-share.ts OG rendering. Low priority — these are stable, thin handlers.

**Target**: Sprint 143

---

### N5: Dependency Hygiene — MEDIUM (P2)

**Status**: Not resolved from Audit #11. Still 5 `@types/*` packages in production dependencies.

**In `dependencies` (should be `devDependencies`):**
1. `@types/bcrypt` — type declarations only
2. `@types/connect-pg-simple` — type declarations only
3. `@types/express-session` — type declarations only
4. `@types/passport` — type declarations only
5. `@types/passport-local` — type declarations only

**Still unused (flagged in Audit #11):**
1. `@expo-google-fonts/inter` — project uses DM Sans and Playfair Display, not Inter
2. `expo-symbols` — no imports found in production code

**Action**: Move all `@types/*` to devDependencies. Remove `@expo-google-fonts/inter` and `expo-symbols`.

**Target**: Sprint 141

---

### N6: Type Safety — LOW (P3)

**Status**: 27 `as any` casts in production source (up from 22 at Audit #11, but 5 new ones are in Sprint 138 animation/admin code).

**Breakdown by category:**

| Category | Count | Notes |
|----------|-------|-------|
| React Native style percentages | 11 | Known platform limitation; `style-helpers.ts` provides `pct()` but not universally adopted |
| Server-side missing types | 5 | `routes.ts` (tagline, notificationPrefs x2), `seed.ts` (website), `routes-admin.ts` (payload) |
| Component refs/styles | 6 | `challenger.tsx` (cardRef), `search.tsx` (mapRef), `SubComponents.tsx`, `CookieConsent.tsx` x3, `PricingBadge.tsx` |
| Window/browser | 3 | `_layout.tsx` (window.__REMOVE_LOADING), `rate/[id].tsx` (prev check), `admin/dashboard.tsx` |
| Type declaration comments | 2 | `google-maps.d.ts`, `SafeImage.tsx` — descriptive, not actual casts |

**Action**: Replace 3 server-side casts in routes.ts with proper types (add `tagline` to business type, add `notificationPrefs` to session user type). Adopt `pct()` helper in remaining style casts.

**Target**: Sprint 143 (non-blocking)

---

## Remediation Scorecard (from Audit #11)

| # | Audit #11 Item | Priority | Status |
|---|----------------|----------|--------|
| 1 | Payment route rate limiting | P1 | CLOSED — `paymentRateLimiter` applied |
| 2 | Storage/members + ratings tests | P1 | CLOSED — 2 dedicated test files added |
| 3 | Profile.tsx extraction (1073 LOC) | P1 | CLOSED — reduced to 684 LOC |
| 4 | wrapAsync middleware (68 catch blocks) | P2 | PARTIAL — wrapAsync adopted, 4 redundant try/catch remain |
| 5 | Sanitize req.query.city/category | P2 | CLOSED — `sanitizeString` applied throughout |
| 6 | Move @types/* to devDependencies | P2 | OPEN — still in production deps |
| 7 | Payment route tests | P2 | CLOSED — `payments.test.ts`, `payment-records.test.ts` exist |

**Closure rate: 5/7 fully closed, 1 partial, 1 open.**

---

## Action Items

| # | Priority | Item | Owner | Target |
|---|----------|------|-------|--------|
| 1 | P2 | Wrap `handlePhotoProxy` and `handleStripeWebhook` with `wrapAsync` | Amir Patel | Sprint 141 |
| 2 | P2 | Remove 4 redundant try/catch blocks inside wrapAsync handlers | Sarah Nakamura | Sprint 141 |
| 3 | P2 | Move 5 `@types/*` to devDependencies; remove `@expo-google-fonts/inter`, `expo-symbols` | Sarah Nakamura | Sprint 141 |
| 4 | P3 | Extract `requireAuth` to `server/middleware.ts` (4 duplicate definitions) | Amir Patel | Sprint 142 |
| 5 | P3 | Extract `hashString` to `shared/hash.ts` (client/server duplication) | Sarah Nakamura | Sprint 142 |
| 6 | P3 | Extract challenger.tsx fighter card + voting section (<944 LOC target) | Priya Sharma | Sprint 142 |
| 7 | P3 | Add proper types for `tagline`, `notificationPrefs`, webhook `payload` | Sarah Nakamura | Sprint 143 |

---

## Summary

Grade improved from **B+** to **A-**. All P1 items from Audit #11 are closed. The codebase is in strong shape: 1569 tests, consistent wrapAsync adoption, payment rate limiting in place, and the largest file (profile.tsx) was cut by 36%. Remaining work is cleanup-grade: dependency hygiene, a few redundant error handling patterns, and extracting 3 small shared utilities.

Next audit: Sprint 145.
