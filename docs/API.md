# TopRanker API Reference

**Base URL**: `http://localhost:5000/api`
**Auth**: Session-based (Passport.js + express-session)
**Content-Type**: `application/json`

---

## Health

### GET /api/health
Health check. No auth, no database.

**Response** `200`
```json
{ "status": "ok", "ts": 1709827200000 }
```

---

## Authentication

### POST /api/auth/signup
Create a new account.

**Rate Limited**: 10 attempts/min per IP

**Body**
```json
{
  "displayName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "city": "Dallas"
}
```

**Validation**
- `username`: 2-30 chars, alphanumeric + underscore only
- `email`: Valid email format
- `displayName`: 1-50 characters
- `password`: Required (hashed with bcrypt, 10 rounds)

**Response** `200`
```json
{
  "data": {
    "id": "uuid",
    "displayName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "city": "Dallas",
    "credibilityScore": 0,
    "credibilityTier": "community"
  }
}
```

**Errors**
- `400` — Validation error, email in use, username taken
- `429` — Rate limited

### POST /api/auth/login
Email/password login. Creates session.

**Rate Limited**: 10 attempts/min per IP

**Body**
```json
{ "email": "john@example.com", "password": "securePassword123" }
```

**Response** `200`
```json
{ "data": { "id": "uuid", "displayName": "John Doe", ... } }
```

**Errors**
- `401` — Invalid credentials
- `429` — Rate limited

### POST /api/auth/google
Google OAuth login. Creates or links account.

**Rate Limited**: 10 attempts/min per IP

**Body**
```json
{ "idToken": "google-id-token-string" }
```

**Response** `200` — Same as login

### POST /api/auth/logout
End current session.

**Response** `200`
```json
{ "data": { "message": "Logged out" } }
```

### GET /api/auth/me
Check current session.

**Response** `200` (authenticated)
```json
{ "data": { "id": "uuid", "displayName": "John Doe", ... } }
```

**Response** `200` (not authenticated)
```json
{ "data": null }
```

---

## Leaderboard

### GET /api/leaderboard
Get ranked businesses.

**Query Parameters**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `city` | string | "Dallas" | City filter |
| `category` | string | "restaurant" | Category filter |
| `limit` | number | 50 | Max results |
| `offset` | number | 0 | Pagination offset |

**Response** `200`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Franklin Barbecue",
      "slug": "franklin-barbecue",
      "score": 94.2,
      "rank": 1,
      "previousRank": 2,
      "category": "restaurant",
      "city": "Austin",
      "photoUrl": "https://...",
      "ratingCount": 156
    }
  ]
}
```

### GET /api/leaderboard/categories
Get available categories with counts.

**Response** `200`
```json
{
  "data": [
    { "category": "restaurant", "count": 45 },
    { "category": "cafe", "count": 12 }
  ]
}
```

---

## Businesses

### GET /api/businesses/search
Search businesses by name or query.

**Query Parameters**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search query |
| `city` | string | City filter |
| `category` | string | Category filter |
| `limit` | number | Max results |

### GET /api/businesses/:slug
Get business profile by URL slug.

**Response** `200`
```json
{
  "data": {
    "id": "uuid",
    "name": "Franklin Barbecue",
    "slug": "franklin-barbecue",
    "description": "...",
    "score": 94.2,
    "foodScore": 96.1,
    "serviceScore": 91.3,
    "vibeScore": 95.2,
    "rank": 1,
    "category": "restaurant",
    "city": "Austin",
    "address": "900 E 11th St, Austin, TX 78702",
    "photoUrl": "https://...",
    "ratingCount": 156,
    "wouldReturnPercent": 94
  }
}
```

### GET /api/businesses/:id/ratings
Get ratings for a business.

**Query Parameters**
| Param | Type | Default |
|-------|------|---------|
| `limit` | number | 20 |
| `offset` | number | 0 |

### GET /api/businesses/:id/rank-history
Get historical rank data for charts.

---

## Ratings

### POST /api/ratings
Submit a rating. **Requires auth**.

**Rate Gating**: Account must be 3+ days old.

**Body**
```json
{
  "businessId": "uuid",
  "foodScore": 8,
  "serviceScore": 7,
  "vibeScore": 9,
  "wouldReturn": true,
  "dishName": "Brisket",
  "note": "Best BBQ in Texas"
}
```

**Validation** (Zod schema)
- `foodScore`, `serviceScore`, `vibeScore`: 1-10 integer
- `wouldReturn`: boolean
- `businessId`: required UUID
- `dishName`, `note`: optional strings

**Response** `200`
```json
{
  "data": {
    "rating": { ... },
    "newRank": 3,
    "previousRank": 5,
    "credibilityDelta": 3,
    "newTier": "city"
  }
}
```

**Errors**
- `401` — Not authenticated
- `400` — Validation error, rate gating (account too new)

---

## Members

### GET /api/members/me
Current user's full profile. **Requires auth**.

### GET /api/members/:username
Public member profile.

### GET /api/members/me/impact
Rating impact statistics. **Requires auth**.

---

## Challengers

### GET /api/challengers/active
Get active challenger events.

**Response** `200`
```json
{
  "data": [
    {
      "id": "uuid",
      "business1": { "id": "uuid", "name": "...", "votes": 42 },
      "business2": { "id": "uuid", "name": "...", "votes": 38 },
      "status": "active",
      "endsAt": "2026-03-10T00:00:00Z"
    }
  ]
}
```

---

## Dishes

### GET /api/dishes/search
Search dishes across businesses.

**Query Parameters**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search query |
| `city` | string | City filter |

---

## Trending

### GET /api/trending
Get trending businesses (most rating activity in last 7 days).

---

## Photos

### GET /api/photos/proxy
Proxy for Google Places photos (avoids CORS issues on mobile).

**Query Parameters**
| Param | Type | Description |
|-------|------|-------------|
| `ref` | string | Google Places photo reference |
| `maxwidth` | number | Max image width |

---

## Admin

### POST /api/admin/seed-cities
Seed multi-city business data. **Requires auth + admin**.

Admin check uses centralized `shared/admin.ts` whitelist.

**Response** `200`
```json
{ "data": { "message": "Cities seeded successfully" } }
```

**Errors**
- `401` — Not authenticated
- `403` — Not an admin

---

## Error Format

All errors follow this format:
```json
{ "error": "Human-readable error message" }
```

Common HTTP status codes:
| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request / validation error |
| 401 | Authentication required |
| 403 | Forbidden (not admin) |
| 404 | Not found |
| 429 | Rate limited |
| 500 | Server error |
