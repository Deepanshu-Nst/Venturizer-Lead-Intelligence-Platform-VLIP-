# API Design

## 1. Base URL

- Development: `http://localhost:3001/api/v1`
- Production: `https://api.venturizer.com/api/v1`

## 2. Authentication

Dashboard endpoints require `x-api-key` header:

```
x-api-key: <API_KEY>
```

Auth endpoint for UI login:

```
POST /api/v1/auth/login
Content-Type: application/json

{ "apiKey": "<API_KEY>" }
```

## 3. Standard Response Format

### Success

```json
{
  "data": { ... },
  "error": null
}
```

### Error

```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "fields": ["email"]
  }
}
```

### Paginated

```json
{
  "data": [ ... ],
  "error": null,
  "meta": {
    "total": 150,
    "page": 1,
    "per_page": 20,
    "total_pages": 8
  }
}
```

## 4. Endpoints

### Qualification

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/qualification/start` | Start a new session | No |
| POST | `/qualification/answer` | Submit an answer | No |
| GET | `/qualification/:sessionId` | Resume a session | No |

#### POST /qualification/start

```json
// Request
{ "type": "founder" }

// Response
{
  "data": {
    "session_id": "uuid",
    "flow_type": "founder",
    "first_question": {
      "id": "full_name",
      "question": "What is your full name?",
      "type": "text",
      "stage": "personal",
      "required": true,
      "validation": { "minLength": 2 }
    },
    "total_questions": 18
  }
}
```

#### POST /qualification/answer

```json
// Request
{
  "sessionId": "uuid",
  "questionId": "full_name",
  "value": "Jane Doe"
}

// Response
{
  "data": {
    "session_id": "uuid",
    "question_id": "full_name",
    "value": "Jane Doe",
    "next_question": { ... },
    "is_complete": false
  }
}
```

### Leads (authenticated)

| Method | Path | Description |
|---|---|---|
| GET | `/leads` | List leads (paginated, filterable) |
| GET | `/leads/:id` | Get lead with profile + scores |
| PATCH | `/leads/:id` | Update lead (status, notes) |
| DELETE | `/leads/:id` | Soft delete lead |

#### GET /leads

Query parameters:
- `type` — `founder` | `investor`
- `score_min` — number
- `score_max` — number
- `bucket` — `hot` | `good` | `maybe` | `low`
- `date_from` — ISO date string
- `date_to` — ISO date string
- `page` — number (default: 1)
- `per_page` — number (default: 20)

### Scoring (authenticated)

| Method | Path | Description |
|---|---|---|
| GET | `/scoring/:leadId` | Get score breakdown for a lead |

### Uploads (authenticated)

| Method | Path | Description |
|---|---|---|
| POST | `/uploads` | Upload PDF (multipart/form-data) |
| GET | `/uploads/:documentId` | Get document metadata |

#### POST /uploads

```
Content-Type: multipart/form-data

file: <binary PDF>
lead_id: "uuid"
type: "pitch-deck" | "investment-thesis"
```

### Dashboard (authenticated)

| Method | Path | Description |
|---|---|---|
| GET | `/dashboard/stats` | Aggregate statistics |
| GET | `/dashboard/recent` | Recent leads (limit 10) |

#### GET /dashboard/stats

```json
{
  "data": {
    "total_leads": 124,
    "total_founders": 87,
    "total_investors": 37,
    "hot_leads": 12,
    "good_leads": 35,
    "maybe_leads": 48,
    "low_leads": 29,
    "conversion_rate": 10
  }
}
```

### Health

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check (no auth) |

## 5. Error Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| VALIDATION_ERROR | 400 | Request body failed validation |
| UNAUTHORIZED | 401 | Missing or invalid API key |
| NOT_FOUND | 404 | Resource not found |
| FILE_TOO_LARGE | 413 | PDF exceeds 10MB |
| INVALID_FILE_TYPE | 415 | Non-PDF upload attempted |
| INTERNAL_ERROR | 500 | Unexpected server error |
