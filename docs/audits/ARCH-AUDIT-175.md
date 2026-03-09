# Architecture Audit #17 — Sprint 175

**Date:** 2026-03-09
**Auditor:** Amir Patel (Architecture Lead)
**Previous Audit:** Sprint 170 (Audit #16, Grade A-)

---

## Overall Grade: A-

Maintaining A- from previous audit. Technical debt window (171-172) resolved the two chronic findings (routes.ts, rate/[id].tsx). New additions are clean and pattern-consistent.

---

## File Size Audit

### Files >500 Lines (Source Code)
| File | Lines | Status | Action |
|------|-------|--------|--------|
| `lib/badges.ts` | 886 | HIGH | Consider splitting badge definitions from evaluation logic |
| `components/profile/SubComponents.tsx` | 863 | HIGH | Needs decomposition (same pattern as business/SubComponents) |
| `app/(tabs)/search.tsx` | 717 | MEDIUM | Stable — DishLeaderboardSection already extracted |
| `app/(tabs)/profile.tsx` | 655 | MEDIUM | Monitor — could extract settings sections |
| `app/business/[id].tsx` | 567 | OK | Down from 800+ after SubComponents extraction |
| `components/DishLeaderboardSection.tsx` | 488 | OK | Self-contained component |
| `app/(tabs)/challenger.tsx` | 484 | OK | Under 500 target |

### Files >800 Lines
| File | Lines | Priority |
|------|-------|----------|
| `lib/badges.ts` | 886 | MEDIUM — functional complexity, not debt |
| `components/profile/SubComponents.tsx` | 863 | HIGH — decompose like business/SubComponents |
| `tests/sprint146-experiment-http-pipeline.test.ts` | 895 | LOW — test file, acceptable |

### Resolved Since Last Audit
- ✅ `server/routes.ts`: 961→332 (Sprint 171)
- ✅ `app/rate/[id].tsx`: 898→450 (Sprint 172)

---

## Type Safety

### `as any` Casts
- **Source code:** ~50-60 occurrences (stable)
- **Test files:** ~30 occurrences (acceptable for test assertions)
- **Documentation:** ~240 occurrences (in sprint docs, not actionable)
- **Trend:** Stable. No new `as any` casts introduced in Sprints 171-175.
- **Action:** None required.

---

## Route Architecture

### Route Modules (10 total)
| Module | Lines | Purpose |
|--------|-------|---------|
| routes.ts (main) | 332 | Core routes: leaderboard, ratings, categories, SSE |
| routes-admin.ts | 343 | Admin panel endpoints |
| routes-auth.ts | 256 | Authentication + GDPR |
| routes-members.ts | 248 | Member profile + preferences |
| routes-businesses.ts | 172 | Business search + detail + dashboard |
| routes-payments.ts | ~150 | Stripe integration |
| routes-badges.ts | ~80 | Badge endpoints |
| routes-experiments.ts | ~100 | A/B experiment endpoints |
| routes-dishes.ts | 62 | Dish leaderboard API |
| routes-seo.ts | 103 | sitemap.xml, robots.txt, JSON-LD |

**Assessment:** Well-balanced. No module over 350 lines. Clean domain separation.

---

## New Additions (Sprint 171-175)

### Sprint 173: Claim Verification
- Ownership transfer logic in storage — clean single-transaction pattern
- Email notifications follow existing template system
- Dashboard access control — owner + admin gating ✅
- **Risk:** None identified

### Sprint 174: SEO
- New route module (routes-seo.ts) — 103 lines, appropriate scope
- Dedicated dish page (app/dish/[slug].tsx) — 274 lines, well-structured
- Dynamic meta via Expo Router Head — correct approach for web target
- **Risk:** No caching on sitemap.xml generation. Low risk at current traffic.

### Sprint 175: Push Triggers
- notification-triggers.ts — clean separation from push.ts
- Weekly digest scheduler — follows existing setInterval pattern
- All triggers respect user notification preferences
- **Risk:** Weekly digest queries all members with tokens — could be slow at scale. Acceptable for now.

---

## Test Coverage

| Metric | Value | Trend |
|--------|-------|-------|
| Test files | 108 | +3 from Sprint 170 |
| Total tests | 2,520 | +111 from Sprint 170 |
| Execution time | 1.8s | Stable |
| Tests per file | 23.3 avg | Healthy |

---

## Security Review

- ✅ Dashboard access control added (Sprint 173)
- ✅ robots.txt blocks /admin/ and /api/ from crawlers
- ✅ Push notifications check user preferences before sending
- ✅ Email functions sanitize display names
- ✅ No PII in structured data or sitemap

---

## Findings Summary

| ID | Severity | Finding | Action |
|----|----------|---------|--------|
| A17-1 | MEDIUM | `profile/SubComponents.tsx` at 863 lines | Decompose in next tech debt window |
| A17-2 | MEDIUM | `lib/badges.ts` at 886 lines | Consider splitting definitions from logic |
| A17-3 | LOW | sitemap.xml not cached | Add Cache-Control when traffic grows |
| A17-4 | LOW | Weekly digest queries all members | Add pagination/batching at scale |

---

## Grade History
| Audit | Sprint | Grade |
|-------|--------|-------|
| #12 | 140 | A- |
| #13 | 145 | A- |
| #14 | 150 | A- |
| #15 | 155 | A- |
| #16 | 170 | A- |
| #17 | 175 | A- |

**Trajectory:** Stable A-. The profile/SubComponents decomposition would push to A.

---

## Next Audit: Sprint 180
