# Architecture

## System Overview

```mermaid
graph TB
    subgraph "Browser"
        REACT[React 18 SPA]
        TAILWIND[Tailwind CSS]
        ROUTER[React Router]
        STATE[useReducer<br/>State Machine]
    end

    subgraph "Vercel (Frontend)"
        VITE[Vite Build]
        STATIC[Static Assets]
    end

    subgraph "Railway (Backend)"
        EXPRESS[Express 4 API]
        AUTH[Auth Middleware]
        VALIDATE[Zod Validation]
        SCORING[Scoring Engine]
        UPLOAD[Upload Service]
        SESSION[Session Manager]
    end

    subgraph "Database"
        PG[(PostgreSQL 16)]
    end

    subgraph "Storage"
        DISK[Disk Storage]
        S3[AWS S3]
    end

    REACT -->|/api/v1/*| EXPRESS
    EXPRESS --> VALIDATE
    EXPRESS --> AUTH
    EXPRESS --> SCORING
    EXPRESS --> UPLOAD
    EXPRESS --> SESSION
    SCORING --> PG
    UPLOAD --> DISK
    UPLOAD --> S3
    EXPRESS --> PG
```

## Frontend Architecture

```mermaid
graph TB
    subgraph "Entry"
        MAIN[main.tsx]
        APP[App.tsx]
    end

    subgraph "Public Routes"
        LANDING[LandingPage]
        QUALIFY[QualificationPage]
        THANKYOU[ThankYouPage]
    end

    subgraph "Dashboard Routes"
        DASHBOARD[DashboardLayout]
        OVERVIEW[DashboardPage]
        LEADS[LeadDetailPage]
        ANALYTICS[AnalyticsPage<br/>Lazy Loaded]
    end

    subgraph "Qualification Engine"
        MACHINE[useQualificationMachine]
        FLOWS[FounderFlow / InvestorFlow]
        BRANCHING[branching.ts]
        STATE_MACHINE[conversationState.ts]
        ENGINE[conversationEngine.ts]
    end

    subgraph "Dashboard Engine"
        SUMMARY[useDashboardSummary]
        LEADS_HOOK[useLeads]
        DETAIL[useLeadDetail]
        REASONING[qualificationReasoning.ts]
    end

    subgraph "Shared"
        UI[shadcn/ui Components]
        LAYOUTS[RootLayout]
        HEADER[SiteHeader]
        FOOTER[SiteFooter]
        SIDEBAR[DashboardSidebar]
        ERR_BOUNDARY[ErrorBoundary]
    end

    MAIN --> APP
    APP --> LANDING
    APP --> QUALIFY
    APP --> THANKYOU
    APP --> DASHBOARD
    DASHBOARD --> OVERVIEW
    DASHBOARD --> LEADS
    DASHBOARD --> ANALYTICS

    QUALIFY --> MACHINE
    MACHINE --> FLOWS
    MACHINE --> BRANCHING
    MACHINE --> STATE_MACHINE
    MACHINE --> ENGINE

    OVERVIEW --> SUMMARY
    OVERVIEW --> LEADS_HOOK
    LEADS --> DETAIL
    LEADS --> REASONING
    ANALYTICS --> SUMMARY

    APP --> UI
    APP --> LAYOUTS
    LAYOUTS --> HEADER
    LAYOUTS --> FOOTER
    DASHBOARD --> SIDEBAR
    APP --> ERR_BOUNDARY
```

### Frontend Layers

**1. Routing Layer** (`App.tsx`)
- React Router v6 with `BrowserRouter`
- Dashboard routes wrapped in `DashboardLayout` (sidebar + header)
- Analytics route is lazy-loaded with `React.lazy` + `Suspense` to keep recharts out of main bundle

**2. State Layer** (`useQualificationMachine`)
- Single `useReducer` hook manages all qualification state
- Actions: `SELECT_FLOW`, `ANSWER`, `NEXT`, `PREV`, `RESUME`, `SUBMIT_START`, `SUBMIT_DONE`, `SUBMIT_ERROR`, `RESET`
- Session persisted to `localStorage` with 300ms debounce
- Branching re-evaluated on every answer by rebuilding the question list

**3. Data Layer** (Dashboard hooks)
- `useDashboardSummary` — fetches aggregate stats
- `useLeads` — paginated lead list with filters and `AbortController` for cancellation
- `useLeadDetail` — full lead profile with scores, documents, activity

