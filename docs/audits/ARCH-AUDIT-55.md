# Architectural Audit #1 — Post-Sprint 55

**Trigger**: Sprint 55 milestone (every 5 sprints per process doc)
**Date**: March 7, 2026
**Led by**: Marcus Chen (CTO) + Architecture Council (James Park, Priya Sharma, Alex Volkov, Mei Lin)
**Reviewed by**: Nadia Kaur (Security), Carlos Ruiz (QA), Victoria Ashworth (Legal)
**Scope**: Full codebase scan — security, performance, type safety, duplication, testing, dependencies, architecture, data model, compliance

---

## Executive Summary

The codebase has grown rapidly through 55 sprints. Core business logic (credibility scoring, tier system, rating flow) is solid and well-tested. However, the audit reveals **2 CRITICAL**, **5 HIGH**, **4 MEDIUM**, and **4 LOW** findings that must be addressed to maintain production quality as we scale.

**Total LOC**: ~37,865 across all files
**Test Count**: 39 tests (24 credibility + 15 tier-perks)
**TypeScript Errors**: 1 pre-existing (timer type in rate/[id].tsx)

---

## CRITICAL Findings (P0 — Must fix NEXT sprint)

### C1: Hardcoded Session Secret Fallback
**File**: `server/auth.ts`
**Finding**: Session secret falls back to `"top-ranker-secret-key"` when `SESSION_SECRET` env var is missing. In production, if the env var is unset, all sessions are signed with a publicly visible secret.
**Risk**: Complete session hijacking — any attacker can forge valid session cookies.
**Owner**: Nadia Kaur (Security)
**Fix**: Remove fallback. Crash on startup if `SESSION_SECRET` is not set. Add to deployment checklist.
**Points**: 2

**Marcus Chen**: "This is a textbook session hijacking vector. The fallback pattern is convenient for local dev but catastrophic in production. We need to fail loud — if the secret isn't set, the server should not start."

**Nadia Kaur**: "I'd classify this as our single highest-risk vulnerability. One missing env var and every user session is compromisable. We also need to audit all other env var fallbacks — this pattern may exist elsewhere."

### C2: Hardcoded Admin Email Whitelist (3 locations)
**Files**: `server/routes.ts` (2 locations), `app/(tabs)/profile.tsx`, `app/admin/index.tsx`
**Finding**: Admin access is gated by hardcoded email arrays: `["rahul@topranker.com", "admin@topranker.com", "alex@demo.com"]`. These are duplicated across 3+ files with no single source of truth. Adding/removing an admin requires code changes and redeployment.
**Risk**: Privilege escalation if lists diverge; `alex@demo.com` is a demo account with full admin access in production.
**Owner**: Priya Sharma (Backend)
**Fix**: Phase 1 (this sprint): Extract to single `ADMIN_EMAILS` constant in shared config. Phase 2 (Sprint 58): Database-stored RBAC with roles table.
**Points**: 3

**Victoria Ashworth**: "The `alex@demo.com` entry is particularly concerning. A demo account should never have production admin access. This needs to be removed immediately regardless of the RBAC timeline."

**Priya Sharma**: "I'll create a shared `config/admin.ts` that exports the whitelist as Phase 1. The full RBAC system — roles table, permission checks, admin panel for role management — is a Sprint 57-58 deliverable per the backlog."

---

## HIGH Findings (P1 — Schedule within 2 sprints)

### H1: Six Files Exceed 1000 LOC — Split Candidates
**Files**:
| File | LOC | Concern |
|------|-----|---------|
| `app/business/[id].tsx` | 1,210 | Business profile — hero, scores, ratings, dishes, map, claim flow all in one file |
| `app/(tabs)/search.tsx` | 1,159 | Search — filters, trending, featured, map view, category chips |
| `app/rate/[id].tsx` | 1,104 | Rating flow — 2-step form, photo upload, submission, confirmation |
| `app/(tabs)/profile.tsx` | 1,055 | Profile — stats, tier, perks, history, settings |
| `server/storage.ts` | 1,010 | All database operations in single file |
| `app/(tabs)/index.tsx` | 1,007 | Leaderboard — rankings, challengers, city selector |

