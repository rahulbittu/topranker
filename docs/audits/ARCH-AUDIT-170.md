# Architecture Audit #16 — Sprint 170

**Date:** 2026-03-09
**Auditor:** Amir Patel (Architecture)
**Grade: A-** (stable from A at Sprint 165)

---

## Scorecard

| Category | Sprint 165 | Sprint 170 | Δ | Status |
|----------|-----------|-----------|---|--------|
| Tests | 2,220 | 2,334 | +114 | IMPROVING |
| Test files | 99 | 103 | +4 | IMPROVING |
| `as any` casts | 5* | 23 | +18 | ACCEPTABLE** |
| Files >800 LOC | 2 | 3 | +1 | ACTION |
| API endpoints | 75 | 80 | +5 | GROWING |
| Database indexes | 10 | 10+ | — | STABLE |
| TODO comments | 0 | 0 | — | CLEAN |
| Console logs | 0 | 0 | — | CLEAN |
| Type suppressions | 0 | 0 | — | CLEAN |
| Test execution | <1.7s | 1.67s | — | OPTIMAL |

\* Sprint 165 counted server-side only; Sprint 170 counts all directories
\** 23 casts are mostly RN StyleSheet percentage workarounds (6), DOM refs (3), and type flexibility (6) — all justified

---

## Findings

### MEDIUM (2)

**M1: server/routes.ts — 961 lines** (recurring since Sprint 140)
- Approaching 1000 LOC CI limit again
- Previous fix: extracted routes-admin.ts (Sprint 142), routes-dishes.ts (Sprint 166)
- Still contains ratings, search, auth, SSE, featured, members routes mixed together
- **Recommendation:** Split into routes-ratings.ts, routes-search.ts, routes-auth.ts
- **Target:** Sprint 171
- **Escalation:** This has been MEDIUM for 6 audits. Escalating to HIGH if not resolved by Sprint 175.

**M2: app/rate/[id].tsx — 898 lines** (recurring since Sprint 165)
- Grew from 884 to 898 with dish context features
- Single file handles: form state, submission, dish search, photo upload, confirmation screen
- **Recommendation:** Extract to custom hooks (useRatingForm, useDishSearch) + ConfirmationScreen component
- **Target:** Sprint 172

### LOW (3)

**L1: components/profile/SubComponents.tsx — 863 lines**
- Already decomposed from profile.tsx; barrel pattern in use
- Monitor for further growth. Consider splitting if it crosses 1000 LOC.

**L2: 23 `as any` casts across 17 files**
- Breakdown: StyleSheet workarounds (6), DOM refs (3), data mapping (6), property workarounds (5), safe access (2), Stripe types (1)
- No unsafe casts detected. All are justified or unavoidable in React Native.
- No action required.

**L3: In-memory analytics buffer**
- FunnelEvent buffer and rate gate stats are in-memory only
- Acceptable for current scale (<100 concurrent users)
- Track for migration to PostHog when integration lands

---

## Security Posture

| Check | Status |
|-------|--------|
| Auth on POST/PUT/DELETE | 100% |
| Rate limiting on /api | Active |
| SSE connection limits | Active |
| OWASP security headers | Active |
| Input sanitization | Active |
| Credibility weight validation | Active |
| Anti-gaming rules (6) | Active |
| CORS configuration | Active |

**Assessment:** EXCELLENT — no new attack surfaces from dish leaderboard feature.

---

## Dish Leaderboard Architecture Review

The 4-sprint dish leaderboard delivery (166-169) is architecturally sound:

1. **Schema:** Clean separation — dishLeaderboards, dishLeaderboardEntries, dishSuggestions, dishSuggestionVotes
2. **Storage:** Dedicated dishes.ts with recalculation logic, credibility weighting
3. **Routes:** Extracted to routes-dishes.ts — good isolation
4. **UI:** Self-contained DishLeaderboardSection.tsx with own queries
5. **Batch job:** Follows established setInterval + graceful shutdown pattern
6. **Anti-gaming:** Inherits core credibility weighting + flagged rating exclusion

**Concern:** Batch job iterates boards sequentially. At >50 boards, consider Promise.allSettled parallelism.

---

## Grade Justification

**A-** (not A) because:
- routes.ts at 961 lines is a recurring unresolved finding
- rate/[id].tsx at 898 lines — growing complexity
- Both have clear remediation plans for Sprints 171-172

**Trajectory:** C+ → A+ → B+ → A+ → B+ → A- → A → A-
The grade reflects stability — we're shipping features without degrading quality, but two decomposition debts need clearing.

---

## Next Audit: Sprint 175
