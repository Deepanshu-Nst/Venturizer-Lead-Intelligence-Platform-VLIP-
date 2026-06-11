# Product Requirements Document — VLIP

## 1. Purpose

Venturizer receives 500+ inbound founder and investor enquiries monthly. Current process is manual email triage. VLIP automates lead qualification through a conversational interface and provides an ERP dashboard for internal teams.

## 2. Target Users

| Persona | Description | Volume |
|---|---|---|
| Founder | Seeking capital or partnership | ~300/mo |
| Investor | Seeking deal flow | ~200/mo |
| Venturizer Team | Scoring, filtering, outreach | ~5 internal |

## 3. Functional Requirements

### P0 — Must Have

| ID | Feature | Detail |
|---|---|---|
| F1 | Conversational qualification | No LLM — deterministic state machine |
| F2 | Founder flow | 18 questions across 7 stages |
| F3 | Investor flow | 17 questions across 5 stages |
| F4 | Real-time validation | Per-field validation on input |
| F5 | PDF upload | Pitch deck (founders), investment thesis (investors) |
| F6 | Scoring engine | Rule-based, 0-100, assigns bucket |
| F7 | PostgreSQL persistence | All leads, profiles, scores, documents |
| F8 | ERP dashboard | Overview stats, lead table, detail drawer |
| F9 | Lead filtering | By type, score range, bucket, date |
| F10 | Mobile responsive | Tailwind breakpoints, mobile-first |

### P1 — Should Have

| ID | Feature | Detail |
|---|---|---|
| F11 | Analytics cards | Total leads, founders, investors, hot leads, conversion |
| F12 | Accessibility | WCAG 2.1 AA, semantic HTML, aria labels |

### P2 — Future

| ID | Feature |
|---|---|
| F13 | Email notification on new lead |
| F14 | CSV export of lead data |
| F15 | Role-based access control |
| F16 | Groq Llama 3.3 semantic summarization |

## 4. Non-Functional Requirements

- < 2s page load on 3G
- 99.9% uptime via Vercel + Railway SLAs
- Zero `any` types in TypeScript
- No mock data in production paths
- No LLM/AI dependencies in v1
- Mobile-first responsive design

## 5. UI/UX Principles

- Aesthetic: Sequoia Capital, Greylock, Pillar VC — minimal, high-contrast, generous whitespace
- Brand colors: `#24479B` primary, `#F04B4B` accent
- Not a generic chatbot — conversational form (Typeform-like)
- One question per screen, progress indicator
- Clear exit and back navigation

## 6. Constraints

- No external AI APIs
- No unnecessary dependencies
- TypeScript strict mode throughout
- Feature-based folder organization
