# Sprint 116 — Analytics Dashboard, Error Monitoring Foundation, Push Sync

**Date:** 2026-03-08
**Story Points:** 16
**Theme:** Analytics Dashboard Visualization, Error Monitoring Integration Prep, Push Notification Sync
**SLT Priority:** P0 (per SLT-BACKLOG-115)

---

## Mission

Deliver admin-facing analytics dashboard endpoint with conversion funnel visualization data, establish centralized error reporting service for production monitoring readiness, and enhance push notification preference sync with structured logging.

---

## Team Discussion

**Rachel Wei (CFO):**
"The raw analytics endpoint was useful for debugging but not actionable for business decisions. The new dashboard endpoint pre-computes conversion rates — signup rate from page views, rating rate from signups. When we plug this into the admin UI, we'll immediately see where users drop off in the funnel. The N/A fallback for zero-state metrics is important — we don't want division-by-zero showing up as NaN in dashboards."

**Sarah Nakamura (Lead Engineer):**
"The error reporting service is intentionally simple right now — an in-memory buffer with a clean API surface. The key design decision was making reportError and reportComponentCrash separate functions with different signatures. Component crashes carry componentStack which is critical for debugging React rendering issues. When we integrate Sentry, we just swap the console.error calls — the interface stays the same."

**Amir Patel (Architecture):**
"I reviewed the error-reporting module placement in lib/ versus server/. Since ErrorBoundary is a client component and we want the same reporting API available on both sides eventually, lib/ is correct. The MAX_ERRORS=100 buffer cap prevents memory leaks in long-running sessions. The stack truncation (10 lines for stack, 5 for componentStack) keeps reports focused."

**Jasmine Taylor (Marketing):**
"The notification preference logging is a small change but it closes a gap in our user engagement tracking. When we analyze push notification opt-in rates, we need to know when users change their preferences, not just what they're set to. The structured log with tag('Notifications') means we can grep for these events specifically in production logs."

**Nadia Kaur (Cybersecurity):**
"I verified the dashboard endpoint properly chains requireAuth and requireAdmin middleware — no exposure risk. The error reporting service deliberately strips stack traces to 10 lines to avoid leaking deep internals if reports are ever exposed. The userId field in ErrorReport is optional, which is correct — we shouldn't force identification for anonymous errors."

**Jordan Blake (Compliance):**
"Push notification preference logging is GDPR-relevant — we need audit trails showing user consent changes. The log line includes the user ID and the full preference state, which satisfies our consent record requirements. When we move to a dedicated column for notification prefs, the migration path is clear."

---

## Changes

### 1. Admin Analytics Dashboard Endpoint (Rachel Wei)
- **File:** `server/routes-admin.ts`
- New endpoint: `GET /api/admin/analytics/dashboard`
- Returns pre-computed dashboard data: overview (total events, unique types), funnel (page views, signups, first ratings, challenger entries, dashboard subs), conversion rates (signup rate, rating rate), recent activity (last 10 events), generated timestamp
- Handles zero-state gracefully with "N/A" for undefined conversion rates
- Protected by requireAuth + requireAdmin middleware

### 2. Error Reporting Service (Sarah Nakamura)
- **File:** `lib/error-reporting.ts` (NEW)
- Centralized error reporting with in-memory buffer (max 100 errors)
- `reportError(error, context?)` — general error reporting
- `reportComponentCrash(error, componentStack?, userId?)` — React ErrorBoundary integration
- `getRecentErrors(limit?)` — debugging access to error buffer
- `clearErrors()` — buffer reset for testing
- Stack traces truncated (10 lines) and component stacks truncated (5 lines)
- Sentry integration placeholder in comments

### 3. ErrorBoundary Integration (Sarah Nakamura)
- **File:** `components/ErrorBoundary.tsx`
- Imported and integrated `reportComponentCrash` from error-reporting service
- Component crashes now logged to both console and centralized error buffer
- Passes componentStack from ErrorInfo to error reporting

### 4. Push Notification Preference Sync (Jasmine Taylor)
- **File:** `server/routes.ts`
- Added structured logging to PUT notification preferences handler
- Logs user ID and full preference JSON via `log.tag("Notifications")`
- Supports audit trail for GDPR consent tracking

### 5. Tests (38 passing)
- **File:** `tests/sprint116-dashboard.test.ts`
- Error reporting module: 12 tests (exports, buffer limits, stack truncation, userId)
- ErrorBoundary integration: 2 tests (import, usage)
- Analytics dashboard endpoint: 11 tests (route, data shape, conversion rates, auth)
- Push notification sync: 7 tests (endpoints, logging, defaults)
- Analytics server module: 6 tests (exports, event types)

---

## PRD Gaps Addressed

- **Analytics visualization** — Dashboard endpoint provides structured data for admin UI (P0 from SLT-BACKLOG-115)
- **Error monitoring** — Foundation service ready for Sentry/Bugsnag integration (P0 from SLT-BACKLOG-115)
- **Push notification audit trail** — Structured logging for preference changes

---

## Test Results

```
38 tests passing across 5 test suites — 75ms total
```
