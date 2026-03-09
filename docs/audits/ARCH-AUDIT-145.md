# Sprint 145 — Architectural Audit #13

**Date**: 2026-03-08
**Theme**: Post-Decomposition Health Check + Experiment Infrastructure Maturity
**Tests**: 1881 across 85 files (all passing)
**Previous Audit**: #12 (Sprint 140) — Grade A-

---

## Team Discussion

**Marcus Chen (CTO)**: "Five sprints since the last audit and we shipped a lot of experiment infrastructure — tracker, Wilson scoring, exposure/outcome pipelines. The question is whether we introduced new coupling while doing it. I also want a hard look at the 5 external async handlers still registered without `wrapAsync`. That was a P2 last time and it is still open."

**Amir Patel (Architecture)**: "The good news: business/[id].tsx went from 951 to 533 LOC — that is a 44% reduction, one of the biggest decompositions we have done. 17 extracted subcomponents in `components/business/`. The shared module story is improving too — `requireAuth` consolidated into `server/middleware.ts`, `hashString` extracted to `shared/hash.ts`, `shared/credibility.ts` is the single source of truth for tier logic. The bad news: `handlePhotoProxy`, `handleStripeWebhook`, `handleWebhook`, `handleDeployStatus`, and `handleBadgeShare` are all registered bare — no `wrapAsync`. That is 5 unwrapped async handlers on production routes."

**Sarah Nakamura (Lead Eng)**: "Tests jumped from 1569 to 1881 — 312 new tests over 5 sprints. We added HTTP freshness tests, experiment E2E tests, product path coverage, and behavioral boundary tests. The 4 redundant try/catch blocks inside `wrapAsync` handlers in routes.ts are still there though. Lines 144, 206, 453, 577. Those were flagged in Audit #12 and have not been touched."

**Nadia Kaur (Cybersecurity)**: "The `@types/*` packages were moved out of production dependencies — that P2 is closed. But `@expo-google-fonts/inter` and `expo-symbols` are still in `dependencies` despite zero imports in production code. These are dead dependencies that inflate the install footprint. On the positive side, no new security concerns — rate limiting, CORS, CSP, and OWASP headers are all stable."

**Priya Sharma (Senior Frontend)**: "Challenger.tsx dropped from 944 to 484 LOC — fighter card and voting logic extracted to `components/challenger/SubComponents.tsx` at 531 LOC. Search.tsx dropped from 907 to 713, with MapView and related components in `components/search/SubComponents.tsx` at 554 LOC. The rate page at 858 LOC is now the largest frontend file. CHANGELOG is stale at Sprint 136 — that is 9 sprints behind."

**Jordan Blake (Compliance)**: "Wilson score is implemented with a real formula in `experiment-tracker.ts` using proper confidence intervals. All 3 registered experiments are active. The experiment infrastructure has proper exposure tracking, outcome correlation, and dashboard computation. No compliance gaps in the A/B testing pipeline."

---

## Audit Results

### Grade: A- (Production Ready, Minor Cleanup Remaining)

- **0 Critical (P0)**
- **0 High (P1)**
- **4 Medium (P2)** — unwrapped handlers, redundant error handling, stale CHANGELOG, dead dependencies
- **3 Low (P3)** — `as any` casts, rate page file size, MapView not fully extracted

---

### N1: Unwrapped Async Handlers — MEDIUM (P2)

