# Unite Foundation — Backend API Specification

**Base URL:** `https://api.unitefoundation.bd`
**Auth:** JWT Bearer token (`Authorization: Bearer <token>`)
**Format:** JSON (UTF-8). All timestamps ISO-8601.
**CORS:** Allow `https://unitefoundation.bd` and `http://localhost:8080` (dev).

---

## 1. Auth

| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| POST | `/auth/login` | ❌ | `{ email, password }` | `{ token, user }` |
| GET  | `/auth/me` | ✅ | — | `{ user }` |
| POST | `/auth/logout` | ✅ | — | `{ ok: true }` |

`user`: `{ id, name, email, role: "admin"|"editor"|"viewer" }`

---

## 2. Donations

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET    | `/donations?status=&method=&from=&to=&page=` | ✅ | paginated list |
| POST   | `/donations` | ❌ | public donation submission |
| GET    | `/donations/:id` | ✅ | |
| PATCH  | `/donations/:id` | ✅ | update status |
| DELETE | `/donations/:id` | ✅ | |

**Donation object:**
```json
{
  "id": "TXN-10248",
  "name": "string",
  "phone": "string",
  "amount": 5000,
  "method": "bkash|nagad|rocket|bank|card|sslcommerz",
  "area": "string",
  "transaction_id": "string|null",
  "status": "pending|completed|failed",
  "created_at": "2026-05-25T10:30:00Z"
}
```

---

## 3. Applications (Volunteer / Member / Career / Donor)

| Method | Path | Auth |
|---|---|---|
| GET    | `/applications/volunteers` | ✅ |
| GET    | `/applications/members` | ✅ |
| GET    | `/applications/careers` | ✅ |
| GET    | `/applications/donors` | ✅ |
| POST   | `/applications/:kind` | ❌ |
| PATCH  | `/applications/:kind/:id` | ✅ |

`:kind` ∈ `volunteer | member | career | donor`
Status values: `new | reviewing | approved | rejected`

---

## 4. Projects

| Method | Path | Auth |
|---|---|---|
| GET    | `/projects` | ❌ (public) |
| GET    | `/projects/:id` | ❌ |
| POST   | `/projects` | ✅ |
| PATCH  | `/projects/:id` | ✅ |
| DELETE | `/projects/:id` | ✅ |

```json
{
  "id": "P-024",
  "title": "string",
  "category": "string",
  "budget": 5000000,
  "raised": 4250000,
  "beneficiaries": 12500,
  "status": "active|completed|draft",
  "cover_image_url": "string"
}
```

---

## 5. Blog / Posts

| Method | Path | Auth |
|---|---|---|
| GET    | `/posts?status=&category=` | ❌ |
| GET    | `/posts/:slug` | ❌ |
| POST   | `/posts` | ✅ |
| PATCH  | `/posts/:id` | ✅ |
| DELETE | `/posts/:id` | ✅ |

---

## 6. Gallery

| Method | Path | Auth |
|---|---|---|
| GET    | `/gallery` | ❌ |
| POST   | `/gallery/albums` | ✅ |
| POST   | `/gallery/upload` (multipart) | ✅ |
| DELETE | `/gallery/:id` | ✅ |

---

## 7. Messages (contact form)

| Method | Path | Auth |
|---|---|---|
| POST   | `/messages` | ❌ |
| GET    | `/messages` | ✅ |
| PATCH  | `/messages/:id` | ✅ (mark read/replied) |
| DELETE | `/messages/:id` | ✅ |

---

## 8. Settings (Dashboard-editable)

| Method | Path | Auth |
|---|---|---|
| GET  | `/settings` | ❌ (public read for site config) |
| PUT  | `/settings` | ✅ |

```json
{
  "organization": { "name", "tagline", "email", "phone", "website", "address", "registration_no" },
  "payments": {
    "bkash": "01...", "nagad": "01...", "rocket": "01...",
    "bank": { "name", "account", "number", "routing" },
    "sslcommerz_store_id": "string"
  },
  "socials": { "facebook", "youtube", "instagram", "twitter" }
}
```

---

## 9. Stats / Dashboard

| Method | Path | Auth |
|---|---|---|
| GET | `/stats/overview` | ✅ |
| GET | `/stats/donations-trend?range=7d|30d|1y` | ✅ |
| GET | `/stats/channels` | ✅ |

---

## Error Format

All errors:
```json
{ "message": "Human readable error", "code": "OPTIONAL_CODE", "errors": { "field": ["..."] } }
```

HTTP codes: `400` validation, `401` auth, `403` forbidden, `404` not found, `409` conflict, `422` unprocessable, `500` server.

---

## CORS Headers (required on every response)

```
Access-Control-Allow-Origin: https://unitefoundation.bd
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Accept
```
