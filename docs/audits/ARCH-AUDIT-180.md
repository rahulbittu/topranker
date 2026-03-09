# Architecture Audit #18 — Sprint 180

**Date:** 2026-03-09
**Auditor:** Amir Patel (Architecture Lead)
**Previous Audit:** Sprint 175 (Audit #17, Grade A-)

---

## Overall Grade: A-

Maintaining A- from previous audit. Sprints 176-180 added significant revenue and engagement infrastructure without introducing architectural debt. SSR prerender with LRU cache is clean. Profile SubComponents remains the only HIGH finding.

---

## File Size Audit

### Files >500 Lines (Source Code)
| File | Lines | Status | Action |
|------|-------|--------|--------|
| `lib/badges.ts` | 886 | MEDIUM | Stable — complex but functional |
| `components/profile/SubComponents.tsx` | 863 | HIGH | Decompose in Sprint 181 |
| `app/(tabs)/search.tsx` | 717 | MEDIUM | Stable |
| `app/(tabs)/profile.tsx` | 655 | MEDIUM | Monitor |
| `app/business/[id].tsx` | 567 | OK | Stable |
| `components/DishLeaderboardSection.tsx` | 488 | OK | Self-contained |
| `app/(tabs)/challenger.tsx` | 484 | OK | Under 500 target |

### Resolved Since Last Audit
- No new files exceeded thresholds in Sprints 176-180
- All new modules are well-sized: prerender.ts (~230), responses storage (~83), qr storage (~88)

---

## Route Architecture

### Route Modules (12 total)
| Module | Lines | Purpose |
|--------|-------|---------|
| routes.ts (main) | ~340 | Core routes: leaderboard, ratings, categories, SSE |
| routes-admin.ts | ~350 | Admin panel endpoints |
| routes-auth.ts | ~256 | Authentication + GDPR |
| routes-members.ts | ~248 | Member profile + preferences |
| routes-businesses.ts | ~180 | Business search + detail + dashboard + responses |
| routes-payments.ts | ~160 | Stripe integration + subscriptions |
| routes-badges.ts | ~80 | Badge endpoints |
| routes-experiments.ts | ~100 | A/B experiment endpoints |
| routes-dishes.ts | ~62 | Dish leaderboard API |
| routes-seo.ts | ~185 | sitemap.xml, robots.txt, JSON-LD, challenger share |
| routes-qr.ts | ~121 | QR code generation + scan tracking |
| prerender.ts | ~230 | SSR middleware (not a route module, but serves HTML) |

**Assessment:** Well-balanced. No module over 350 lines. Clean domain separation.

---

## New Additions (Sprint 176-180)

### Sprint 176: Business Pro Subscription
- Stripe Checkout Session pattern (not PaymentIntent) — correct for recurring billing
- Webhook handles 5 subscription event types with status mapping
- Dashboard tiering: free vs Pro with admin bypass
- **Risk:** Webhook complexity growing (~220 lines total). Monitor.

### Sprint 177: Owner Rating Responses
- Clean upsert pattern in storage
- 4-layer access control: auth → owner → Pro → admin bypass
- Push notification to rater on response
- **Risk:** None identified.

### Sprint 178: QR Code Generation
- JSON config approach — client renders, server provides data
- Scan tracking with conversion analytics
- Self-contained route module (121 lines)
- **Risk:** Scan endpoint has no rate limiting. Low risk currently.

### Sprint 179: Challenger Notifications
- Wired dead-code push functions (notifyNewChallenger, notifyChallengerResult)
- createChallenge fills production gap (was seed-only)
- Social share preview follows SEO pattern
- **Risk:** City push sends up to 500 tokens at once. Should chunk at scale.

### Sprint 180: SSR Prerender
- Bot-only middleware with in-memory LRU cache (200 entries, 5min TTL)
- Handles /dish/:slug and /business/:slug
- Cache invalidation on rating submission
- escapeHtml prevents XSS in generated HTML
- **Risk:** Single-instance cache. Need Redis for multi-instance.

---

## Type Safety

### `as any` Casts
- **Source code:** ~55 occurrences (slight increase from webhook/prerender)
- **Test files:** ~35 occurrences
- **Trend:** Stable. No systemic type safety issues.
- **Action:** None required.

---

## Security Review

- ✅ Prerender HTML uses escapeHtml for all dynamic values
- ✅ Subscription endpoints verify business ownership
- ✅ Rating response access control has 4 layers
- ✅ QR scan endpoint allows anonymous access (intentional for data capture)
- ✅ Push notifications check user preferences before sending
- ✅ No PII in prerendered HTML or structured data
- ⚠️ QR scan endpoint lacks rate limiting (LOW risk)
- ⚠️ Social share preview endpoint lacks rate limiting (LOW risk)

---

## Test Coverage

| Metric | Value | Trend |
|--------|-------|-------|
| Test files | 112 | +4 from Sprint 175 |
| Total tests | 2,679 | +159 from Sprint 175 |
| Execution time | 1.9s | Stable |
| Tests per file | 23.9 avg | Healthy |

---

## Consequence Chain Audit (Core Values #4)

Rating submission now triggers a complete consequence chain:
1. Score recalculation (weighted by credibility)
2. Rank movement (business rank changes)
3. SSE broadcast (real-time UI update)
4. Challenger vote update (if in active challenge)
5. Push notification (tier upgrade if applicable)
6. Prerender cache invalidation (fresh SEO data)
7. Experiment outcome tracking

**Assessment:** The core loop (rate → consequence → ranking) is fully instrumented. Every rating creates visible, measurable consequences.

---

## Findings Summary

| ID | Severity | Finding | Action |
|----|----------|---------|--------|
| A18-1 | HIGH | `profile/SubComponents.tsx` at 863 lines | Decompose in Sprint 181 |
| A18-2 | MEDIUM | `lib/badges.ts` at 886 lines | Consider splitting when next touched |
| A18-3 | MEDIUM | Stripe webhook at ~220 lines | Split subscription logic if more events added |
| A18-4 | LOW | Prerender cache single-instance | Add Redis when scaling to multiple instances |
| A18-5 | LOW | QR scan + social share endpoints lack rate limiting | Add when traffic warrants |

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
| #18 | 180 | A- |

**Trajectory:** Stable A-. Profile SubComponents decomposition (Sprint 181) would push to A.

---

## Next Audit: Sprint 185
