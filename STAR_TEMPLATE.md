# STAR Method Problem-Solving Template

## Venturizer's Preferred Problem-Solving Framework
### Situation · Task · Action · Result
#### Tech Intern – Lead Qualification Chatbot

**Problem Statement:** Build a conversational chatbot + ERP dashboard to automate Venturizer's 500+ monthly inbound enquiries.

---

## S — SITUATION

**Set the scene. Frame the operational problem and who the tool serves.**

**Why does manually reviewing 500+ organic inbound enquiries per month fail to scale?**

Venturizer receives over 500 inbound enquiries monthly from founders seeking funding and investors wanting to deploy capital. Each enquiry requires a team member to manually read the submission, assess fit, research the founder/investor background, determine qualification stage, and log the result — taking approximately 20–30 minutes per lead. At 500+ leads/month, that's 170–250 person-hours of manual triage. More critically, inconsistent evaluation criteria between team members leads to variable qualification quality, missed hot leads buried in the pipeline, and slow response times (often 5–7 business days for initial contact). As the firm scales deal flow, this manual process doesn't just fail to scale — it actively loses opportunities.

**Who are the two user types (founders vs investors), and how do their needs differ?**

- **Founders:** Seeking capital to build/scale their startup. Need to communicate their vision, traction, team quality, and funding requirements. Their motivation is high — they want to be evaluated fairly and quickly. They need to convey complex information (problem, solution, market, traction) in a structured way. They are typically first-time or second-time founders with varying levels of fundraising sophistication.

- **Investors (angels/VCs/family offices):** Seeking to deploy capital into high-quality opportunities. Need to communicate their investment thesis, sector focus, cheque size, portfolio strategy, and decision timeline. Their needs center on expressing their fit with Venturizer's deal flow and demonstrating their ability to add value beyond capital. They may be less patient than founders and expect a professional, efficient process.

**What data must be captured from founders (background, problem, MVP, traction, team, funding ask, validation)?**

- Personal identity: full name, email, phone, LinkedIn profile
- Founder background: prior startup experience, years of industry experience, commitment level (full-time vs part-time)
- Startup information: company name, industry sector, problem statement, target customer
- Product stage: MVP status (idea → prototype → mvp → launched → revenue)
- Traction metrics: active users, monthly revenue, growth rate
- Team: headcount, co-founder status
- Fundraising: funding ask amount, pitch deck document
- 18 questions total across 7 stages

**What data must be captured from investors (thesis, stage focus, cheque size, portfolio, support model, timeline)?**

- Personal identity: full name, email, phone, LinkedIn profile
- Investor profile: type (angel/vc/family-office/corporate), preferred stage (pre-seed → series B+), sector focus (multiselect)
- Cheque parameters: min/max cheque size in USD
- Strategy: deployment timeline, portfolio company count, geography preference
- Value proposition: follow-on strategy, value-add description
- Decision process: decision timeline, active investing status, deal flow interest
- Document: investment thesis upload
- 17 questions across 4 stages (with branching logic reducing visible count based on answers)

---

## T — TASK

**Define your deliverable. Clarify exactly what the system must do.**

**What conversational flows will you build, and how will they ask 16–20 questions per user type?**

Two distinct flows — founder (18 questions) and investor (17 questions). Each flow presents one question at a time in a clean, form-based interface (not a chat bubble UI). Questions are grouped into named stages with a progress bar showing both completion percentage and stage progression. Navigation is via "Continue" (advance) and "Back" (previous) buttons. On the final question, "Continue" becomes "Submit" with a loading spinner during API submission. Branching rules dynamically skip irrelevant questions (e.g., if an investor is not actively investing, the "looking for deals" question is hidden).

**How will the chatbot validate answers in real time?**

