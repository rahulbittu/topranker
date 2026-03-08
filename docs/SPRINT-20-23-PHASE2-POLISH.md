# Sprints 20-23 — Phase 2 Polish: Share, Sort, Rate Gating, Account Deletion

## Mission Alignment
Trust requires both polish and compliance. Sprint 20 lets users share live Challenger results — viral growth drives community. Sprint 21 gives Discover users control over how they explore rankings. Sprint 22 gates rating to members with 7+ days active — preventing drive-by spam accounts. Sprint 23 adds account deletion — an App Store hard requirement and a user trust signal (we respect your data sovereignty).

## Team Discussion

### Rahul Pitta (CEO)
"The Share Challenge button is our growth engine. When someone shares 'Lucia vs Uchi — 52% to 48%' on Instagram, that's free marketing. The sort selector on Discover makes the app feel like a real product, not a prototype. Rate gating is anti-fraud 101 — if you can't rate on day one, spam rings can't flood us. And Delete Account isn't just compliance — it tells users we're serious about data rights."

### Rachel Wei (CFO)
"The Challenger share button directly supports our $99 entry fee revenue stream. More shares = more visibility = more businesses wanting to enter challenges. The rate gating also protects our revenue — if rankings get manipulated by spam accounts, businesses lose trust in the platform and won't pay for challenges."

### Jasmine Taylor (Marketing Director)
"The share format is perfect for social — it reads like a sports score update. For launch, we'll create templates around 'Who wins this week?' with the share data. The trending sort on Discover feeds our 'Movers & Shakers' weekly newsletter content."

### Jordan Blake (Head of Compliance)
"Delete Account is non-negotiable for Apple App Store approval. Apple rejects apps without it. We implemented a 30-day grace period before permanent deletion, which gives users a chance to change their mind and gives us time to process data removal across all systems."

### Nadia Kaur (Cybersecurity Lead)
"The 7-day rating gate is our first line of defense against coordinated spam attacks. Combined with the credibility tier system and temporal decay, it makes TopRanker significantly harder to game than any competitor. A spam ring would need to maintain accounts for a week before they could even submit a single rating."

### James Park (Frontend Architect)
"Share Challenge uses React Native's Share API for cross-platform compatibility — works on web, iOS, and Android. The sort selector uses navy-filled chips to visually distinguish from the amber filter chips. Rate gating fetches the member profile to check `daysActive` — reuses existing React Query cache so no extra API calls."

### Carlos Ruiz (QA Lead)
"Verified: Share dialog opens correctly on web. Sort toggles between Ranked/Most Rated/Trending with correct ordering. Rate gating shows correct 'X more days to unlock' message for new users. Delete confirmation requires two taps to prevent accidental deletion. TypeScript clean across all changes."

## Changes

### Sprint 20 — Share Challenge
- `app/(tabs)/challenger.tsx`: Added share button with formatted text (VS format, vote counts, countdown)
- Styles: `shareBtn`, `shareBtnText`

### Sprint 21 — Sort By on Discover
- `app/(tabs)/search.tsx`: Added Sort row with Ranked/Most Rated/Trending chips
- Sort logic: ranked (by position), rated (by rating count), trending (by rank delta)
- Styles: `sortRow`, `sortLabel`, `sortChip`, `sortChipActive`, `sortChipText`, `sortChipTextActive`

### Sprint 22 — Rate Gating
- `app/business/[id].tsx`: Rate button gated to 7+ days active per PRD
- New members see "Build your reviewer credibility to rate this business"
- Shows countdown: "X more days active to unlock rating"
- Fetches member profile via `fetchMemberProfile` query
- Styles: `rateGated`, `rateGatedText`, `rateGatedSubtext`

### Sprint 23 — Delete Account
- `app/(tabs)/profile.tsx`: "Delete Account" button at bottom of profile
- Two-step confirmation with destructive action dialog
- 30-day grace period messaging
- Styles: `deleteAccountBtn`, `deleteAccountText`

## PRD Gaps Closed
- Share button on Challenger (creates shareable content for Instagram/WhatsApp)
- Sort by: Ranked/Rated/Trending on Discover
- "Rate This Place" gating — active after 7+ days
- Delete Account — App Store compliance requirement
