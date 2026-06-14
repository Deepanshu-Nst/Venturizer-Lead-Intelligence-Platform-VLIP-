# API Documentation

Base URL: `/api/v1`

## Authentication

Two authentication modes:

| Mode | When | Method |
|---|---|---|
| **Public** | Qualification flow endpoints (`/lead/*`, `/qualification/*`), file serving | No auth required |
| **Authenticated** | Dashboard, lead management, scoring | `x-api-key` header with a valid API key |

Authenticated endpoints return `401 Unauthorized` if the header is missing or invalid.

### Login

```
POST /api/v1/auth/login
Content-Type: application/json

{
  "apiKey": "your-api-key"
}
```

Response `200`:
```json
{
  "token": "authenticated",
  "expires_in": "24h"
}
```

Response `401`:
```json
{
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid API key"
  }
}
```

---

## Qualification Flow (`/lead/*`)

### POST /api/v1/lead/start — Start a new session

Request:
```json
{
  "type": "founder"
}
```

| Field | Type | Valid Values |
|---|---|---|
| `type` | string | `"founder"` or `"investor"` |

Response `200`:
```json
{
  "session_id": "a1b2c3d4-...",
  "flow_type": "founder",
  "total_questions": 18,
  "first_question": {
    "id": "full_name",
    "question": "What is your full name?",
    "type": "text",
    "required": true,
    "validation": {
      "minLength": 2
    }
  }
}
```

### POST /api/v1/lead/answer — Submit a single answer

Request:
```json
{
  "sessionId": "a1b2c3d4-...",
  "questionId": "full_name",
  "value": "Jane Doe"
}
```

| Field | Type | Description |
|---|---|---|
| `sessionId` | UUID | Session ID from `/start` |
| `questionId` | string | Question identifier from the flow definition |
| `value` | any | Answer value (string, number, boolean, string[], or null) |

Response `200`:
```json
{
  "session_id": "a1b2c3d4-...",
  "question_id": "full_name",
  "value": "Jane Doe",
  "next_question": {
    "id": "email",
    "question": "What is your email address?",
    "type": "email",
    ...
  },
  "is_complete": false
}
```

When `is_complete` is `true`, `next_question` will be `null`.

### POST /api/v1/lead/submit — Finalize and persist

Request:
```json
{
  "sessionId": "a1b2c3d4-...",
  "type": "founder",
  "answers": {
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    ...
  }
}
```

Response `201`:
```json
{
  "lead_id": "f1e2d3c4-...",
  "score": 82,
  "bucket": "hot",
  "dimensions": [
    {
      "dimension": "founder_experience",
      "score": 12,
      "weight": 15,
      "rationale": "Prior startup experience + 7 years industry experience"
    },
    ...
  ],
  "reasons": {
    "strengths": [
      "Strong founder with prior startup experience",
      "Revenue-generating product with $15k MRR"
    ],
    "concerns": [
      "Solo founder — adds key-person risk"
    ],
    "recommendation": "Schedule intro call within 24 hours"
  }
}
```

### GET /api/v1/lead/:id — Get lead by ID

Response `200`:
```json
{
  "id": "f1e2d3c4-...",
  "type": "founder",
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1 555-0000",
  "status": "new",
  "score": 82,
  "score_bucket": "hot",
  "ai_evaluation": {
    "problem_clarity": 18,
    "differentiation": 16,
    "recommendation": "Strong signals, review manually"
  },
  "documents": [...],
  "scores": [...]
}
```

### POST /api/v1/lead/upload — Upload a PDF