**Status**: OPEN (carried from Audit #12 N1). 5 external async handlers registered without `wrapAsync`.

**Affected handlers** (all in `server/routes.ts`):

| Line | Handler | Route |
|------|---------|-------|
| 771 | `handlePhotoProxy` | `GET /api/photos/proxy` |
| 774 | `handleStripeWebhook` | `POST /api/webhook/stripe` |
| 784 | `handleWebhook` | `POST /api/webhook/deploy` |
| 785 | `handleDeployStatus` | `GET /api/deploy/status` |
| 788 | `handleBadgeShare` | `GET /share/badge/:badgeId` |

Express 5 may catch unhandled rejections, but explicit `wrapAsync` wrapping ensures consistent error logging and response formatting. The Stripe webhook handler is particularly concerning — a payment webhook that silently swallows errors could cause data loss.

**Action**: Wrap all 5 handlers: `app.get("/api/photos/proxy", wrapAsync(handlePhotoProxy))`, etc.

**Target**: Sprint 146

---

### N2: Redundant Try/Catch Inside wrapAsync — MEDIUM (P2)

**Status**: OPEN (carried from Audit #12 N1). 4 inline handlers wrapped in both `wrapAsync` and an internal `try { ... } catch` block.

| Line | Route |
|------|-------|
| 143–144 | `POST /api/auth/signup` |
| 205–206 | `POST /api/auth/google` |
| 453 | `GET /api/businesses/:slug` (nested try) |
| 576–577 | `POST /api/ratings` |

These defeat the purpose of `wrapAsync`, which exists precisely to eliminate per-handler try/catch boilerplate. The inconsistency makes it unclear to future contributors whether they should add try/catch or rely on `wrapAsync`.

**Action**: Remove the redundant try/catch blocks. If any handler needs specific error transformation (e.g., auth signup returning a user-friendly message on duplicate email), use the catch block in `wrapAsync`'s error handler or throw a custom error.

**Target**: Sprint 146

---

### N3: Stale CHANGELOG — MEDIUM (P2)

**Status**: NEW. CHANGELOG.md last entry is Sprint 136. Current sprint is 145 — that is 9 sprints behind.

Sprints 137-145 introduced significant features (experiment tracking, tier staleness guard, HTTP freshness, product path coverage, business decomposition, Wilson scoring) none of which are documented in the CHANGELOG.

**Action**: Backfill CHANGELOG entries for Sprints 137-145.

**Target**: Sprint 146

---

### N4: Dead Dependencies — MEDIUM (P2)

**Status**: PARTIAL improvement from Audit #12 N5.

**Closed**: All 5 `@types/*` packages moved to devDependencies.

**Still open**:
1. `@expo-google-fonts/inter` (v0.4.0) — project uses DM Sans and Playfair Display, not Inter. Zero imports in production code.
2. `expo-symbols` (v1.0.8) — no imports found anywhere in production code.

**Action**: Remove both packages from `package.json`.

**Target**: Sprint 146

---

### N5: Type Safety (`as any` Casts) — LOW (P3)

**Status**: Stable. 27 `as any` casts in production source (unchanged from Audit #12).

**Breakdown**:

| Category | Count | Notes |
|----------|-------|-------|
| React Native style percentages | 8 | CookieConsent (5), PricingBadge (2), admin/dashboard (1) |
| Server-side missing types | 4 | routes.ts (tagline, notificationPrefs x2), seed.ts (website) |
| Component refs/styles | 4 | LocationCard (1), SubComponents (2), admin/dashboard (1) |
| Window/browser | 2 | _layout.tsx (window.__REMOVE_LOADING) |
| Query/data | 2 | rate/[id].tsx (prev check), routes-admin.ts (payload) |
| Profile style | 1 | profile.tsx (credScore) |

No increase since Audit #12. The `pct()` helper in `lib/style-helpers.ts` exists but is not universally adopted for percentage casts.

**Action**: Adopt `pct()` helper in CookieConsent.tsx and PricingBadge.tsx to eliminate 7 of the 8 style casts. Add `tagline` and `notificationPrefs` to proper TypeScript interfaces.

**Target**: Sprint 148 (non-blocking)

---

### N6: File Sizes — LOW (P3)

**Status**: Major improvement. Multiple decompositions landed.

| File | Audit #12 | Current | Delta | Status |
|------|-----------|---------|-------|--------|
| `app/(tabs)/challenger.tsx` | 944 | 484 | -460 | RESOLVED |
| `app/business/[id].tsx` | 951 | 533 | -418 | RESOLVED |
| `app/(tabs)/search.tsx` | 907 | 713 | -194 | RESOLVED (under 800) |
| `app/rate/[id].tsx` | 858 | 858 | 0 | WATCH |
| `server/routes.ts` | 782 | 801 | +19 | WATCH (slightly over 800) |
| `lib/badges.ts` | 886 | 886 | 0 | Stable data — acceptable |
| `app/(tabs)/profile.tsx` | 684 | 684 | 0 | Stable |

The 3 "WATCH" files from Audit #12 (challenger, business, search) are all resolved. `app/rate/[id].tsx` at 858 LOC is the new largest frontend file. `server/routes.ts` crept back to 801 LOC (+19 from new experiment/tier routes).

**Action**: Consider extracting rate/[id].tsx validation and submission logic into a custom hook. Monitor routes.ts — if it crosses 850, extract more handlers into dedicated route files.

**Target**: Sprint 149 (non-blocking)

---

### N7: MapView Extraction — LOW (P3)

**Status**: Partially resolved. `MapView` component is defined in `components/search/SubComponents.tsx` (line 272) alongside 4 other components. At 554 LOC, this SubComponents file is becoming a mini-monolith itself.

**Action**: Consider splitting `components/search/SubComponents.tsx` into individual files: `MapView.tsx`, `BusinessCard.tsx`, etc. Same applies to `components/challenger/SubComponents.tsx` (531 LOC) and `components/leaderboard/SubComponents.tsx` (503 LOC).

**Target**: Sprint 150 (non-blocking)

---

## Remediation Scorecard (from Audit #12)

| # | Audit #12 Item | Priority | Status |
|---|----------------|----------|--------|
| 1 | Wrap `handlePhotoProxy` + `handleStripeWebhook` with `wrapAsync` | P2 | OPEN — now 5 unwrapped handlers |
| 2 | Remove 4 redundant try/catch blocks inside wrapAsync handlers | P2 | OPEN — all 4 still present |
| 3 | Move 5 `@types/*` to devDependencies; remove unused deps | P2 | PARTIAL — types moved, 2 dead deps remain |
| 4 | Extract `requireAuth` to `server/middleware.ts` | P3 | CLOSED — single definition, all route files import it |
| 5 | Extract `hashString` to `shared/hash.ts` | P3 | CLOSED — shared module, server re-exports for compat |
| 6 | Extract challenger.tsx fighter card + voting section | P3 | CLOSED — 944 to 484 LOC |
| 7 | Add proper types for `tagline`, `notificationPrefs`, webhook `payload` | P3 | OPEN — 4 server-side `as any` remain |

**Closure rate: 3/7 fully closed, 1 partial, 3 open.**

The 2 P2 items (wrapAsync wrapping + redundant try/catch) have been open for 2 consecutive audits. These need priority attention in Sprint 146.

---

## Expected Improvements — Verification

| Improvement | Expected | Actual |
|-------------|----------|--------|
| Business decomposition (1023 to barrel) | Yes | CONFIRMED — 951 to 533 LOC, 17 subcomponents extracted |
| HTTP freshness tests added | Yes | CONFIRMED — `sprint145-http-freshness.test.ts` (629 LOC) |
| Wilson score real implementation | Yes | CONFIRMED — `experiment-tracker.ts:282` with proper confidence intervals |
| All experiments activated | Yes | CONFIRMED — 3 experiments in registry, all `active: true` |
| MapView extraction | Yes | PARTIAL — extracted to SubComponents.tsx function, not own file |

---

## Positive Trends

1. **Test growth**: 1569 to 1881 (+312 tests, +20%) over 5 sprints. 85 test files. Strong coverage of experiments, HTTP behavior, and product paths.
2. **Decomposition velocity**: 3 major page extractions landed (challenger -460, business -418, search -194). Total LOC reduction of 1072 across watched files.
3. **Shared module adoption**: `shared/` now has 5 modules (admin, credibility, hash, pricing, schema). No new server/client duplication detected.
4. **Experiment infrastructure maturity**: Full pipeline from bucketing (client) to exposure tracking to outcome measurement to Wilson-scored dashboard computation.
5. **Tier staleness guard**: `server/tier-staleness.ts` (176 LOC) catches stale tier assignments post-rating and self-corrects.

---

## Action Items

| # | Priority | Item | Owner | Target |
|---|----------|------|-------|--------|
| 1 | P2 | Wrap 5 external async handlers with `wrapAsync` | Amir Patel | Sprint 146 |
| 2 | P2 | Remove 4 redundant try/catch blocks in routes.ts | Sarah Nakamura | Sprint 146 |
| 3 | P2 | Backfill CHANGELOG for Sprints 137-145 | Priya Sharma | Sprint 146 |
| 4 | P2 | Remove `@expo-google-fonts/inter` and `expo-symbols` from dependencies | Sarah Nakamura | Sprint 146 |
| 5 | P3 | Add proper TypeScript types for `tagline`, `notificationPrefs`, `payload` | Sarah Nakamura | Sprint 147 |
| 6 | P3 | Adopt `pct()` helper in CookieConsent + PricingBadge to reduce `as any` casts | Priya Sharma | Sprint 148 |
| 7 | P3 | Consider rate/[id].tsx extraction (858 LOC) | Priya Sharma | Sprint 149 |
| 8 | P3 | Split SubComponents.tsx files into individual component files | Amir Patel | Sprint 150 |

---

## Summary

Grade holds at **A-**. No Critical or High findings. The codebase is in strong shape structurally — the 3 largest frontend pages were all decomposed successfully, shared modules are consolidating, and test coverage grew 20% to 1881 tests. The experiment infrastructure (tracker, Wilson scoring, exposure/outcome pipeline) is well-architected.

Two P2 items (unwrapped async handlers and redundant try/catch) are now open for 2 consecutive audits. These are not risky enough to downgrade from A-, but they represent engineering hygiene debt that should not carry into Audit #14. The stale CHANGELOG (9 sprints behind) is a new P2 — documentation currency matters for a codebase this active.

Next audit: Sprint 150.
