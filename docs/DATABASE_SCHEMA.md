# Database Schema

## ER Diagram

```mermaid
erDiagram
    users ||--o{ leads : "assigns"
    leads ||--|| founder_profiles : "has"
    leads ||--|| investor_profiles : "has"
    leads ||--o{ lead_scores : "has"
    leads ||--o{ documents : "has"
    leads ||--o{ activity_logs : "has"

    users {
        uuid id PK
        varchar email UK
        varchar name
        varchar role "admin | editor | viewer"
        varchar api_key_hash
        boolean is_active
        timestamptz last_login_at
        timestamptz created_at
        timestamptz updated_at
    }

    leads {
        uuid id PK
        varchar type "founder | investor"
        varchar full_name
        varchar email UK
        varchar phone
        varchar linkedin_url
        varchar status "new | contacted | qualified | disqualified | archived"
        integer score "0-100"
        varchar score_bucket "hot | good | maybe | low"
        jsonb ai_evaluation
        uuid assigned_to FK
        varchar source
        timestamptz created_at
        timestamptz updated_at
    }

    founder_profiles {
        uuid id PK
        uuid lead_id FK UK
        boolean prev_startup
        integer industry_experience
        varchar commitment "full-time | part-time"
        varchar startup_name
        varchar industry
        text problem_statement
        text target_customer
        varchar mvp_status "idea | prototype | mvp | launched | revenue"
        integer active_users
        decimal monthly_revenue
        decimal growth_rate
        integer team_size
        boolean has_cofounder
        decimal funding_ask
    }

    investor_profiles {
        uuid id PK
        uuid lead_id FK UK
        varchar investor_type "angel | vc | family-office | corporate"
        varchar preferred_stage
        text[] sector_focus
        decimal cheque_min
        decimal cheque_max
        varchar deployment_timeline "0-3 | 3-6 | 6-12 | 12-plus"
        integer portfolio_count
        varchar geography
        text follow_on_strategy
        text value_add
        varchar decision_timeline "1-2 | 2-4 | 4-8 | 8-plus"
        varchar actively_investing "yes | not-yet | paused"
        boolean looking_for_deals
    }

    lead_scores {
        uuid id PK
        uuid lead_id FK
        varchar dimension
        integer score
        integer weight
        text rationale
        timestamptz created_at
    }

    documents {
        uuid id PK
        uuid lead_id FK
        varchar type "pitch-deck | investment-thesis | other"
        varchar file_name
        integer file_size
        varchar mime_type
        varchar storage_key
        uuid uploaded_by FK
        timestamptz created_at
    }

    activity_logs {
        uuid id PK
        uuid lead_id FK
        uuid user_id FK
        varchar action
        text description
        jsonb metadata
        timestamptz created_at
    }
```

## Table Definitions

### `users` — Internal Venturizer team members

| Column | Type | Constraints | Default |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` |
| `email` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | — |
| `name` | `VARCHAR(255)` | `NOT NULL` | — |
| `role` | `VARCHAR(20)` | `CHECK (role IN ('admin','editor','viewer'))` | `'viewer'` |
| `api_key_hash` | `VARCHAR(255)` | `NOT NULL` | — |
| `is_active` | `BOOLEAN` | `NOT NULL` | `true` |
| `last_login_at` | `TIMESTAMPTZ` | — | — |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` | `NOW()` |

**Indexes:**
- `idx_users_email` — UNIQUE on `LOWER(email)`
- `idx_users_role` — on `role`
- `idx_users_is_active` — on `is_active`

**Seed data:** Default admin user (`admin@venturizer.com`).

---

### `leads` — Core entity (founder or investor)

| Column | Type | Constraints | Default |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` |
| `type` | `VARCHAR(10)` | `CHECK (type IN ('founder','investor'))`, `NOT NULL` | — |
| `full_name` | `VARCHAR(255)` | `NOT NULL` | — |
| `email` | `VARCHAR(255)` | `NOT NULL` | — |
| `phone` | `VARCHAR(50)` | — | — |
| `linkedin_url` | `VARCHAR(500)` | — | — |
| `status` | `VARCHAR(20)` | `CHECK (status IN ('new','contacted','qualified','disqualified','archived'))` | `'new'` |
| `score` | `INTEGER` | `CHECK (score >= 0 AND score <= 100)` | — |
| `score_bucket` | `VARCHAR(10)` | `CHECK (score_bucket IN ('hot','good','maybe','low'))` | — |
| `ai_evaluation` | `JSONB` | — | — |
| `assigned_to` | `UUID` | `REFERENCES users(id) ON DELETE SET NULL` | — |
| `source` | `VARCHAR(50)` | `NOT NULL` | `'direct'` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` | `NOW()` |

**Indexes:**
- `idx_leads_email` — UNIQUE on `LOWER(email)`
- `idx_leads_type` — single-column
- `idx_leads_status` — single-column
- `idx_leads_score` — single-column
- `idx_leads_score_bucket` — single-column
- `idx_leads_assigned_to` — single-column
- `idx_leads_source` — single-column
- `idx_leads_created_at` — single-column
- `idx_leads_type_status` — composite on `(type, status)`
- `idx_leads_type_score` — composite on `(type, score)`

---

### `founder_profiles` — 1:1 with leads (type = 'founder')