**4. Component Layer**
- Qualification: `WelcomeScreen`, `ConversationContainer`, `QuestionCard`, `QuestionRenderer`, `ProgressBar`, `NavigationButtons`, 10 input components
- Dashboard: `SummaryCards`, `QualificationBreakdown`, `DashboardFilters`, `LeadTable`, `LeadDrawer`, `Pagination`, `PdfViewer`, `StatsGrid`, `TrendChart`, `BucketChart`

**5. Styling Layer**
- Tailwind CSS 3 with CSS variables for theme tokens
- Monochrome palette (near-black foreground, white background) with red accent
- Inter font with optical sizing
- `prefers-reduced-motion` support disables all animations

---

## Backend Architecture

```mermaid
graph TB
    subgraph "Entry"
        INDEX[index.ts]
        APP[app.ts]
    end

    subgraph "Middleware"
        REQ_ID[requestId]
        HELMET[helmet]
        CORS[cors]
        BODY[express.json]
        LOGGER[requestLogger]
        AUTH[requireAuth]
        VALIDATE[validate]
        ERROR[errorHandler]
    end

    subgraph "Feature Modules"
        HEALTH[health.routes]
        AUTH_ROUTE[auth.routes]

        subgraph "Qualification"
            Q_ROUTES[lead.routes]
            Q_CONTROLLER[lead.controller]
            Q_SERVICE[lead.service]
            Q_QUESTIONS[questions.service]
            Q_DOC[document.service]
            Q_REPO[repositories]
        end

        subgraph "Scoring"
            S_ROUTES[scoring.routes]
            S_SERVICE[scoring.service]
            S_ENGINE[score-rules.ts]
        end

        subgraph "Dashboard"
            D_ROUTES[dashboard.routes]
            D_CONTROLLER[dashboard.controller]
            D_ANALYTICS[analytics.service]
            D_LEADS[leads.service]
            D_REPO[dashboard.repository]
        end

        subgraph "Uploads"
            U_ROUTES[uploads.routes]
            U_SERVICE[upload.service]
            U_STORAGE[disk.ts / s3.ts]
            U_TEMP[temp-store.ts]
        end
    end

    subgraph "Shared DB"
        POOL[pg.Pool]
        LEADS_REPO[leads.repository]
        SCORES_REPO[leadScores.repository]
        FOUNDER_REPO[founderProfiles.repository]
        INVESTOR_REPO[investorProfiles.repository]
        DOCS_REPO[documents.repository]
        ACTIVITY_REPO[activityLogs.repository]
        USERS_REPO[users.repository]
    end

    INDEX --> APP
    APP --> REQ_ID
    APP --> HELMET
    APP --> CORS
    APP --> BODY
    APP --> LOGGER
    APP --> AUTH
    APP --> VALIDATE
    APP --> HEALTH
    APP --> AUTH_ROUTE
    APP --> Q_ROUTES
    APP --> S_ROUTES
    APP --> D_ROUTES
    APP --> U_ROUTES
    APP --> ERROR

    Q_ROUTES --> Q_CONTROLLER
    Q_CONTROLLER --> Q_SERVICE
    Q_SERVICE --> Q_QUESTIONS
    Q_SERVICE --> Q_DOC
    Q_CONTROLLER --> Q_REPO
    Q_SERVICE --> S_ENGINE
    Q_SERVICE --> POOL

    S_ROUTES --> S_SERVICE
    S_SERVICE --> S_ENGINE
    S_SERVICE --> SCORES_REPO

    D_ROUTES --> D_CONTROLLER
    D_CONTROLLER --> D_ANALYTICS
    D_CONTROLLER --> D_LEADS
    D_LEADS --> D_REPO
    D_REPO --> POOL

    U_ROUTES --> U_SERVICE
    U_SERVICE --> U_STORAGE
    U_SERVICE --> U_TEMP
    U_SERVICE --> DOCS_REPO

    POOL --> LEADS_REPO
    POOL --> SCORES_REPO
    POOL --> FOUNDER_REPO
    POOL --> INVESTOR_REPO
    POOL --> DOCS_REPO
    POOL --> ACTIVITY_REPO
    POOL --> USERS_REPO
```

### Backend Layers