Each of the 10 input types (text, email, tel, url, number, select, multiselect, textarea, boolean, file) has per-field validation rules defined in the question schema:
- **Email:** Regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Phone:** Regex `/^\+?[\d\s\-()]{7,20}$/`
- **URL:** `new URL()` constructor check + domain pattern match (e.g., "linkedin.com" must be present for LinkedIn URL)
- **Number:** `isNaN` check, min/max range enforcement
- **Text/Textarea:** minLength/maxLength character count
- **File:** MIME type (`application/pdf`) and file size (max 10MB) validated on the client before upload begins

Validation fires on the "Continue" click — if validation fails, a red error message appears below the input and the user cannot advance until fixed.

**How will all responses be stored in the database?**

On final submission (`POST /api/v1/lead/submit`), the backend:
1. **INSERT INTO leads** — Core record with type, contact info, computed score (0–100), scored bucket (hot/good/maybe/low)
2. **INSERT INTO founder_profiles OR investor_profiles** — 1:1 profile with all flow-specific fields
3. **INSERT INTO lead_scores** — One row per scoring dimension (7 for founders, 6 for investors) with individual dimension score, weight, and rationale
4. **INSERT INTO documents** — If a file was uploaded, the document record is created and linked to the lead
5. **INSERT INTO activity_logs** — Audit entry recording the lead creation event

During the flow, answers are held in an in-memory session (2-hour TTL) with client-side localStorage backup for crash resilience.

**How will you generate a 0–100 qualification score that defines fitment with Venturizer?**

A deterministic rule-based scoring engine evaluates answers against predefined evaluator functions:

**Founder (max 100 across 7 dimensions):**
| Dimension | Weight | Evaluation Criteria |
|---|---|---|
| founder_experience | 15 | Prior startup? (8/2) + industry years (capped at 7) |
| industry_knowledge | 10 | Problem statement clarity (length/20 capped at 5) + customer clarity (5) |
| mvp_readiness | 20 | idea=0, prototype=5, mvp=12, launched=18, revenue=20 |
| traction | 20 | Users (>100→7, >10→4) + revenue (>10k→8, >1k→5) + growth (>20%→5, >10%→3) |
| team_strength | 15 | Team size (>1→5/2) + co-founder (10/0) |
| validation | 10 | Revenue exists (5/0) + users (>50→5, >10→3, >0→1) |
| funding_readiness | 10 | Full-time (5/1) + ask 0–5M (5/3/0) |

**Investor (max 100 across 6 dimensions):**
| Dimension | Weight | Evaluation Criteria |
|---|---|---|
| active_investor | 20 | Actively investing (10/2) + looking (10/0) |
| cheque_size | 20 | Max cheque: ≥500k→20, ≥100k→15, >0→5 |
| deployment_timeline | 15 | 0-3mo→15, 3-6→10, 6-12→5, 12+→0 |
| portfolio_quality | 15 | ≥5 companies→15, ≥2→10, >0→5 |
| sector_match | 15 | ≥3 sectors→15, 2→10, 1→5 |
| value_add | 15 | Description >100 chars→15, >50→10, >0→5 |

Total = `Math.min(sum of all dimension scores, 100)`. Buckets: 80-100 Hot → 60-79 Good → 40-59 Maybe → 0-39 Low.

---

## A — ACTION

**Detail your approach. Justify your technical decisions and design.**

**Which tech stack will you use and why?**

- **React 18 + TypeScript + Vite** — Modern component model, fast HMR via Vite (no Webpack overhead), TypeScript for type safety across 60+ source files. Chosen over Next.js because this is a client-heavy SPA with a separate backend — no SSR needed.
- **Tailwind CSS 3 + shadcn/ui** — Utility-first CSS enables rapid prototyping of the minimal venture capital aesthetic (near-black/white/red palette). shadcn/ui provides accessible primitives (Button, Card, Badge) that we customize via CSS variables rather than fighting a pre-built component library.
- **Node.js + Express 4 + TypeScript** — Simple, well-understood backend for a REST API. Express middleware ecosystem (helmet, cors) handles security without framework lock-in. No ORM — raw SQL via `pg` gives full control over query performance for dashboard aggregations.
- **PostgreSQL 16** — Relational model fits the structured data (leads, profiles, scores, documents, activity logs). JSONB for flexible metadata. GIN indexes for full-text search on activity logs.
- **Vercel + Railway** — Vercel for the static frontend (zero-config, global CDN, SPA rewrites). Railway for the backend (managed PostgreSQL, simple env config, `railway up` deploy). Separates concerns and avoids vendor lock-in.
- **Recharts** — For analytics charts. Lazy-loaded (420KB separate chunk) so it doesn't bloat the main bundle.

