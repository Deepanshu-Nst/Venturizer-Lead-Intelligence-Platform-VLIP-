# Venturizer Lead Intelligence Platform (VLIP)

Automated lead qualification system for venture capital. Replaces manual review of 500+ monthly inbound founder and investor enquiries with a conversational qualification flow, rule-based scoring engine, and comprehensive ERP dashboard.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS 3, shadcn/ui, Recharts |
| Backend | Node.js, Express 4, TypeScript |
| Database | PostgreSQL 16+ |
| File Storage | Local disk or AWS S3 (configurable) |
| Hosting | Vercel (frontend), Railway (backend) |

## Features

### Founder Qualification Flow — 18 questions across 7 stages
Personal → Background → Startup → Product → Traction → Team → Fundraising

### Investor Qualification Flow — 17 questions across 4 stages
Personal → Profile → Strategy → Timeline

### Real-Time Validation
Email/URL/phone format checks, length constraints, range limits, required-field enforcement — all client-side before advancing.

### File Uploads
PDF-only upload (10MB max) with triple validation: MIME check, magic bytes verification, and file size enforcement.

### Qualification Scoring
Rule-based engine computing 0–100 scores across 7 founder dimensions or 6 investor dimensions. Buckets: Hot (80–100), Good (60–79), Maybe (40–59), Low (0–39).

### ERP Dashboard
- Summary cards with trend indicators
- Filterable, sortable, paginated lead table
- Lead detail drawer with score breakdown
- Full lead profile with documents, activity log, notes
- Status workflow (new → reviewing → qualified → contacted → rejected → converted)
- Analytics page with trend and bucket charts

### Mobile Responsive
Full responsive design — sidebar collapses on mobile, cards stack vertically, touch-friendly inputs.

## Project Structure

```
venturizer-lead-platform/
├── frontend/                    # React + Vite
│   ├── src/
│   │   ├── features/
│   │   │   ├── landing/         # Landing page
│   │   │   ├── qualification/   # Founder/investor flows
│   │   │   │   ├── flows/       # Question definitions + branching
│   │   │   │   ├── engine/      # State machine + question engine
│   │   │   │   ├── hooks/       # useQualificationMachine
│   │   │   │   ├── components/  # UI components + 10 input types
│   │   │   │   └── validation/  # Per-field validation rules
│   │   │   └── dashboard/       # ERP dashboard
│   │   │       ├── components/  # SummaryCards, LeadTable, Charts, etc.
│   │   │       ├── hooks/       # Data fetching hooks
│   │   │       └── services/    # API client
│   │   ├── shared/              # Layouts, UI primitives, utils
│   │   ├── App.tsx              # Route definitions
│   │   └── main.tsx             # Entry point
│   ├── tailwind.config.ts
│   └── vite.config.ts
│
├── backend/                     # Node.js + Express
│   ├── src/
│   │   ├── features/
│   │   │   ├── lead/            # Qualification flow (new)
│   │   │   ├── qualification/   # Qualification flow (original)
│   │   │   ├── scoring/         # Scoring engine
│   │   │   ├── dashboard/       # Dashboard APIs
│   │   │   ├── uploads/         # File upload handling
│   │   │   ├── auth/            # API key auth
│   │   │   ├── leads/           # Lead CRUD
│   │   │   └── health/          # Liveness/readiness probes
│   │   ├── shared/
│   │   │   ├── db/              # Database pool + repositories
│   │   │   ├── middleware/      # Auth, validation, error handling
│   │   │   └── types/           # Shared type definitions
│   │   ├── migrations/          # SQL schema migrations
│   │   └── index.ts             # Entry point
│   └── .env.example
│
├── docs/                        # Documentation
│   ├── DATABASE_SCHEMA.md
│   ├── CONVERSATION_FLOW.md
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── DEMO_SCRIPT.md
│
└── README.md                    # This file
```

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- npm

