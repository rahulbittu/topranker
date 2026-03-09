# Sprint 147 — User-Reported Bug Fixes External Critique

## Verified wins
- **Search suggestions now filter by input.** The `getMockData` handler for `/api/businesses/search` was updated to parse query parameters and filter by query, city, name, neighborhood, category, and description. This directly fixes the user's complaint that "suggestions don't take any input."
- **Community reviews added to challenger.** The challenger VS cards now show community reviews with star ratings, timestamps, and reviewer names. This was the #2 critique priority from Sprint 146.
- **Profile tier progression UI redesigned.** The tier display received a visual overhaul with better progress bars, badge styling, and influence display. The user specifically flagged "new member / regular / trust — the way they are designed, I am not liking it."
- **All three changes are user-visible fixes.** This sprint responded directly to user feedback rather than building internal infrastructure — a shift the critique has been requesting since Sprint 142.
- **Test suite maintained at 2010 tests, 86 files, all passing.** No regressions from the UI changes.

## Contradictions / drift
- **Settings screens remain unfixed.** The user said "none of the options have any screens or functionality" — this was the #1 user-reported issue and it was not addressed. Two of three critique priorities were hit, but the most fundamental one (settings) was skipped.
- **Search filtering is mock-layer only.** The fix applies to `getMockData` in `lib/api.ts`, not to the actual API endpoint. When the backend is running, the search endpoint handles filtering server-side. But the user explicitly asked for real Google Places data ("dev should no longer mock data from google"). The mock-layer fix helps demo mode but doesn't address the real request.
- **Community reviews use generated data.** The reviews section on challenger shows mock reviewer names and ratings. Without a backend reviews table, these are illustrative rather than functional. The user wanted "people commenting and sharing ratings" — real community engagement, not static display.
- **Profile changes are visual only.** The tier progression looks better, but the underlying functionality hasn't changed. The improvement is cosmetic, which is what the user asked for ("UI design is not good"), but the critique should note it's styling, not new capability.
- **3 of 6 user-reported issues addressed.** Settings, real Google data, and backend documentation remain open.

## Unclosed action items
- **Fix settings screens.** Add real functionality to notification preferences, account settings, privacy controls. This has been deferred for two consecutive sprints.
- **Switch dev mode to real Google Places data.** Document environment setup (DATABASE_URL, GOOGLE_PLACES_API_KEY) so the user can run with production data sources.
- **Create backend setup guide.** A `docs/SETUP.md` or expansion of README with step-by-step instructions for running with real data.
- **Make community reviews functional.** Add a reviews/comments table and API endpoints so challenger reviews reflect real user input, not mock data.

## Core-loop focus score
**8/10**

- This sprint was the most user-focused in the last 5 sprints. All three deliverables came directly from user feedback.
- Search filtering, challenger reviews, and profile UI are all core-loop adjacent — they affect how users discover, compare, and understand trust.
- Score stays at 8 rather than rising to 9 because the highest-impact item (settings functionality) was not addressed, and the fixes are mock-layer / visual rather than end-to-end functional.
- The 8-score plateau is now at 6 consecutive sprints (142-147). Breaking through requires shipping functional features, not visual improvements to existing screens.

## Top 3 priorities for next sprint
1. **Fix settings screens with real functionality.** This is the third consecutive sprint where this has been flagged. Add working screens for notification preferences, account management, and privacy controls.
2. **Backend setup documentation + real data in dev.** Write a setup guide and verify the app works with real Google Places API data. The user has explicitly asked for this twice.
3. **Make community reviews functional end-to-end.** Add a reviews table, POST/GET endpoints, and wire the challenger reviews section to real data instead of mock.

**Verdict:** Good user-focused sprint that addressed 3 of 6 reported issues. The search fix, challenger reviews, and profile redesign are all directly responsive to user feedback — a positive shift from the infrastructure-heavy sprints prior. But settings screens remain broken for the third sprint running, and the fixes are mock-layer or visual rather than end-to-end functional. Score holds at 8/10. The path to 9 requires fixing settings, shipping real data integration, and making community features functional rather than illustrative.