**1. Middleware Stack** (applied in order)
1. `requestId` — attaches unique UUID to every request
2. `helmet` — security headers (CSP, X-Frame-Options, etc.)
3. `cors` — configurable origin, methods, headers
4. `express.json` (1MB limit) + `express.urlencoded`
5. `requestLogger` — logs method, path, status, duration
6. Route-specific: `requireAuth` + `validate(schema)` + `asyncHandler`
7. `notFound` — 404 catch-all
8. `errorHandler` — centralized error formatting

**2. Feature Modules** (feature-first structure)
- Each feature has its own routes, controllers, services, and validation
- Shared DB repositories are used across features
- Scoring engine is standalone with pure functions

**3. Data Access Layer** (shared/repositories)
- Raw SQL via `pg` pool with parameterized queries (no ORM)
- Base repository provides `paginatedQuery`, `findOne`, `insertOne`
- Feature-specific repositories for leads, scores, profiles, documents, activity logs, users

**4. Scoring Engine**
- Pure function: `calculate(answers, type) → ScoreOutput`
- 7 founder dimensions + 6 investor dimensions
- Each dimension has an `evaluator(answer)` pure function
- Score capped at 100 via `Math.min(sum, 100)`

---

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant DB

    User->>Frontend: Select flow type
    Frontend->>Frontend: Initialize state machine
    Frontend->>Backend: POST /lead/start { type }
    Backend->>Backend: Create session
    Backend-->>Frontend: Session ID + first question

    loop Each question
        User->>Frontend: Answer question
        Frontend->>Frontend: Validate input
        Frontend->>Frontend: Store answer, re-evaluate branching
        User->>Frontend: Click "Continue"
        Frontend->>Backend: POST /lead/answer { sessionId, questionId, value }
        Backend->>Backend: Store answer in session
        Backend-->>Frontend: Next question (or complete)
        Frontend->>Frontend: Save to localStorage (debounced)
    end

    User->>Frontend: Click "Submit"
    Frontend->>Frontend: Submit start
    Frontend->>Backend: POST /lead/submit { sessionId, type, answers }
    Backend->>Backend: Apply scoring rules
    Backend->>Backend: Compute bucket
    Backend->>DB: INSERT lead, scores, profile, activity_log
    Backend-->>Frontend: { lead_id, score, bucket, dimensions }
    Frontend->>Frontend: Clear localStorage
    Frontend-->>User: ThankYou page with score

    User->>Frontend: Navigate to dashboard
    Frontend->>Backend: GET /dashboard/summary
    Backend->>DB: Aggregate queries
    Backend-->>Frontend: Summary stats
    Frontend->>Frontend: Render summary cards + bucket chart

    User->>Frontend: Filter/sort leads
    Frontend->>Backend: GET /dashboard/leads?type=&status=&page=
    Backend->>DB: Filtered query
    Backend-->>Frontend: Paginated leads
    Frontend->>Frontend: Render table

    User->>Frontend: Click lead row
    Frontend->>Backend: GET /dashboard/leads/:id
    Backend->>DB: Lead + profile + scores + docs + activity
    Backend-->>Frontend: Full lead detail
    Frontend->>Frontend: Render drawer

    User->>Frontend: Change status
    Frontend->>Backend: PATCH /dashboard/leads/:id/status { status }
    Backend->>DB: UPDATE status + INSERT activity_log
    Backend-->>Frontend: Updated lead
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **No chatbot UI** | Clean form-based flow avoids generic chatbot aesthetic and is more familiar for venture capital context |
| **No LLM dependency** | Deterministic rule-based scoring is faster, cheaper, and auditable — no API latency or cost per evaluation |
| **useReducer over Redux/Zustand** | Single-question-at-a-time flow doesn't need global state management; simple reducer is sufficient |
| **Code-split analytics** | Recharts is 420KB — lazy loading keeps main bundle under 300KB gzipped |
| **Raw SQL over ORM** | Full control over query performance, especially for dashboard aggregation queries |
| **In-memory sessions** | Qualification sessions expire after 2 hours — avoids DB writes for in-progress sessions |
| **Debounced localStorage** | 300ms debounce prevents layout jank from rapid serialization during fast answering |
| **Branching rebuilds question list** | Simple approach — rebuild filtered list on every answer rather than complex tree traversal |
| **API key over JWT** | Sufficient for internal team tool with handful of users — no token refresh flow needed |
| **CSS variables for theme** | Allows runtime theme switching (future dark mode) without rebuilding CSS |
