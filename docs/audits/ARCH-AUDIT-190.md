# Architecture Audit #20 — Sprint 190

**Date:** 2026-03-09
**Auditor:** Amir Patel (Architecture)
**Grade:** A-
**Previous Grade:** A- (Sprint 185)

## Executive Summary

Codebase remains healthy at A-. Four clean sprints (186-189) added email verification, restaurant onboarding, referral tracking, and Redis caching without introducing regressions. Test suite grew from 2,942 to 3,124 (+182). No new CRITICAL or HIGH findings. One existing MEDIUM persists (search.tsx size).

## Scorecard

| Category | Score | Trend |
|----------|-------|-------|
| Test Coverage | A+ | ↑ (3,124 tests, 122 files) |
| Type Safety | B+ | → (108 `as any`, stable) |
| Module Organization | A | → (13 routes, 17 storage) |
| Performance | A | ↑ (Redis cache layer added) |
| Security | A | → (OWASP compliant, email verification added) |
| Documentation | A- | → (Sprint docs, retros, SLT meetings current) |
| Infrastructure | B+ | ↑ (Redis ready, needs production config) |

## Findings

### CRITICAL — 0 findings

### HIGH — 0 findings

### MEDIUM — 2 findings

**M1: search.tsx at 870 LOC** (Carried from Audit #19)
- Still exceeds 750 LOC target
- Contains autocomplete, recent searches, popular categories, search results
- **Recommendation:** Extract autocomplete dropdown + recent searches into components
- **Escalation:** 2nd audit at MEDIUM — escalates to HIGH at Audit #21 if not addressed

**M2: No production email service**
- Using nodemailer directly — no deliverability guarantees
- Email verification + password reset depend on reliable delivery
- **Recommendation:** Integrate SendGrid or AWS SES before beta
- **Owner:** Sarah Nakamura, Sprint 191

### LOW — 3 findings

**L1: 108 `as any` casts** (Stable)
- Not growing. Majority in React Native style sheets and third-party type gaps
- No action needed unless count increases

**L2: No automated DB backups**
- Railway provides manual snapshots but no automated schedule
- **Recommendation:** Configure Railway auto-backups or pg_dump cron

**L3: Cache warming not implemented**
- First request after deploy always hits DB
- Low impact at current scale, should address before high traffic

## Metrics

| Metric | Sprint 185 | Sprint 190 | Delta |
|--------|-----------|-----------|-------|
| Tests | 2,942 | 3,124 | +182 |
| Test Files | 118 | 122 | +4 |
| Route Modules | 13 | 14 | +1 (routes-referrals) |
| Storage Modules | 16 | 17 | +1 (referrals) |
| `as any` Casts | ~105 | 108 | +3 |
| Suite Duration | <1.9s | <2.0s | +0.1s |
| Largest File | search.tsx (870) | search.tsx (870) | 0 |

## Key File Sizes

| File | LOC | Status |
|------|-----|--------|
| search.tsx | 870 | MEDIUM (target: 750) |
| profile.tsx | 659 | OK |
| business/[id].tsx | 567 | OK |
| members.ts (storage) | 566 | OK |
| businesses.ts (storage) | 540 | OK |
| challenger.tsx | 484 | OK |
| ratings.ts (storage) | 464 | OK |
| routes.ts | 406 | OK |

## Sprint 186-189 Architecture Impact

### Positive
- **Redis layer** is cleanly abstracted with fail-open semantics — excellent
- **Referral module** properly isolated (own storage, routes, barrel export)
- **Email verification** uses one-time tokens with proper cleanup
- **Google Places** integration isolated in server/google-places.ts

### Concerns
- **Dynamic imports** increasing (referrals, schema modules) — watch for circular dependency risk
- **Rate limiter** now has runtime Redis detection via `require("ioredis")` — potential for silent failure

## Recommendations for Next 5 Sprints

1. **Sprint 191:** Production email ESP (SendGrid/SES) — closes M2
2. **Sprint 192:** Extract search.tsx components — closes M1 before escalation
3. **Sprint 193:** Mobile native testing + Expo build pipeline
4. **Sprint 194:** Load testing + CDN for static assets
5. **Sprint 195:** SLT + Audit #21 + Beta GO/NO-GO