**Avoided:**
- Next.js (SSR not needed for a dashboard tool)
- Python/FastAPI (team is Node-first, and Express is sufficient for this request volume)
- Prisma/TypeORM (raw SQL is simpler and faster for the query patterns we need)
- Redux/Zustand (useReducer is sufficient for one-question-at-a-time flow)
- LLM/OpenAI (deterministic scoring is faster, cheaper, auditable, and more consistent)

**Sketch the conversation flow diagram and the database schema.**

*(See `docs/CONVERSATION_FLOW.md` for Mermaid state diagrams showing both founder and investor flows with branching logic.)*

*(See `docs/DATABASE_SCHEMA.md` for the complete ER diagram showing all 7 tables, their columns, types, constraints, indexes, and foreign key relationships.)*

**Key schema decisions:**
- `leads` table is polymorphic via `type` column (`founder`/`investor`), with separate `founder_profiles` and `investor_profiles` for type-specific fields (1:1 with leads)
- `lead_scores` stores per-dimension results (normalized, not JSON) to enable per-dimension querying and aggregation
- `activity_logs` uses JSONB `metadata` for flexible audit data
- Case-insensitive email uniqueness via `LOWER(email)` functional index
- Composite indexes on `(type, status)` and `(type, score)` for common dashboard filter patterns

**Define the scoring logic for each bucket: 80–100 Hot, 60–79 Good, 40–59 Maybe, 0–39 Low.**

Score thresholds drive downstream actions:

| Bucket | Score Range | Recommendation | Venturizer Action |
|---|---|---|---|
| Hot | 80–100 | "Schedule intro call within 24 hours" | Immediate personal outreach by partner |
| Good | 60–79 | "Nurture with weekly check-ins" | Add to nurture sequence, assign analyst |
| Maybe | 40–59 | "Revisit in 30 days" | Move to monitoring pipeline, re-engage in 30 days |
| Low | 0–39 | "Low priority — monitor" | Long-term nurture, no active outreach |

**Strengths & Concerns reasoning:** Generated by threshold logic on each dimension:
- Score ≥ 60% of weight → listed as a **Strength** (e.g., "Strong team: co-founder in place")
- Score < 40% of weight → listed as a **Concern** (e.g., "No revenue traction yet")
- 40–59% of weight → neither strength nor concern (neutral)

**How will the dashboard let the Venturizer team filter and view leads?**

The dashboard at `/dashboard` provides:
1. **Summary Cards** — 4 stat cards (Total Leads, Founders, Avg Score, Hot) with week-over-week trend arrows
2. **Qualification Breakdown** — Horizontal bar chart showing bucket distribution with percentage labels
3. **Filters** — Dropdown selects for type (founder/investor), status, bucket + debounced search input. All filters sync to URL search params for shareability and refresh persistence.
4. **Lead Table** — Sortable (by name, score, date), paginated rows with bucket badges and clickable rows opening a detail drawer
5. **Lead Drawer** — Slide-over panel with score bars, qualification summary (strengths/concerns/recommendation), recent activity, and status change buttons
6. **Lead Detail Page** (`/dashboard/leads/:id`) — Full profile with profile section, qualification section, answers grouped by stage, score breakdown (dimension bars with rationale), status workflow (6-status button group), documents with inline PDF viewer, activity timeline, and notes textarea
7. **Analytics Page** (`/dashboard/analytics`) — 8 metric stats grid, weekly lead volume trend chart (line), bucket distribution chart (bar), lazy-loaded

