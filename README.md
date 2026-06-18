# Venturizer Lead Intelligence Platform (VLIP)

An AI-assisted venture qualification operating system that automates the review of founder and investor enquiries through conversational qualification, hybrid scoring, and operator-focused analytics.

VLIP replaces manual lead screening with structured conversations, real-time validation, automated scoring, and a centralized ERP dashboard, enabling the Venturizer team to identify high-signal opportunities faster and more consistently.

---

https://venturizer-lead-intelligence-platfo.vercel.app/

---

# Problem Statement

Venturizer receives 500+ organic inbound enquiries every month from founders and investors.

Manual review creates operational bottlenecks:

* Slow response times
* Inconsistent qualification
* Difficult prioritization
* Limited visibility into pipeline health

VLIP solves this by providing:

* Conversational qualification flows
* Real-time validation
* AI-assisted lead evaluation
* Automated scoring
* Operator dashboard for review and decision-making

---

# Key Features

## Founder Qualification Flow

18-question conversational qualification covering:

* Personal Information
* Founder Background
* Startup Information
* Product & MVP
* Traction
* Team
* Fundraising

### Collected Data

* Personal details
* Contact information
* Industry
* Problem statement
* Target customer
* MVP status
* Revenue
* Growth rate
* Team composition
* Funding ask
* Validation evidence

---

## Investor Qualification Flow

17-question conversational qualification covering:

* Personal Information
* Investor Profile
* Investment Strategy
* Portfolio
* Deployment Timeline

### Collected Data

* Investment thesis
* Stage focus
* Cheque size
* Portfolio size
* Sector preferences
* Support model
* Deployment timeline

---

## Conversational Qualification Engine

Rather than presenting a long form, VLIP guides users through a structured conversation.

Features:

* One question at a time
* Dynamic branching
* Session persistence
* Progress tracking
* Mobile-first experience

---

## Real-Time Validation

Validation occurs before users can continue.

Supported validations:

* Email validation
* URL validation
* Phone validation
* Numeric range validation
* Required field validation
* Length constraints
* PDF upload validation

---

## Secure Document Uploads

Supports:

* PDF only
* 10MB maximum size

Validation includes:

* MIME type validation
* Magic byte verification
* File size enforcement

Storage options:

* Local disk
* AWS S3 compatible storage

---

# Hybrid Qualification Engine

VLIP uses a two-layer scoring architecture.

## Layer 1 — Quantitative Rule Engine (60%)

Deterministic scoring based on measurable evidence.

### Founder Signals

* Revenue
* Users
* Growth rate
* Team size
* Co-founder presence
* Industry experience
* Previous startup experience
* MVP readiness
* Funding readiness

### Investor Signals

* Active investing status
* Portfolio quality
* Cheque size
* Sector focus
* Deployment timeline
* Value-add potential

---

## Layer 2 — AI Venture Analyst (40%)

Powered by Groq + Llama 3.3 70B.

The AI analyst reviews qualitative answers and generates:

### Founder Analysis

* Problem Clarity
* Market Understanding
* Differentiation
* Founder Conviction
* Execution Confidence
* Venture Potential

### Investor Analysis

* Thesis Clarity
* Sector Expertise
* Strategic Fit
* Deployment Capacity
* Network Quality
* Value Add Potential

The AI layer produces:

* Executive Summary
* Key Signals
* Strengths
* Risks
* Recommendation

This allows the platform to capture qualitative venture signals while still prioritizing hard business evidence.

---

# Qualification Buckets

| Score  | Bucket       | Action                       |
| ------ | ------------ | ---------------------------- |
| 80–100 | Strong Fit   | Immediate outreach + program |
| 60–79  | Qualified    | Standard follow-up           |
| 40–59  | Review       | Request clarification        |
| 0–39   | Low Priority | Polite rejection             |

---

# ERP Dashboard

Designed for internal operator workflows.

## Operations Overview

* Total leads
* Founder vs investor split
* Score distribution
* Qualification trends
* Queue health

---

## Lead Review Queue

Features:

* Filtering
* Sorting
* Search
* Status management
* Score-based prioritization

Statuses:

* New
* Reviewing
* Qualified
* Contacted
* Rejected
* Converted

---

## Lead Detail View

Includes:

* Full applicant profile
* Qualification score
* AI analysis
* Score breakdown
* Activity history
* Status management
* Recommendation engine

---

## Analytics Dashboard

Provides:

* Inbound volume trends
* Qualification distribution
* Conversion funnel
* Persona breakdown
* Review queue metrics
* Performance KPIs

---

# Tech Stack

