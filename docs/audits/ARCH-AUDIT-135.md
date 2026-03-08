# Sprint 135 — Architectural Audit #11

**Date**: 2026-03-08
**Theme**: Core Loop Performance + Process Recovery
**Tests**: 1323 across 62 files (all passing)
**Triggered by**: External critique scored core-loop focus at 2/10; 7 audits overdue

---

## Team Discussion

**Marcus Chen (CTO)**: "Seven missed audits is a process failure. The fact that both our internal critique (4/10) and the external critique (2/10) flagged this independently tells me we need to treat audits as non-negotiable infrastructure, not optional ceremony. The core-loop performance findings are exactly what these audits are supposed to catch."

**Amir Patel (Architecture)**: "The N+1 pioneer rate query and the O(N) rank recalculation loop are the two highest-impact findings. Both were introduced in the original implementation and never challenged because we didn't have enough data to feel the pain. But at scale — 200 ratings per member, 500 businesses per city-category — we're looking at 700+ queries per rating submission. That's a ticking bomb."

**Sarah Nakamura (Lead Eng)**: "Test coverage for the storage layer is the other big gap. `storage/members.ts`, `storage/ratings.ts`, and `storage/helpers.ts` contain the entire credibility engine and they have zero dedicated tests. We've been testing the HTTP endpoints but not the business logic underneath."

**Nadia Kaur (Cybersecurity)**: "Payment routes have no rate limiting. That's the highest-priority security finding. An attacker could hammer the Stripe webhook endpoint or payment creation routes. We need `apiRateLimiter` applied to `routes-payments.ts` immediately."

---

## Audit Results

### Grade: B+ (Production Ready with P1 Action Items)

- **0 Critical (P0)**
- **2 High (P1)** — file sizes, test coverage gaps for core logic
- **4 Medium (P2)** — type safety, security gaps, duplication, dependency hygiene
- **0 Low (P3)**

---

### N1: File Size — HIGH (P1)

7 files exceed 800 LOC:

| File | LOC | Action |
|------|-----|--------|
| `app/(tabs)/profile.tsx` | 1073 | Extract sub-components (Sprint 137) |
| `app/(tabs)/challenger.tsx` | 944 | Extract fighter card, voting section |
| `app/business/[id].tsx` | 934 | Review for extraction candidates |
| `app/(tabs)/search.tsx` | 907 | Already has SubComponents — extract more |
| `lib/badges.ts` | 886 | Stable data file — acceptable |
| `server/routes.ts` | 877 | Was extracted previously, grew back |
| `app/rate/[id].tsx` | 858 | Already has SubComponents — close to threshold |

### N2: Type Safety — MEDIUM (P2)

- 22 `as any` casts in production source (down from 43 at Sprint 70)
- Most are React Native style percentage casts (known platform limitation)
- 3 server-side casts need proper types: `routes.ts:792,809` (notificationPrefs), `routes.ts:433` (tagline), `seed.ts:109` (website)

### N3: Security — MEDIUM (P2)

- **No rate limiting on payment routes** — highest security priority
- 6 locations use unsanitized `req.query.city`/`req.query.category`
- 1 location uses unsanitized `req.body.city` in admin routes
- No hardcoded secrets. All SQL uses Drizzle parameterization. Good.

### N4: Test Coverage — HIGH (P1)

Core business logic files with zero dedicated tests:
- `server/storage/members.ts` (credibility engine, 360 LOC)
- `server/storage/ratings.ts` (rating submission + anomaly detection)
- `server/storage/helpers.ts` (vote weights, temporal decay, tier gates)
- `server/routes-payments.ts` (payment processing)

### N5: Duplication — MEDIUM (P2)

- 68 identical error-handling catch blocks across route files
- 9 duplicated pagination clamping patterns
- 6 duplicated city extraction patterns
- Client/server credibility logic duplicated in `lib/data.ts` and `server/storage/helpers.ts`

### N6: Dependencies — MEDIUM (P2)

- 5 `@types/*` packages in production dependencies (should be devDependencies)
- 2 unused packages: `@expo-google-fonts/inter`, `expo-symbols`

---

## Core-Loop Performance Findings (FIXED in Sprint 136)

### Pioneer Rate N+1 Query → Single Subquery
- **Before**: O(N) queries where N = member's total ratings (up to 201 queries)
- **After**: Single correlated subquery using `COUNT(*) FILTER`
- **File**: `server/storage/members.ts`

### Rank Recalculation Loop → Window Function
- **Before**: O(M) sequential UPDATEs where M = businesses in city+category (up to 500)
- **After**: Single `UPDATE ... FROM (SELECT ROW_NUMBER() OVER ...)` statement
- **File**: `server/storage/businesses.ts`

**Combined impact**: Worst-case queries per rating submission reduced from ~700+ to ~2.

---

## Action Items

| # | Priority | Item | Owner | Target |
|---|----------|------|-------|--------|
| 1 | P1 | Add rate limiting to payment routes | Nadia Kaur | Sprint 137 |
| 2 | P1 | Write tests for storage/members.ts + storage/ratings.ts | Sarah Nakamura | Sprint 137 |
| 3 | P1 | Extract profile.tsx sub-components (1073 LOC) | Priya Sharma | Sprint 137 |
| 4 | P2 | Extract wrapAsync middleware to eliminate 68 catch blocks | Amir Patel | Sprint 138 |
| 5 | P2 | Sanitize req.query.city/category in 6 locations | Nadia Kaur | Sprint 138 |
| 6 | P2 | Move @types/* to devDependencies | Sarah Nakamura | Sprint 138 |
| 7 | P2 | Add tests for routes-payments.ts | Sarah Nakamura | Sprint 139 |

---

## What's Next

Sprint 137 should close all P1 items: payment rate limiting, core storage tests, and profile extraction. Sprint 138 handles P2 items.

Next audit: Sprint 140.
