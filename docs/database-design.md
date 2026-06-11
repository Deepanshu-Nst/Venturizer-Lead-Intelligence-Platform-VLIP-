# Database Design

## 1. Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────────┐
│      leads       │       │  founder_profiles     │
├──────────────────┤       ├──────────────────────┤
│ PK id (UUID)     │──1:1──│ PK id (UUID)         │
│ type             │       │ FK lead_id (UUID)     │
│ full_name        │       │ prev_startup          │
│ email            │       │ industry_experience   │
│ phone            │       │ commitment            │
│ linkedin_url     │       │ startup_name          │
│ status           │       │ industry              │
│ score            │       │ problem_statement     │
│ score_bucket     │       │ target_customer       │
│ created_at       │       │ mvp_status            │
│ updated_at       │       │ active_users          │
└──────────────────┘       │ monthly_revenue       │
       │                   │ growth_rate           │
       │                   │ team_size             │
       │                   │ has_cofounder         │
       │                   │ funding_ask           │
       │                   └──────────────────────┘
       │
       │                   ┌──────────────────────┐
       │                   │  investor_profiles    │
       │                   ├──────────────────────┤
       ├──────────────────1:1│ PK id (UUID)         │
       │                   │ FK lead_id (UUID)     │
       │                   │ investor_type         │
       │                   │ preferred_stage       │
       │                   │ sector_focus (TEXT[]) │
       │                   │ cheque_min            │
       │                   │ cheque_max            │
       │                   │ deployment_timeline   │
       │                   │ portfolio_count       │
       │                   │ geography             │
       │                   │ follow_on_strategy    │
       │                   │ value_add             │
       │                   │ decision_timeline     │
       │                   │ actively_investing    │
       │                   │ looking_for_deals     │
       │                   └──────────────────────┘
       │
       │                   ┌──────────────────────────┐
       │                   │  qualification_scores     │
       │                   ├──────────────────────────┤
       ├──────────────────1:N│ PK id (UUID)            │
       │                   │ FK lead_id (UUID)         │
       │                   │ dimension (VARCHAR(50))   │
       │                   │ score (INT)               │
       │                   │ weight (INT)              │
       │                   │ rationale (TEXT)          │
       │                   │ created_at                │
       │                   └──────────────────────────┘
       │
       │                   ┌──────────────────────────┐
       │                   │  uploaded_documents       │
       │                   ├──────────────────────────┤
       ├──────────────────1:N│ PK id (UUID)            │
       │                   │ FK lead_id (UUID)         │
       │                   │ type                      │
       │                   │ file_name                 │
       │                   │ file_size                 │
       │                   │ s3_key                    │
       │                   │ uploaded_at               │
       │                   └──────────────────────────┘
       │
       │                   ┌──────────────────────────┐
       │                   │  lead_notes               │
       │                   ├──────────────────────────┤
       └──────────────────1:N│ PK id (UUID)            │
                           │ FK lead_id (UUID)         │
                           │ content (TEXT)            │
                           │ author                    │
                           │ created_at                │
                           └──────────────────────────┘
```

## 2. Schema

See `backend/src/migrations/001_initial.sql` for the full implementation.

## 3. Indexes

| Index | Columns | Purpose |
|---|---|---|
| `idx_leads_type` | `type` | Filter founder vs investor |
| `idx_leads_score` | `score` | Range queries for score filtering |
| `idx_leads_bucket` | `score_bucket` | Bucket-based filtering |
| `idx_leads_created` | `created_at` | Date range queries, sort |
| `idx_qualification_scores_lead` | `lead_id` | JOIN performance |
| `idx_lead_notes_lead` | `lead_id` | JOIN performance |
| `idx_uploaded_documents_lead` | `lead_id` | JOIN performance |

## 4. Constraints

- `leads.email` is UNIQUE (no duplicate lead submissions)
- `founder_profiles.lead_id` is UNIQUE (one profile per lead)
- `investor_profiles.lead_id` is UNIQUE (one profile per lead)
- All foreign keys have `ON DELETE CASCADE`
- `score` is constrained 0–100 via CHECK
- `type` constrained to `founder`/`investor` via CHECK
- `status` constrained to `new`/`contacted`/`qualified`/`disqualified` via CHECK
- `score_bucket` constrained to `hot`/`good`/`maybe`/`low` via CHECK

## 5. Migration Strategy

- Migrations live in `backend/src/migrations/` as numbered SQL files
- `run.ts` executes migrations sequentially
- Future migrations add new files (e.g., `002_add_lead_tags.sql`)
- No down migrations in v1; rollback via restore
