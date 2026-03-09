# SLT Backlog Meeting — Sprint 150

**Date:** 2026-03-08
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng)

---

## Sprint 147-149 Review

### Key Achievements
- **Sprint 149 broke the 8-score plateau** — first 9/10 from external critique
- Edit profile screen shipped as first new user-visible screen since Sprint 141
- Settings notification sync now end-to-end (6 keys, server-persisted, jsonb column)
- Backend setup guide delivered for real Google Places data
- Community reviews confirmed functional with existing API infrastructure
- Test suite: 2049 tests across 88 files, all passing

### User Feedback Addressed
- Search suggestions filtering — fixed in Sprint 147
- Challenger community reviews — already functional, confirmed in Sprint 148
- Profile tier UI redesign — Sprint 147
- Settings notification sync — Sprint 148
- Edit profile screen — Sprint 149

### Remaining User Concerns
- Avatar upload (placeholder only on edit profile)
- Real Google Places data in dev (guide delivered, not yet confirmed working by user)
- Visual polish on newer screens

---

## Q2 Product Roadmap Priorities

### P0 — Must Ship This Quarter
1. **Avatar upload** — photo picker + storage (S3 or Cloudflare R2)
2. **CD pipeline** — automated deployment (CI done in Sprint 141)
3. **App Store submission prep** — iOS + Android builds, metadata, screenshots

### P1 — Should Ship This Quarter
4. **Push notification delivery** — server-side prefs done, need APNs/FCM integration
5. **Real-time ranking updates** — SSE already implemented, needs client subscription
6. **Stripe payment flow** — challenger entry ($99) + business pro ($49/mo) end-to-end

### P2 — Nice to Have
7. **Hindi translation** — Privacy Policy localization
8. **City expansion** — beyond Texas
9. **Custom logo** — hire designer, replace generic crown

---

## Technical Debt Assessment

### Resolved Since Last SLT (Sprint 145)
- Notification pref mismatch (3 vs 6 keys) — unified
- Settings not syncing to server — fixed
- Missing edit profile screen — shipped
- Setup documentation gap — SETUP.md delivered

### Active Debt
- Avatar stored as base64 data URL (needs CDN migration)
- No CD pipeline (manual deployment)
- Email change flow not implemented
- Profile screen NotificationPreferences removed but profile.tsx still has some unused notification state
- Version hardcoded to 1.0.0

### Debt Reduction Plan
- Sprint 151-152: CDN avatar upload, clean up notification state
- Sprint 153-154: CD pipeline + deployment automation
- Sprint 155: App Store prep

---

## Revenue Readiness Status

| Revenue Stream | Status | Blocker |
|---|---|---|
| Challenger Entry ($99) | UI complete | Stripe webhook verification |
| Business Pro ($49/mo) | Dashboard complete | Subscription management |
| Featured Placement ($199/wk) | API + UI complete | Payment flow testing |
| Premium API | Not started | After launch |

**Rachel Wei:** "Revenue infrastructure is 70% there. The Stripe webhook and subscription management are the critical path. I'd recommend prioritizing these in Sprints 153-154 after avatar upload and CD pipeline."

---

## Decisions

1. **Avatar storage:** Cloudflare R2 (cheaper than S3, S3-compatible API) — Amir to spec the upload pipeline
2. **CD priority:** After avatar upload. GitHub Actions + Expo EAS for mobile builds
3. **Next features after edit profile:** Push notification delivery, then Stripe payment completion
4. **App Store timeline:** Target Sprint 160 for first TestFlight build

---

## Action Items

| Item | Owner | Target Sprint |
|---|---|---|
| Avatar upload with R2 | Derek Olawale | 151 |
| CD pipeline spec | Amir Patel | 152 |
| Stripe webhook testing | Sarah Nakamura | 153 |
| App Store metadata review | Jasmine Taylor | 155 |
| Budget review for R2 + EAS | Rachel Wei | 151 |

**Next SLT meeting:** Sprint 155