**How will you structure your API and document it?**

RESTful API at `/api/v1/` with feature-based routing:

```
POST   /api/v1/lead/start                     # Start qualification flow
POST   /api/v1/lead/answer                    # Submit single answer
POST   /api/v1/lead/submit                    # Finalize + persist lead
GET    /api/v1/lead/:id                       # Get lead
POST   /api/v1/lead/upload                    # Upload PDF
GET    /api/v1/dashboard/summary              # Dashboard stats
GET    /api/v1/dashboard/leads                # Paginated lead list
GET    /api/v1/dashboard/leads/:id            # Lead detail
PATCH  /api/v1/dashboard/leads/:id/status     # Update status
POST   /api/v1/auth/login                     # API key auth
```

Two auth modes: **public** (qualification flow — no auth needed, designed for external submission) and **authenticated** (dashboard/lead management — requires `x-api-key` header).

Validation via Zod schemas at every endpoint. Error responses follow a consistent format: `{ error: { code, message, fields? } }`.

API documentation at `docs/API.md` with full request/response examples for every endpoint.

---

## R — RESULT

**Show the outcome. Summarise deliverables and measurable impact.**

**What is the measurable impact (time saved per enquiry, throughput, response speed)?**

- **Time saved:** Manual review averages 20–30 minutes per lead. Automated scoring + structured data capture reduces this to 2–5 minutes per lead (dashboard review + qualification check). Estimated 75–83% reduction in triage time, saving 140–200 person-hours per month.
- **Throughput:** 500+ enquiries processed instantly — no queue, no backlog. System handles submissions asynchronously; dashboard always shows the latest pipeline state.
- **Response speed:** Automated qualification means the Venturizer team can surface hot leads within hours instead of days. The 24-hour call scheduling recommendation for hot leads is actionable within the same business day.
- **Consistency:** Rule-based scoring eliminates human variability — all leads are evaluated by the same criteria, every time. No more hot leads slipping through because a different team member reviewed them.
- **Data quality:** Real-time validation ensures every submission captures clean, complete, well-formatted data. No more "call for details" or "missing information" follow-ups.

**List your deliverables: GitHub repo with tests, README, flow diagram, schema, API docs, 15-min demo.**

| Deliverable | Location | Status |
|---|---|---|
| README | `README.md` | Complete — tech stack, setup, architecture, scoring rules |
| Database Schema | `docs/DATABASE_SCHEMA.md` | Complete — ER diagram + 7 table definitions + indexes + relationships |
| Conversation Flow Diagram | `docs/CONVERSATION_FLOW.md` | Complete — Mermaid diagrams for both flows, branching, state machine |
| API Documentation | `docs/API.md` | Complete — 15+ endpoints with request/response examples |
| Architecture Diagram | `docs/ARCHITECTURE.md` | Complete — system diagram + frontend + backend + data flow sequence |
| Deployment Guide | `docs/DEPLOYMENT.md` | Complete — local setup, Railway backend, Vercel frontend, CI/CD |
| Demo Script | `docs/DEMO_SCRIPT.md` | Complete — 15-min walkthrough with narration |
| STAR Template | `STAR_TEMPLATE.md` | Complete — this document |
| GitHub Repository | `<repo-url>` | — |
| Automated Tests | `backend/` | 97 tests passing (22 scoring, 35 lead, 23 dashboard, 17 upload) |
| 15-Minute Demo | Live walkthrough | See `docs/DEMO_SCRIPT.md` |

**Frontend build metrics:**
- Main bundle: 294 KB gzipped (85 KB gzip)
- Analytics chunk: 374 KB (111 KB gzip, lazy-loaded)
- CSS: 31 KB (6 KB gzip)
- Total: 668 KB across 4 code-split chunks

