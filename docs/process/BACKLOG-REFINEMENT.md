# TopRanker Backlog Refinement Process

## Cadence
- **Before every sprint**: Backlog refinement session
- **Attendees**: SLT + Architecture Council + Department Leads
- **Output**: Prioritized sprint backlog with clear acceptance criteria

## Process

### 1. Department Pre-Meetings (Before Refinement)
Each department runs their own meeting and brings prioritized ideas:

| Department | Lead | Brings To Refinement |
|-----------|------|---------------------|
| Engineering | Sarah Nakamura / Marcus Chen | Tech debt, performance, infrastructure |
| Design & Animation | Elena Torres / Kai Nakamura | UI polish, animation specs, brand consistency |
| Legal & Compliance | Victoria Ashworth / Jordan Blake | Compliance gaps, policy updates, App Store |
| Revenue & Growth | Rachel Wei / Jasmine Taylor | Revenue features, marketing needs, launch readiness |
| Security | Nadia Kaur | Vulnerability findings, audit results |
| Value & Engagement | Jordan (CVO) | User retention, incentive systems, NPS data |
| Data & Analytics | Aria | Tracking gaps, fraud signals, dashboard needs |
| QA | Carlos Ruiz | Regression list, test coverage gaps, bug triage |

### 2. Backlog Refinement Meeting (45 min)
1. **Bug Triage** (10 min) — Carlos presents production issues, severity-ranked
2. **Department Proposals** (15 min) — Each department presents top 2 items
3. **CEO Priority Override** (5 min) — Rahul adds/removes items based on vision
4. **Estimation & Sequencing** (10 min) — Story point estimation, dependency mapping
5. **Sprint Selection** (5 min) — Final sprint backlog locked

### 3. Sprint Planning (15 min)
- Assign owners to each backlog item
- Define acceptance criteria and test requirements
- Identify cross-department dependencies

## Acceptance Criteria for Every Sprint Item
Every item entering a sprint MUST have:
1. **What**: Clear description of the change
2. **Why**: How it serves the trust mission or fixes a production issue
3. **Test Plan**: How we verify it works (unit test, manual test, screenshot)
4. **Owner**: Named team member responsible
5. **Story Points**: Complexity estimate (1, 2, 3, 5, 8, 13)

## Testing Requirements (CEO MANDATE — March 7, 2026)
- **No code ships without testing**
- Unit tests for all business logic (credibility, ratings, scoring)
- Integration tests for all API endpoints
- Manual verification for UI changes
- TypeScript must be clean (zero new errors)

## SLT Meeting Cadence
| Meeting | Frequency | Attendees | Duration |
|---------|-----------|-----------|----------|
| Daily Standup | Daily | All active team members | 15 min |
| Sprint Planning | Before each sprint | SLT + Architecture | 30 min |
| Backlog Refinement | Before each sprint | Full team | 45 min |
| Sprint Review | After each sprint | SLT + Stakeholders | 30 min |
| Retrospective | After each sprint | Full team | 20 min |
| CEO Strategy | Bi-weekly | SLT only | 60 min |

## Document Trail
Every sprint produces:
1. `/docs/SPRINT-N-*.md` — Sprint doc with team discussions, changes, performance
2. `/docs/retros/RETRO-N-*.md` — Retrospective with actions and morale
3. Test results (when test suite is ready)
4. This backlog refinement doc is updated with current priorities

---

## Current Backlog (Post-Sprint 52)

### P0 — Critical Production Issues
| # | Item | Owner | Points | Status |
|---|------|-------|--------|--------|
| 1 | Unit tests: credibility calc + rating submission | Sage | 8 | NEXT |
| 2 | Google OAuth: add production domain | Alex Volkov | 2 | BLOCKED (needs Cloud Console access) |
| 3 | Photo pipeline: fetch Google Places photos | Pixel | 8 | NEXT |
| 4 | Non-Dallas cities: seed Austin/Houston/SA data | Priya Sharma | 5 | NEXT |

### P1 — High Priority
| # | Item | Owner | Points | Status |
|---|------|-------|--------|--------|
| 5 | Top Judge rewards & tier perks UI | Jordan (CVO) + James Park | 5 | NEXT |
| 6 | Security audit: all public endpoints | Nadia Kaur | 5 | NEXT |
| 7 | Google Maps integration (real map, not placeholder) | Atlas | 8 | NEXT |
| 8 | Analytics: instrument all 4 screens | Aria | 5 | NEXT |
| 9 | Tab dot final polish | Derek Chan | 2 | NEXT |

### P2 — Important
| # | Item | Owner | Points | Status |
|---|------|-------|--------|--------|
| 10 | Staging environment + Sentry | Nina Petrov | 8 | NEXT |
| 11 | Business outreach: Dallas top 100 list | Cole | 3 | NEXT |
| 12 | Custom logo design | Amara Obi | 5 | NEXT |
| 13 | Marketing launch playbook | Jasmine Taylor + Marco Silva | 5 | NEXT |

### P3 — Future
| # | Item | Owner | Points | Status |
|---|------|-------|--------|--------|
| 14 | OpenTable integration | TBD | 13 | BACKLOG |
| 15 | Payment methods (Apple Pay) | TBD | 8 | BACKLOG |
| 16 | Expand beyond restaurants | All | 13 | BACKLOG |
| 17 | GPS-based rating verification | Legal + Eng | 8 | BACKLOG |
| 18 | Hindi/multilingual support | TBD | 8 | BACKLOG |
