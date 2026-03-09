# Sprint 148 — Settings Notification Sync + Backend Setup Guide External Critique

## Verified wins
- **Settings notification sync is now end-to-end functional.** The server endpoint expanded from 3 keys to 6, matching the client. A `notificationPrefs` jsonb column was added to the members table. The client fetches from server on mount and syncs on toggle with fire-and-forget PUT. AsyncStorage remains as offline cache. This is genuine end-to-end functionality, not just UI.
- **Backend setup guide shipped.** `docs/SETUP.md` documents DATABASE_URL, Google Places API key, session configuration, database setup with drizzle, and how to verify real data is loading. This directly addresses the user's request from Sprint 146: "dev should no longer mock data from google, it should get it like prod."
- **Two of the top three critique priorities from Sprint 147 were fully addressed.** Settings sync (#1) and backend setup guide (#2) are done. The third priority (functional community reviews) was already working — the investigation revealed the review infrastructure is production-ready with real API endpoints, database schema, and client integration.
- **Test count increased to 2031 across 87 files, all passing.** 22 new tests validate the settings sync, schema, and setup documentation. 3 old tests were updated for the new notification key names.

## Contradictions / drift
- **The settings "fix" was a sync improvement, not a broken-screen fix.** The user's original complaint was "none of the options have any screens or functionality." The investigation revealed the settings screen already had working city selection, theme, 6 notification toggles, legal links, and sign out. The actual gap was server persistence, not missing screens. The critique should note that the original diagnosis was partially incorrect — the screen was functional locally, just not synced.
- **Community reviews were already functional.** The Sprint 147 critique listed "make community reviews functional end-to-end" as priority #3, implying they were broken. Investigation showed the review infrastructure has a complete database schema, API endpoints with pagination, fraud detection, and real-time SSE. The challenger component already fetches real reviews. This was a misdiagnosis in the critique.
- **The setup guide helps but doesn't guarantee the user will use it.** The user needs to actually follow the guide, obtain a Google Places API key, and set up a PostgreSQL database. The guide exists, but the friction remains.
- **No new user-visible features this sprint.** The sync and documentation are important infrastructure, but the user won't see any visual difference in the app.

## Unclosed action items
- **Verify the user can follow SETUP.md end-to-end.** The guide needs to be tested by someone who hasn't set up the project before.
- **Profile edit screen.** The settings "Edit Profile" link navigates to the profile tab, not a dedicated edit form. A proper edit profile screen (change display name, avatar, email) would add real functionality.
- **Version number is hardcoded.** `1.0.0` should be dynamically read from package.json.
- **Notification toggle mismatch between settings and profile.** The profile NotificationPreferences component has 3 toggles; settings has 6. These should be unified or the profile component should defer to settings.

## Core-loop focus score
**8/10**

- This sprint addressed the two most persistent critique items (settings sync, backend setup guide) with substance.
- The investigation that community reviews were already functional corrected a false assumption — this is positive.
- Score stays at 8 because: (1) no new user-visible features were shipped, (2) the "settings fix" was a sync improvement the user may not notice, and (3) the setup guide is documentation, not a product change.
- The 8-score plateau is now at 7 consecutive sprints (142-148). The critique has been requesting user-visible improvements for multiple sprints. Infrastructure and documentation are necessary but not sufficient.

## Top 3 priorities for next sprint
1. **Add edit profile screen.** A real form where users can change their display name, avatar, and email. This is a visible, functional feature.
2. **Unify notification preferences.** The profile and settings screens show different notification toggles. Consolidate to one source of truth.
3. **Ship a user-visible feature.** Pick one of: improved business photos carousel, rating response notifications, or leaderboard animations. Something the user can see and interact with.

**Verdict:** Solid infrastructure sprint that closed the two most nagging critique items. Settings now sync to the server with proper persistence, and the backend setup guide gives the user a path to real data. The community reviews investigation corrected a false critique assumption. But the 8-score plateau continues because no user-visible features were shipped. The path to 9 is through features the user can see and touch, not infrastructure they can't.