| Column | Type | Constraints | Default |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` |
| `lead_id` | `UUID` | `NOT NULL, UNIQUE, REFERENCES leads(id) ON DELETE CASCADE` | — |
| `prev_startup` | `BOOLEAN` | — | — |
| `industry_experience` | `INTEGER` | — | — |
| `commitment` | `VARCHAR(20)` | `CHECK (commitment IN ('full-time','part-time'))` | — |
| `startup_name` | `VARCHAR(255)` | — | — |
| `industry` | `VARCHAR(100)` | — | — |
| `problem_statement` | `TEXT` | — | — |
| `target_customer` | `TEXT` | — | — |
| `mvp_status` | `VARCHAR(20)` | `CHECK (mvp_status IN ('idea','prototype','mvp','launched','revenue'))` | — |
| `active_users` | `INTEGER` | — | — |
| `monthly_revenue` | `DECIMAL(12,2)` | — | — |
| `growth_rate` | `DECIMAL(5,2)` | — | — |
| `team_size` | `INTEGER` | — | — |
| `has_cofounder` | `BOOLEAN` | — | — |
| `funding_ask` | `DECIMAL(12,2)` | — | — |

**Indexes:** `idx_founder_profiles_lead_id`, `idx_founder_profiles_mvp_status`, `idx_founder_profiles_industry`

---

### `investor_profiles` — 1:1 with leads (type = 'investor')

| Column | Type | Constraints | Default |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` |
| `lead_id` | `UUID` | `NOT NULL, UNIQUE, REFERENCES leads(id) ON DELETE CASCADE` | — |
| `investor_type` | `VARCHAR(20)` | `CHECK (investor_type IN ('angel','vc','family-office','corporate'))` | — |
| `preferred_stage` | `VARCHAR(20)` | — | — |
| `sector_focus` | `TEXT[]` | — | — |
| `cheque_min` | `DECIMAL(12,2)` | — | — |
| `cheque_max` | `DECIMAL(12,2)` | — | — |
| `deployment_timeline` | `VARCHAR(20)` | — | — |
| `portfolio_count` | `INTEGER` | — | — |
| `geography` | `VARCHAR(50)` | — | — |
| `follow_on_strategy` | `TEXT` | — | — |
| `value_add` | `TEXT` | — | — |
| `decision_timeline` | `VARCHAR(20)` | — | — |
| `actively_investing` | `VARCHAR(20)` | — | — |
| `looking_for_deals` | `BOOLEAN` | — | — |

**Indexes:** `idx_investor_profiles_lead_id`, `idx_investor_profiles_type`, `idx_investor_profiles_stage`

---

### `lead_scores` — Per-dimension score breakdown

| Column | Type | Constraints | Default |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` |
| `lead_id` | `UUID` | `NOT NULL, REFERENCES leads(id) ON DELETE CASCADE` | — |
| `dimension` | `VARCHAR(50)` | `NOT NULL` | — |
| `score` | `INTEGER` | `NOT NULL, CHECK (score >= 0)` | — |
| `weight` | `INTEGER` | `NOT NULL, CHECK (weight > 0)` | — |
| `rationale` | `TEXT` | — | — |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `NOW()` |

**Indexes:**
- `idx_lead_scores_lead_id` — on `lead_id`
- `idx_lead_scores_dimension` — on `dimension`
- `idx_lead_scores_lead_dimension` — UNIQUE on `(lead_id, dimension)`

---

### `documents` — Uploaded PDF files

| Column | Type | Constraints | Default |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` |
| `lead_id` | `UUID` | `NOT NULL, REFERENCES leads(id) ON DELETE CASCADE` | — |
| `type` | `VARCHAR(20)` | `CHECK (type IN ('pitch-deck','investment-thesis','other'))` | `'other'` |
| `file_name` | `VARCHAR(255)` | `NOT NULL` | — |
| `file_size` | `INTEGER` | `CHECK (file_size > 0)` | — |
| `mime_type` | `VARCHAR(100)` | `NOT NULL` | `'application/pdf'` |
| `storage_key` | `VARCHAR(500)` | `NOT NULL` | — |
| `uploaded_by` | `UUID` | `REFERENCES users(id) ON DELETE SET NULL` | — |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `NOW()` |

**Indexes:** `idx_documents_lead_id`, `idx_documents_type`, `idx_documents_uploaded_by`

---

### `activity_logs` — Audit trail

| Column | Type | Constraints | Default |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` |
| `lead_id` | `UUID` | `NOT NULL, REFERENCES leads(id) ON DELETE CASCADE` | — |
| `user_id` | `UUID` | `REFERENCES users(id) ON DELETE SET NULL` | — |
| `action` | `VARCHAR(50)` | `NOT NULL` | — |
| `description` | `TEXT` | `NOT NULL` | — |
| `metadata` | `JSONB` | — | — |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `NOW()` |

**Indexes:** `idx_activity_logs_lead_id`, `idx_activity_logs_user_id`, `idx_activity_logs_action`, `idx_activity_logs_created_at`, `idx_activity_logs_lead_action`, `idx_activity_logs_metadata` (GIN)

---

## Key Relationships

| From | To | Type | Foreign Key |
|---|---|---|---|
| `leads.assigned_to` | `users.id` | Many-to-One | `ON DELETE SET NULL` |
| `founder_profiles.lead_id` | `leads.id` | One-to-One | `ON DELETE CASCADE` |
| `investor_profiles.lead_id` | `leads.id` | One-to-One | `ON DELETE CASCADE` |
| `lead_scores.lead_id` | `leads.id` | Many-to-One | `ON DELETE CASCADE` |
| `documents.lead_id` | `leads.id` | Many-to-One | `ON DELETE CASCADE` |
| `documents.uploaded_by` | `users.id` | Many-to-One | `ON DELETE SET NULL` |
| `activity_logs.lead_id` | `leads.id` | Many-to-One | `ON DELETE CASCADE` |
| `activity_logs.user_id` | `users.id` | Many-to-One | `ON DELETE SET NULL` |

## Extensions

- `pgcrypto` — provides `gen_random_uuid()`

## Triggers

- `update_users_updated_at` — auto-updates `users.updated_at` on row modification
- `update_leads_updated_at` — auto-updates `leads.updated_at` on row modification