### Clone & Install
```bash
git clone <repo-url> venturizer-lead-platform
cd venturizer-lead-platform

# Backend
cd backend
cp .env.example .env
npm install
npm run migrate
npm run dev

# Frontend (in a new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Environment Variables

#### Backend (`.env`)
```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/venturizer
DATABASE_SSL=false
CORS_ORIGIN=http://localhost:5173
API_KEY=your-api-key-min-8-chars
LOG_LEVEL=info
STORAGE_DRIVER=disk
UPLOAD_PATH=./uploads
```

#### Frontend (`.env`)
```
VITE_API_URL=/api/v1
```

### Scripts

| Command | Directory | Description |
|---|---|---|
| `npm run dev` | both | Start development servers with hot reload |
| `npm run build` | both | TypeScript compile + Vite build (frontend) |
| `npm run test` | backend | Run test suite (97 tests) |
| `npm run lint` | frontend | Run ESLint |
| `npm run migrate` | backend | Run database migrations |

### Run Tests
```bash
cd backend && npm test
# 97 tests pass: 22 scoring + 35 lead + 23 dashboard + 17 upload
```

## Scoring Rules

### Founder (max 100 across 7 dimensions)
| Dimension | Weight | Key Signals |
|---|---|---|
| Founder Experience | 15 | Prior startup, industry years |
| Industry Knowledge | 10 | Problem clarity, customer clarity |
| MVP Readiness | 20 | Idea → Prototype → MVP → Launched → Revenue |
| Traction | 20 | Users, revenue, growth rate |
| Team Strength | 15 | Team size, co-founder |
| Validation | 10 | Revenue + user signals |
| Funding Readiness | 10 | Commitment, funding ask |

### Investor (max 100 across 6 dimensions)
| Dimension | Weight | Key Signals |
|---|---|---|
| Active Investor | 20 | Actively investing, looking for deals |
| Cheque Size | 20 | Max cheque range |
| Deployment Timeline | 15 | Speed of capital deployment |
| Portfolio Quality | 15 | Portfolio company count |
| Sector Match | 15 | Number of focus sectors |
| Value Add | 15 | Value-add description richness |

### Buckets
| Bucket | Score | Action |
|---|---|---|
| Hot | 80–100 | Schedule intro call within 24h |
| Good | 60–79 | Nurture with weekly check-ins |
| Maybe | 40–59 | Revisit in 30 days |
| Low | 0–39 | Low priority — monitor |

## API Endpoints

Base URL: `/api/v1`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/lead/start` | — | Start qualification flow |
| POST | `/lead/answer` | — | Submit single answer |
| POST | `/lead/submit` | — | Finalize + persist lead |
| GET | `/lead/:id` | — | Get lead by ID |
| POST | `/lead/upload` | — | Upload PDF file |
| GET | `/dashboard/summary` | API key | Dashboard stats |
| GET | `/dashboard/leads` | API key | List leads (paginated) |
| GET | `/dashboard/leads/:id` | API key | Lead detail |
| PATCH | `/dashboard/leads/:id/status` | API key | Update status |
| POST | `/auth/login` | — | Authenticate |

Full API documentation at [`docs/API.md`](docs/API.md).

## Design Decisions

- **No chatbot UI**: Clean form-based flow with one question at a time — avoids generic chatbot aesthetic
- **No LLM dependency**: All scoring is deterministic rule-based — no API calls, no latency, no cost
- **useReducer state machine**: Local state management without Redux/Zustand — sufficient for single-question-at-a-time flow
- **Code-split analytics**: Recharts (420KB) lazy-loaded only on Analytics page
- **Local-first persistence**: Session saved to localStorage with 300ms debounce — survives page refresh
- **Accessibility**: `aria-hidden` on decorative icons, `aria-label` on interactive elements, `role="alert"` on errors, `prefers-reduced-motion` support

## License

Internal — Venturizer.