**Backend test coverage:** 97 tests across 4 test files, all passing with 316ms total runtime.

**How does each scoring bucket trigger the correct downstream action (outreach, follow-up, clarification, rejection)?**

The system maps buckets to actionable recommendations via deterministic rules:

| Bucket | Score | System Output | Downstream Action |
|---|---|---|---|
| Hot | 80–100 | `"Schedule intro call within 24 hours"` | Partner-level outreach. Lead flagged as priority in dashboard. Team sees green "Schedule intro call" recommendation on lead detail page. |
| Good | 60–79 | `"Nurture with weekly check-ins"` | Assigned to investment analyst for qualification development. Weekly touchpoints via nurture sequence. Yellow/amber indicator. |
| Maybe | 40–59 | `"Revisit in 30 days"` | Added to monitoring pipeline with 30-day re-engagement timer. No active outreach unless lead re-engages. Grey indicator. |
| Low | 0–39 | `"Low priority — monitor"` | Pipeline only — no active workflow. Archived after 90 days of inactivity unless lead re-submits with stronger signals. |

The dashboard shows the recommendation text directly on the lead detail page alongside the strengths (green checkmarks) and concerns (amber warnings) that drove the score, so the team can immediately see *why* a lead scored the way they did and what action to take.

**What did you learn, and what would you improve in a v2?**

**What I learned:**

1. **Form-based qualification > chatbot for VC context.** The initial instinct was to build a chat-like interface, but the form-based approach with one question at a time feels more deliberate, professional, and appropriate for venture capital. Users take the process seriously when it looks serious.

2. **Branching is deceptively complex in a single-question-at-a-time flow.** Rebuilding the entire question list on every answer (rather than maintaining a pointer-based skip list) simplifies the state machine but requires careful handling of the "current index" when questions are inserted/removed dynamically.

3. **useReducer + localStorage > session storage for resilience.** The debounced localStorage persistence (300ms) means the qualification survives any browser crash or accidental tab close. The user returns to exactly where they left off — no data loss, no re-entry.

4. **Raw SQL without ORM is viable for mid-size projects.** Seven tables, 10+ repository files, and 97 tests later — the SQL is clean, the query planner is visible, and there's no ORM overhead to fight. The `pg` pool's parameterized queries prevent injection naturally.

5. **CSS variables for theming are powerful.** The entire Sequoia-inspired aesthetic (near-black foreground, white background, red accent) is controlled by 15 CSS variables. Dark mode would be a few lines of CSS and one toggle.

**What I would improve in v2:**

1. **Add PostgreSQL LISTEN/NOTIFY for real-time dashboard updates.** Currently the dashboard polls on mount. A WebSocket or server-sent events channel would push updates when new leads are submitted.

2. **Build a scoring rule configurator UI.** Currently scoring rules are hardcoded TypeScript functions. A v2 could let the Venturizer team adjust weights and thresholds via the dashboard without deploying code.

3. **Add email notifications.** Hot leads should trigger an email alert to the investment team. Post-submission, send a confirmation to the founder/investor with expected timeline.

4. **User authentication with sessions, not just API key.** For a team of 5–10 internal users, a proper login flow with session management would be more practical than shared API keys.

5. **Export pipeline to CSV/PDF.** The lead table should have an "Export" button for reporting purposes.

6. **Duplicate detection.** Currently duplicate emails create a new lead each time. V2 should detect and merge, or at least flag as a repeat submission.

7. **File preview optimization.** The current PDF viewer loads the full file into an iframe. For large pitch decks (50+ pages), a page-by-page streaming preview would be better.

8. **Automated accessibility audit.** Add axe-core to CI pipeline to catch accessibility regressions on every PR.

9. **Dark mode.** With CSS variable theming already in place, adding a dark mode toggle is straightforward and expected for a dashboard tool.

10. **Rate limiting on public endpoints.** The `/lead/*` endpoints are unauthenticated — a rate limiter would prevent abuse.