Request: `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `file` | file | PDF file, max 10MB |
| `leadId` | UUID | Lead ID to associate the document with |
| `type` | string | `"pitch-deck"`, `"investment-thesis"`, or `"other"` |

Response `200`:
```json
{
  "document_id": "d1e2f3a4-...",
  "file_name": "pitch-deck.pdf",
  "file_size": 245760,
  "mime_type": "application/pdf",
  "url": "/api/v1/uploads/file/abc123.pdf"
}
```

---

## Legacy Qualification Flow (`/qualification/*`)

### POST /api/v1/qualification/start

Request:
```json
{ "type": "founder" }
```

Response `200`:
```json
{
  "session_id": "...",
  "flow_type": "founder",
  "total_questions": 18,
  "first_question": { ... }
}
```

### POST /api/v1/qualification/answer

Request:
```json
{ "sessionId": "...", "questionId": "full_name", "value": "Jane" }
```

Response `200`:
```json
{
  "session_id": "...",
  "question_id": "full_name",
  "value": "Jane",
  "next_question": { ... },
  "is_complete": false
}
```

### POST /api/v1/qualification/complete

Request:
```json
{
  "sessionId": "...",
  "type": "founder",
  "answers": { ... }
}
```

Response `201`:
```json
{
  "lead_id": "...",
  "score": 82,
  "bucket": "hot"
}
```

### GET /api/v1/qualification/resume/:sessionId

Response `200`:
```json
{
  "session_id": "...",
  "flow_type": "founder",
  "answers": { ... },
  "current_index": 5,
  "current_question": { ... },
  "total_questions": 18,
  "found": true
}
```

---

## File Uploads (`/uploads/*`)

### POST /api/v1/uploads/qualification — Public upload (temp)

Request: `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `file` | file | PDF file, max 10MB |
| `type` | string | Document type |

Response `200`:
```json
{
  "file_id": "...",
  "storage_key": "abc123.pdf",
  "url": "/api/v1/uploads/file/abc123.pdf"
}
```

### POST /api/v1/uploads (authenticated)

Request: `multipart/form-data` with `x-api-key` header.

| Field | Type | Description |
|---|---|---|
| `file` | file | PDF file, max 10MB |
| `lead_id` | UUID | Associated lead |
| `type` | string | Document type |

Response `200`:
```json
{
  "documentId": "...",
  "fileName": "deck.pdf",
  "fileSize": 245760,
  "mimeType": "application/pdf",
  "url": "/api/v1/uploads/file/abc.pdf",
  "createdAt": "2026-06-11T..."
}
```

### GET /api/v1/uploads/:documentId — Document metadata

Response `200`:
```json
{
  "id": "...",
  "lead_id": "...",
  "type": "pitch-deck",
  "file_name": "deck.pdf",
  "file_size": 245760,
  "mime_type": "application/pdf",
  "storage_key": "abc.pdf",
  "created_at": "2026-06-11T..."
}
```

### GET /api/v1/uploads/file/:storageKey — Download file

Response `200`: Binary file stream with `Content-Type: application/pdf` and `Content-Disposition: inline`.

---

## Dashboard (`/dashboard/*`) — Authenticated

### GET /api/v1/dashboard/summary

Response `200`:
```json
{
  "total_leads": 145,
  "total_founders": 98,
  "total_investors": 47,
  "hot_leads": 22,
  "good_leads": 45,
  "maybe_leads": 38,
  "low_leads": 40,
  "conversion_rate": 15.2,
  "new_leads_this_week": 12,
  "new_leads_this_month": 48,
  "avg_score": 58,
  "bucket_distribution": [
    { "bucket": "hot", "count": 22 },
    { "bucket": "good", "count": 45 },
    { "bucket": "maybe", "count": 38 },
    { "bucket": "low", "count": 40 }
  ],
  "status_distribution": [
    { "status": "new", "count": 60 }
  ],
  "weekly_trend": [
    { "week": "2026-06-11", "count": 2 },
    { "week": "2026-06-12", "count": 5 },
    { "week": "2026-06-13", "count": 8 },
    { "week": "2026-06-14", "count": 12 }
  ]
}
```

### GET /api/v1/dashboard/leads — List leads

Query parameters:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `type` | string | — | `"founder"` or `"investor"` |
| `status` | string | — | Filter by lead status |
| `bucket` | string | — | `"hot"`, `"good"`, `"maybe"`, `"low"` |
| `score_min` | number | — | Minimum score filter |
| `score_max` | number | — | Maximum score filter |
| `search` | string | — | Search name/email |
| `date_from` | date | — | Created after (ISO) |
| `date_to` | date | — | Created before (ISO) |
| `sort_by` | string | `"created_at"` | `"created_at"`, `"score"`, `"full_name"` |
| `sort_order` | string | `"desc"` | `"asc"` or `"desc"` |
| `page` | number | `1` | Page number |
| `per_page` | number | `20` | Items per page (max 100) |

Response `200`:
```json
{
  "data": [
    {
      "id": "f1e2d3c4-...",
      "type": "founder",
      "full_name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+1 555-0000",
      "status": "new",
      "score": 82,
      "score_bucket": "hot",
      "source": "direct",
      "assigned_to": null,
      "created_at": "2026-06-10T...",
      "updated_at": "2026-06-10T..."
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 145,
    "total_pages": 8
  }
}
```

### GET /api/v1/dashboard/leads/:id — Full lead detail

Response `200`:
```json
{
  "id": "f1e2d3c4-...",
  "type": "founder",
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1 555-0000",
  "linkedin_url": "https://linkedin.com/in/janedoe",
  "status": "new",
  "score": 82,
  "score_bucket": "hot",
  "source": "direct",
  "assigned_to": null,
  "ai_evaluation": {
    "problem_clarity": 18,
    "differentiation": 16,
    "recommendation": "Strong signals, review manually"
  },
  "created_at": "2026-06-10T...",
  "updated_at": "2026-06-10T...",
  "profile": {
    "startup_name": "Acme AI",
    "industry": "saas",
    "problem_statement": "Small businesses waste...",
    "mvp_status": "launched",
    "monthly_revenue": 15000,
    "team_size": 2,
    "funding_ask": 500000
  },
  "scores": [
    {
      "dimension": "founder_experience",
      "score": 12,
      "weight": 15,
      "rationale": "Prior startup + 7 years experience"
    }
  ],
  "documents": [
    {
      "id": "...",
      "type": "pitch-deck",
      "file_name": "pitch.pdf",
      "file_size": 245760,
      "mime_type": "application/pdf",
      "url": "...",
      "created_at": "..."
    }
  ],
  "activity_log": [
    {
      "id": "...",
      "action": "lead_created",
      "description": "Lead created via founder qualification flow",
      "user_id": null,
      "metadata": null,
      "created_at": "..."
    }
  ]
}
```

### PATCH /api/v1/dashboard/leads/:id/status — Update status

Request:
```json
{
  "status": "qualified"
}
```

| Field | Valid Values |
|---|---|
| `status` | `"new"`, `"contacted"`, `"qualified"`, `"disqualified"`, `"archived"` |

Response `200`:
```json
{
  "id": "f1e2d3c4-...",
  "status": "qualified",
  "updated_at": "2026-06-11T..."
}
```

---

## Leads CRUD (`/leads/*`) — Authenticated

### GET /api/v1/leads — List leads

Query parameters: same as `/dashboard/leads`.

### GET /api/v1/leads/:id — Get lead

### PATCH /api/v1/leads/:id — Update

Request:
```json
{
  "status": "qualified",
  "assigned_to": "uuid-or-null"
}
```

### DELETE /api/v1/leads/:id

Response `200`:
```json
{ "deleted": true }
```

---

## Scoring (`/scoring/*`) — Authenticated

### GET /api/v1/scoring/:leadId — Get score dimensions

---

## Health

### GET /api/v1/health — Liveness

```json
{ "status": "ok", "timestamp": "...", "uptime": 1234 }
```

### GET /api/v1/health/ready — Readiness

```json
{ "status": "ok", "database": "connected", "timestamp": "...", "uptime": 1234 }
```

Returns `503` if database is unreachable.

---

## Error Response Format

All errors follow a consistent structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "fields": {
      "type": "Required",
      "email": "Invalid email format"
    }
  }
}
```

### Error Codes

| HTTP Status | Error Code | Description |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Request body/params failed Zod validation |
| 401 | `AUTHENTICATION_ERROR` | Missing or invalid API key |
| 404 | `NOT_FOUND` | Resource not found |
| 413 | `FILE_TOO_LARGE` | Upload exceeds 10MB limit |
| 415 | `INVALID_FILE_TYPE` | Non-PDF file uploaded |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## Pagination

Paginated responses include:

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 145,
    "total_pages": 8
  }
}
```