**Risk**: Merge conflicts, cognitive load, harder to test individual components. Our threshold is 800 LOC.
**Owner**: James Park (Frontend Architect)
**Fix**: Extract sections into focused components/modules. Priority: `storage.ts` (split by domain: users, businesses, ratings, challengers) and `business/[id].tsx` (extract BusinessHero, ScoreCard, RatingsList, DishGrid).
**Points**: 8

**James Park**: "The frontend files are manageable because React components naturally section themselves. But `storage.ts` is the real concern — it's a god object with every database operation. We should split it into `storage/users.ts`, `storage/businesses.ts`, `storage/ratings.ts`, `storage/challengers.ts` with a barrel export."

### H2: 42 `as any` Type Casts Across 16 Files
**Distribution**: Server routes (12), React components (18), shared types (7), test files (5)
**Risk**: Type safety erosion. Each `as any` is a potential runtime error that TypeScript can't catch.
**Owner**: Mei Lin (Type Safety)
**Fix**: Audit each cast. Replace with proper types, generics, or type guards. Target: reduce to <10.
**Points**: 5

**Mei Lin**: "Most of these are in request handlers where `req.user` is typed as `Express.User` but we need email/id fields. The fix is a proper `AuthenticatedRequest` interface that extends Express.Request with our user shape. That alone eliminates 12 casts."

### H3: Test Coverage Gap — 39 Tests for 37,865 LOC
**Current**: Only `credibility.test.ts` (24 tests) and `tier-perks.test.ts` (15 tests) exist.
**Missing**: Zero tests for API endpoints, React components, rating submission, challenger logic, admin operations, city seeding, auth flows.
**Risk**: Regressions ship undetected. CEO mandate (March 7): "Testing has to be immaculate."
**Owner**: Sage (Backend Testing) + Carlos Ruiz (QA)
**Fix**: Sprint 56: API endpoint tests with supertest (auth, ratings, business CRUD). Sprint 57: Component tests. Target: 150+ tests by Sprint 60.
**Points**: 8

**Carlos Ruiz**: "39 tests is a foundation, not a safety net. We need integration tests for every public API endpoint — that's our highest-leverage testing investment. A single supertest suite covering the 12 main routes would catch 80% of regressions."

**Sage**: "I'll start with the rating submission flow — it's the most critical user path and touches credibility scoring, rate gating, and business score recalculation. One integration test there covers 3 business logic modules."

### H4: No Centralized Environment Configuration
**Finding**: `process.env` is referenced in 25+ locations with no validation or centralization. Missing env vars silently fall back to undefined or hardcoded defaults.
**Risk**: Silent misconfiguration in production. See C1 for the worst case.
**Owner**: Alex Volkov (DevOps)
**Fix**: Create `server/config.ts` that validates all required env vars at startup. Crash if any required var is missing. Export typed config object.
**Points**: 3

**Alex Volkov**: "We need a config module that reads all env vars once at startup, validates them, and exports a typed object. Every other module imports from config — no direct `process.env` access. This is standard practice at any production service."

### H5: 49 Console.log/error/warn Statements
**Distribution**: 21 files, mix of debug logs and error handling.
**Risk**: Logs leak to production, no structured logging, no log levels, potential PII exposure.
**Owner**: Nina Petrov (Infrastructure)
**Fix**: Replace with structured logger (winston/pino). Add log levels. Strip debug logs from production builds.
**Points**: 3

**Nina Petrov**: "Console.log in production is a compliance risk — we could accidentally log user emails or session tokens. A structured logger with levels (debug/info/warn/error) and PII scrubbing is essential before launch."

---

## MEDIUM Findings (P2 — Track in backlog)

### M1: Category Data Duplication
**Files**: `constants/brand.ts` AND `lib/data.ts` both define `CATEGORY_LABELS` and category emoji mappings.
**Risk**: Inconsistency if one is updated but not the other.
**Fix**: Single source of truth in `constants/brand.ts`, remove duplicate from `lib/data.ts`.
**Points**: 2

