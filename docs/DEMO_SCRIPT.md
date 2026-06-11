# Demo Script — Venturizer Lead Intelligence Platform

**Duration:** ~15 minutes

---

## Setup (2 min)

1. Ensure both backend and frontend are running:
   ```bash
   # Terminal 1
   cd backend && npm run dev

   # Terminal 2
   cd frontend && npm run dev
   ```

2. Open browser to `http://localhost:5173`
3. Clear localStorage: DevTools → Application → Local Storage → Clear All
4. Have a sample PDF ready (any PDF under 10MB)

---

## 1. Landing Page — Overview (1 min)

**Show:** `http://localhost:5173/`

**Narrator:**
> "This is Venturizer's Lead Intelligence Platform — a conversational qualification system that automates our 500+ monthly inbound enquiries. Two distinct paths: one for founders seeking funding, one for investors looking to deploy capital."

**Highlight:**
- Clean, minimal Sequoia-inspired aesthetic
- Two elevated cards: "For Founders" and "For Investors"
- "Resume saved session" link (hidden when no session exists)
- Header navigation with quick-start links

---

## 2. Founder Qualification Flow (4 min)

**Show:** Click "For Founders"

**Narrator:**
> "Let's walk through the founder qualification flow — 18 questions across 7 stages. Each stage represents a key evaluation dimension."

### Stage by stage:

**Personal (Q1–4):**
- Enter: `Jane Doe`, `jane@example.com`, `+1 555-0000`, `https://linkedin.com/in/janedoe`
- **Highlight:** URL validation catches non-LinkedIn URLs in real time
- **Show:** Enter `https://google.com` → see red validation error → correct

**Background (Q5–7):**
- "Have you started a company before?" → **Yes**
- "Years of experience?" → **7**
- "Full-time or part-time?" → **Full-time**
- **Highlight:** Number input with min/max bounds, clean select dropdown

**Startup (Q8–11):**
- Startup name → `Acme AI`
- Industry → **SaaS**
- Problem statement → Enter 50+ characters describing the problem
- Target customer → `SMBs with 10-50 employees`
- **Highlight:** Textarea grows naturally, bottom-border styling throughout

**Product (Q12):**
- "Current MVP status?" → **Launched**
- **Highlight:** Single focused question per screen — no scroll, no distraction

**Traction (Q13–15):**
- Active users → `500`
- Monthly revenue → `15000`
- Growth rate → `15`
- **Highlight:** NumberInput hides browser spinners for clean look

**Team (Q16–17):**
- Team size → `2`
- Co-founder → **No**
- **Highlight:** BooleanInput renders as two rounded-xl radio cards

**Fundraising (Q18–19):**
- Funding ask → `500000`
- "Upload your pitch deck" → **Show drag-drop zone, select a PDF, watch progress bar**
- **Highlight:** File upload validates PDF-only + 10MB limit; shows upload progress

**Submit:**
- Click "Submit"
- **Highlight:** Spinner animation on button, transitions to thank you page
- **Show:** ThankYou page with score and "48-hour review" message

---

## 3. Investor Qualification Flow (2 min)

**Narrator:**
> "Now the investor side — 17 questions across 4 stages. Same clean UX, but different question set."

**Show:** Click "For Investors"

**Walk through quickly:**
- Personal (same 4 identity questions)
- Profile: Angel investor, seed stage, 3 sectors (SaaS, AI/ML, Fintech)
- Strategy: $100k–$500k cheques, 3-6 month deployment, follow-on strategy text
- Timeline: 2-4 week decisions, actively investing → **Yes** → shows "looking for deals"

**Highlight branching rule:**
- **Show:** Start new investor flow, answer "Are you actively investing?" → **Not yet**
- **Show:** "Looking for deals" question is **skipped** automatically
- **Narrator:** "Branching rules dynamically hide irrelevant questions. If an investor isn't active, asking about deal flow is pointless."

---

## 4. ERP Dashboard (5 min)

