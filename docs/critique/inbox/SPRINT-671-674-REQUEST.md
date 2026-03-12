# Critique Request: Sprints 671-674

**Date:** 2026-03-11
**Requesting:** External review of 4 sprints

## Sprint Summaries

### Sprint 671: Google Places Full Details Enrichment
- `fetchPlaceFullDetails()` pulls editorialSummary, currentOpeningHours, priceLevel, service flags
- `enrichBusinessFullDetails()` updates business with Google data, only overwrites empty description
- Auto-triggers on business detail view when hours are stale (>24h) or missing
- Admin batch endpoint `/api/admin/enrichment/full-details` for bulk enrichment (50 businesses, 200ms rate limit)

### Sprint 672: Multi-Channel Android Notifications + Deep Link Validation
- 5 Android notification channels: default, tier_upgrade, challenger, digest, reminders
- Each channel has appropriate importance level (HIGH → LOW) and vibration pattern
- Server push.ts maps notification type to channelId (reminders = silent)
- Deep link handler validates screen against allowlist via `isValidDeepLinkScreen()` type guard
- All data fields use `typeof` guards instead of `as string` casts

### Sprint 673: Leaderboard Layout Refinements
- Removed redundant `cardWrap` View wrapper from FlatList renderItem
- Full-bleed negative margin pattern for cuisine chips and dish shortcuts
- paddingHorizontal moved from per-card to list contentContainerStyle

### Sprint 674: App Store Compliance
- Account deletion added to Settings screen (Apple Guideline 5.1.1(v))
- Alert.alert double-confirmation with "30-day grace period" messaging
- Full Apple compliance checklist verified: privacy, terms, encryption, permissions

## Questions for Reviewer

1. Google Places enrichment updates `isOpenNow` on every business detail view (if >24h stale). Is this too aggressive? Should we cache longer (48h? 1 week?)?
2. The notification channel map is duplicated between `lib/notifications.ts` and `server/push.ts`. Should we extract to `shared/notification-channels.ts`?
3. Account deletion has a 30-day grace period server-side but the UI just says "within 30 days." Should we add a countdown or email confirmation of the grace period?
4. Deep link validation silently drops unknown screens (returns early). Should we log/track unknown deep link attempts for debugging?
5. The full-bleed negative margin pattern (-16) for chip rows hardcodes the parent padding. Should this be a constant or derived from the parent?