### M2: No Database Indexes Defined
**Finding**: Drizzle schema defines tables but no explicit indexes beyond primary keys.
**Risk**: Query performance degrades as data grows. Business lookups by city, ratings by user, challenger queries all need indexes.
**Fix**: Add indexes on `businesses.city`, `businesses.category`, `ratings.userId`, `ratings.businessId`, `challengers.status`.
**Points**: 3

### M3: No Rate Limiting on Public Endpoints
**Finding**: No rate limiting middleware on any endpoint. A single client can hit `/api/businesses` or `/api/ratings` unlimited times.
**Risk**: DoS vector, scraping, abuse.
**Fix**: Add `express-rate-limit` middleware. 100 req/min for authenticated, 30 req/min for unauthenticated.
**Points**: 3

### M4: No CORS Configuration
**Finding**: No explicit CORS headers set. Currently only mobile app access, but web admin panel and future web client will need CORS.
**Fix**: Add `cors` middleware with explicit origin whitelist.
**Points**: 2

---

## LOW Findings (P3 — Document, fix if capacity allows)

### L1: 5 TODO Comments in Production Code
- `server/routes.ts`: "TODO: integrate real email provider"
- `server/routes.ts`: "TODO: generate real QR code PDF"
- `server/routes.ts`: "TODO: integrate Stripe"
- `server/routes.ts`: "TODO: process business claim"
- `lib/data.ts`: "TODO: fetch from API"

### L2: No Git Hooks or CI/CD Pipeline
**Finding**: No pre-commit hooks, no GitHub Actions, no automated test runs on push.
**Fix**: Add husky + lint-staged for pre-commit, GitHub Actions for CI.
**Points**: 5

### L3: Unused Dependency Audit Needed
**Finding**: `package.json` has grown organically. No recent audit of unused or outdated dependencies.
**Fix**: Run `npx depcheck` and `npm audit`.
**Points**: 2

### L4: 1 Pre-existing TypeScript Error
**File**: `app/rate/[id].tsx:211` — `Type 'number' is not assignable to type 'Timeout'`
**Fix**: Use `ReturnType<typeof setTimeout>` or `NodeJS.Timeout`.
**Points**: 1

---

## Audit Summary Table

| Severity | Count | Sprint Target | Points |
|----------|-------|---------------|--------|
| CRITICAL | 2 | Sprint 56 (NEXT) | 5 |
| HIGH | 5 | Sprint 56-57 | 27 |
| MEDIUM | 4 | Sprint 58+ | 10 |
| LOW | 4 | Capacity-based | 8 |
| **Total** | **15** | | **50** |

---

## Sprint Planning Recommendations

### Sprint 56 (NEXT — Mandatory)
| Item | Source | Owner | Points |
|------|--------|-------|--------|
| C1: Remove session secret fallback | CRITICAL | Nadia Kaur | 2 |
| C2: Centralize admin emails, remove demo account | CRITICAL | Priya Sharma | 3 |
| H3: API endpoint tests (auth + ratings + business) | HIGH | Sage + Carlos | 8 |
| H4: Centralized env config with validation | HIGH | Alex Volkov | 3 |
| **Total** | | | **16** |

### Sprint 57
| Item | Source | Owner | Points |
|------|--------|-------|--------|
| H1: Split storage.ts + business/[id].tsx | HIGH | James Park | 8 |
| H2: Eliminate `as any` casts (<10 remaining) | HIGH | Mei Lin | 5 |
| H5: Structured logging | HIGH | Nina Petrov | 3 |
| **Total** | | | **16** |

---

## Architecture Council Sign-Off

| Member | Role | Approved |
|--------|------|----------|
| Marcus Chen | CTO | Yes |
| James Park | Frontend Architect | Yes |
| Priya Sharma | Backend Architect | Yes |
| Alex Volkov | DevOps Lead | Yes |
| Mei Lin | Type Safety | Yes |

**Reviewers**:
| Member | Role | Approved |
|--------|------|----------|
| Nadia Kaur | VP Security | Yes |
| Carlos Ruiz | QA Lead | Yes |
| Victoria Ashworth | VP Legal | Yes |

---

*Next architectural audit: Sprint 60*
