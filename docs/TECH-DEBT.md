# Technical Debt Registry

**Owner**: Marcus Chen (CTO)
**Last Updated**: 2026-03-08 (Sprint 106)

This document tracks known technical debt. Items are prioritized and assigned to future sprints.

---

## Active Debt

### HIGH Priority

| ID | Description | Impact | Owner | Target Sprint |
|----|-------------|--------|-------|---------------|
| TD-001 | Rate limiter is in-memory only | Won't scale horizontally, lost on restart | Amir Patel | 110+ |
| TD-002 | L1: No E2E tests | No integration confidence across full stack | Sarah Nakamura | 108 |
| TD-003 | Typography not fully adopted | Inconsistent fonts possible in unmigrated components | Leo Hernandez | 106-108 |

### MEDIUM Priority

| ID | Description | Impact | Owner | Target Sprint |
|----|-------------|--------|-------|---------------|
| TD-004 | Frontend pricing not fully migrated | dashboard.tsx, claim.tsx still have hardcoded amounts | Rachel Wei | 106 |
| TD-005 | L3: Mock data in lib/api.ts | Dev fallback could confuse new developers | Engineering | Deferred |
| TD-006 | CSP may need expansion | New integrations may break under current policy | Nadia Kaur | As needed |
| TD-007 | Cookie consent "Learn more" links to privacy but no deep-link to cookies section | Minor UX gap | Jordan Blake | 107 |

### LOW Priority

| ID | Description | Impact | Owner | Target Sprint |
|----|-------------|--------|-------|---------------|
| TD-008 | Inline rgba values in _layout.tsx | Should use BRAND.colors.amberGlow | Leo Hernandez | 107 |
| TD-009 | #FFD700 in SubComponents.tsx | Should use BRAND.colors.gold | Leo Hernandez | 107 |
| TD-010 | Banner dismissal not synced across devices | AsyncStorage is local-only | Jasmine Taylor | Future |

---

## Resolved Debt

| ID | Description | Resolved In | Resolution |
|----|-------------|-------------|------------|
| TD-R01 | No security headers | Sprint 104 | OWASP middleware added |
| TD-R02 | No CSP | Sprint 105 | 9-directive CSP added |
| TD-R03 | Inline rate limiter in routes.ts | Sprint 105 | Extracted to rate-limiter.ts |
| TD-R04 | No cookie consent | Sprint 105 | GDPR banner added |
| TD-R05 | Scattered pricing values | Sprint 104-105 | shared/pricing.ts + migration |
| TD-R06 | No typography system | Sprint 104-105 | constants/typography.ts + migration started |
| TD-R07 | Stale legal docs (80 sprints) | Sprint 104 | Terms + Privacy updated |

---

## Process

- New debt items added during sprint retros or arch audits
- Reviewed by SLT every 5 sprints (next: Sprint 110)
- HIGH items must be scheduled within 5 sprints
- MEDIUM items within 10 sprints
- LOW items at team discretion