**Narrator:**
> "Now the dashboard — the operational hub for the Venturizer team. Let's look at what landed from our submissions."

**Show:** Navigate to `http://localhost:5173/dashboard`

### Summary Cards
> "Four key metrics at a glance: total leads, founder/investor breakdown, average score, and hot lead count. Trend arrows show week-over-week movement."

### Qualification Breakdown
> "Bucket distribution — Hot, Good, Maybe, Low — with percentage bars. Our sample founder scored 82, putting them in the Hot bucket."

### Filters
> "Filters sync to URL parameters — shareable and refresh-safe. Filter by type, status, bucket, or search by name/email."

**Show:**
- Filter by "Founder" → table updates
- Type "jane" in search → narrows to our test lead
- Sort by score descending → column arrow indicates sort direction

### Lead Table
> "Paginated table with sortable columns. Click any row to open the detail drawer."

### Lead Drawer
> "Quick-view drawer with score bars, qualification summary, recent activity, and status controls."

### Lead Detail Page
**Show:** Click into a lead → `http://localhost:5173/dashboard/leads/:id`

> "Full lead profile with everything the team needs to make a qualification decision."

**Scroll through sections:**
1. **Profile** — Contact info + startup/investor details
2. **Qualification Summary** — Strengths (green), Concerns (amber), Recommendation
3. **Score Section** — Dimension breakdown with progress bars and rationale text
4. **Status Workflow** — 5 status buttons with PATCH to backend
5. **Documents** — PDF viewer (inline preview) + download
6. **Activity Timeline** — Audit trail with timestamps
7. **Notes** — Internal notes textarea

**Show status change:**
- Click "Qualified" → status updates instantly, activity log entry created
- **Narrator:** "Each status transition is logged to the activity trail with full audit history."

### Analytics Page
**Show:** Navigate to `http://localhost:5173/dashboard/analytics`

> "Analytics page — lazy-loaded to keep the main bundle small."

**Highlight:**
- StatsGrid: 8 metric cards showing pipeline volume, conversion, engagement
- TrendChart: Weekly lead volume line chart (Recharts)
- BucketChart: Qualification distribution bar chart
- **Narrator:** "This page code-splits Recharts — 420KB loaded only when you visit analytics."

---

## 5. Architecture & Design (1 min)

**Narrator:**
> "Quick architecture summary:"
- Frontend: React 18 + Vite + Tailwind on Vercel
- Backend: Node/Express + TypeScript on Railway
- Database: PostgreSQL 16
- File storage: Disk (dev) or S3 (prod)
- Scoring: Deterministic rule-based engine — no LLM calls
- 97 automated tests covering scoring, lead flow, dashboard, uploads

---

## 6. Q&A (Remaining time)

**Anticipated questions:**

**Q: "Why no chatbot UI?"**
> "We wanted to avoid generic chatbot aesthetic. This is a qualification tool for venture capital, not a customer support widget. The form-based approach with one question at a time feels more deliberate and professional."

**Q: "How are scores calculated?"**
> "Pure deterministic rules. 7 dimensions for founders, 6 for investors. Each dimension has a weighted evaluator function. Total capped at 100. No AI, no API calls — fast and auditable."

**Q: "What happens to in-progress sessions?"**
> "Saved to localStorage with 300ms debounce. Survives page refresh, browser crash, or accidental close. Cleared on successful submission."

**Q: "Can we add more questions?"**
> "Yes — add to the flow definition array, add the DB column if needed, add a scoring rule. The architecture is designed for extension."

---

## Checklist Before Demo

- [ ] Backend running on `:3001`
- [ ] Frontend running on `:5173`
- [ ] Database migrated with test data
- [ ] Sample PDF file ready (under 10MB)
- [ ] Browser console open (show no errors)
- [ ] localStorage cleared for clean start
- [ ] Network tab open (show API calls on submit)
- [ ] Mobile viewport toggle ready in DevTools
