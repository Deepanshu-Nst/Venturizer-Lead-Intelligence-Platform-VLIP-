# User Journeys & Flows

## 1. Founder Journey

```
Landing Page
    │
    ▼
"Get Started" → Choose "I'm a Founder"
    │
    ▼
Founder Qualification Flow (18 questions, 7 stages)
    ├── Stage 1: Personal (4 questions)
    ├── Stage 2: Background (3 questions)
    ├── Stage 3: Startup (4 questions)
    ├── Stage 4: Product (1 question)
    ├── Stage 5: Traction (3 questions)
    ├── Stage 6: Team (2 questions)
    └── Stage 7: Fundraising (1 question)
    │
    ▼
Upload Pitch Deck PDF (required)
    │
    ▼
Qualification Engine → Score (0–100)
    │
    ▼
Thank You Page → Show bucket + next steps
    │
    ▼
Lead persisted in PostgreSQL → ERP Dashboard
```

### Founder Flow — Full Question Set

| # | Stage | Question | Type | Validation |
|---|---|---|---|---|
| 1 | Personal | What is your full name? | text | min 2 chars |
| 2 | Personal | What is your email address? | email | valid email |
| 3 | Personal | What is your phone number? | tel | phone regex |
| 4 | Personal | What is your LinkedIn profile URL? | url | linkedin.com |
| 5 | Background | Have you started a company before? | select | yes/no |
| 6 | Background | Years of industry experience? | number | 0–50 |
| 7 | Background | Full-time or part-time? | select | full-time/part-time |
| 8 | Startup | What is your startup called? | text | required |
| 9 | Startup | Which industry are you in? | select | fintech/health/saas/ai-ml/climate/edtech/ecommerce/other |
| 10 | Startup | What problem are you solving? | textarea | min 50 chars |
| 11 | Startup | Who is your target customer? | text | required |
| 12 | Product | What is your MVP status? | select | idea/prototype/mvp/launched/revenue |
| 13 | Traction | How many active users? | number | ≥ 0 |
| 14 | Traction | Monthly revenue (USD)? | number | ≥ 0 |
| 15 | Traction | MoM growth rate (%)? | number | 0–100 |
| 16 | Team | How many people on your team? | number | ≥ 1 |
| 17 | Team | Do you have a co-founder? | select | yes/no |
| 18 | Fundraising | Funding ask (USD)? | number | ≥ 0 |

## 2. Investor Journey

```
Landing Page
    │
    ▼
"Get Started" → Choose "I'm an Investor"
    │
    ▼
Investor Qualification Flow (17 questions, 5 stages)
    ├── Stage 1: Personal (4 questions)
    ├── Stage 2: Profile (5 questions)
    ├── Stage 3: Strategy (5 questions)
    ├── Stage 4: Timeline (3 questions)
    └── Stage 5: Materials (0 questions — just upload)
    │
    ▼
Upload Investment Thesis PDF (required)
    │
    ▼
Qualification Engine → Score (0–100)
    │
    ▼
Thank You Page → Show bucket + next steps
    │
    ▼
Lead persisted in PostgreSQL → ERP Dashboard
```

### Investor Flow — Full Question Set

| # | Stage | Question | Type | Validation |
|---|---|---|---|---|
| 1 | Personal | Full name | text | min 2 chars |
| 2 | Personal | Email | email | valid email |
| 3 | Personal | Phone | tel | phone regex |
| 4 | Personal | LinkedIn URL | url | linkedin.com |
| 5 | Profile | Investor type | select | angel/vc/family-office/corporate |
| 6 | Profile | Preferred stage | select | pre-seed/seed/series-a/series-b+ |
| 7 | Profile | Sector focus | multiselect | ≥ 1 selected |
| 8 | Profile | Min cheque size (USD) | number | ≥ 0 |
| 9 | Profile | Max cheque size (USD) | number | ≥ min |
| 10 | Strategy | Deployment timeline | select | 0-3/3-6/6-12/12+ months |
| 11 | Strategy | Portfolio count | number | ≥ 0 |
| 12 | Strategy | Preferred geography | select | north-america/europe/asia/global |
| 13 | Strategy | Follow-on strategy | textarea | min 50 chars |
| 14 | Strategy | Value-add description | textarea | min 50 chars |
| 15 | Timeline | Decision timeline | select | 1-2/2-4/4-8/8+ weeks |
| 16 | Timeline | Actively investing? | select | yes/not-yet/paused |
| 17 | Timeline | Looking for deals? | boolean | required |

## 3. Internal Team Journey (ERP Dashboard)

```
Login (API key)
    │
    ▼
Dashboard Overview
    ├── Stats Cards: Total Leads, Founders, Investors, Hot Leads
    │
    ├── Lead Table (filterable)
    │   ├── Filters: type (founder/investor), score range, bucket, date range
    │   └── Columns: Name, Type, Company, Score, Status, Created
    │
    └── Click Lead → Detail Drawer
        ├── Profile answers
        ├── Score breakdown by dimension
        ├── Uploaded PDF (download)
        └── Internal notes
```

## 4. Edge Cases

| Scenario | Handling |
|---|---|
| User refreshes mid-flow | Resume session from localStorage |
| Invalid email/phone | Inline validation error, cannot proceed |
| PDF >10MB | Reject with error message |
| Non-PDF upload | Reject with error message |
| Network failure | Retry mechanism, save locally |
| Duplicate email | Return existing lead, show thank you |
| Score = 0 | Still accepted, shown as "Low" bucket |