| Layer            | Technology                  |
| ---------------- | --------------------------- |
| Frontend         | React 18                    |
| Language         | TypeScript                  |
| Build Tool       | Vite                        |
| Styling          | Tailwind CSS                |
| UI Components    | shadcn/ui                   |
| Animations       | Framer Motion               |
| Smooth Scrolling | Lenis                       |
| Charts           | Recharts                    |
| Backend          | Node.js                     |
| Framework        | Express                     |
| Database         | PostgreSQL                  |
| Database Hosting | Neon                        |
| AI               | Groq + Llama 3.3 70B        |
| Frontend Hosting | Vercel                      |
| Backend Hosting  | Render / Railway Compatible |

---

# System Architecture

```text
Website Visitor
        │
        ▼
Qualification Chatbot
        │
        ▼
Validation Engine
        │
        ▼
Rule-Based Scoring
        │
        ▼
AI Venture Analyst
        │
        ▼
PostgreSQL Database
        │
        ▼
Operator Dashboard
```

---

# Project Structure

```text
venturizer-lead-platform/

frontend/
├── landing
├── chatbot
├── qualification
├── dashboard
├── analytics
└── shared

backend/
├── lead
├── scoring
├── ai-analyst
├── dashboard
├── uploads
├── auth
└── health

database/
├── migrations
└── schema
```

---

# Environment Variables

## Backend

```env
NODE_ENV=production
PORT=3001

DATABASE_URL=
DATABASE_SSL=true

API_KEY=

CORS_ORIGIN=

STORAGE_DRIVER=disk
UPLOAD_PATH=./uploads

GROQ_API_KEY=
```

## Frontend

```env
VITE_API_URL=
```

---

# Local Setup

## Clone Repository

```bash
git clone <repository-url>
cd venturizer-lead-platform
```

## Backend

```bash
cd backend

npm install

npm run migrate

npm run dev
```

Backend runs on:

```text
http://localhost:3001
```

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| npm run dev     | Start development server |
| npm run build   | Production build         |
| npm run lint    | Lint project             |
| npm run migrate | Run database migrations  |
| npm run test    | Execute test suite       |

---

# API Overview

Base URL:

```text
/api/v1
```

## Qualification

```http
POST /lead/start
POST /lead/answer
POST /lead/submit
GET  /lead/:id
```

## Uploads

```http
POST /lead/upload
```

## Dashboard

```http
GET    /dashboard/summary
GET    /dashboard/leads
GET    /dashboard/leads/:id
PATCH  /dashboard/leads/:id/status
```

## Authentication

```http
POST /auth/login
```

---

# Design Decisions

## Why Conversational Qualification?

Traditional forms create abandonment and poor-quality responses.

A guided conversation:

* Improves completion rates
* Collects richer context
* Feels more natural
* Enables dynamic branching

---

## Why Hybrid Scoring?

Pure AI systems can be inconsistent.

Pure rule systems miss qualitative insight.

The hybrid approach provides:

* Explainability
* Auditability
* Consistency
* Venture-style qualitative evaluation

---

## Why an ERP Dashboard?

Qualification is only useful if operators can act on it.

The dashboard enables:

* Review
* Filtering
* Prioritization
* Analytics
* Decision support

---

# Assignment Requirements Coverage

✅ Founder qualification flow

✅ Investor qualification flow

✅ 16–20 question conversations

✅ Real-time validation

✅ PostgreSQL persistence

✅ Qualification scoring (0–100)

✅ Dashboard for lead review

✅ Analytics dashboard

✅ Mobile responsive experience

✅ API documentation

✅ Database schema

✅ Deployment

✅ AI-assisted qualification layer

---

# Business Impact

VLIP transforms lead qualification from a manual review process into a scalable venture operations workflow.

Expected benefits:

* Faster lead response times
* Consistent qualification criteria
* Reduced operator workload
* Better prioritization of high-signal opportunities
* Improved visibility into inbound pipeline health

---

# Future Improvements (V2)

* Automated email outreach
* CRM integrations (HubSpot, Salesforce)
* Calendar scheduling
* Multi-operator workflows
* Venture matching engine
* Founder-investor recommendation system
* RAG-based pitch deck analysis
* Advanced cohort analytics

---

# Deliverables

Included:

✅ GitHub Repository

✅ README Documentation

✅ Database Schema

✅ API Documentation

✅ Conversation Flow

✅ Qualification Engine

✅ ERP Dashboard

✅ Analytics Dashboard

✅ Deployment

✅ Demo Presentation

---

# License

Built as part of the Venturizer Full-Stack Engineering Assignment.
