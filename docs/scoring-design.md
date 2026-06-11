# Qualification Scoring Design

## 1. Philosophy

Rule-based scoring engine with deterministic weights. No ML, no AI, no complex models. Each dimension has clear, auditable calculation rules. Perfect for a v1 MVP that needs to be explainable and debuggable.

## 2. Founder Score (100 points)

| Dimension | Weight | Calculation | Rationale |
|---|---|---|---|
| Founder Experience | 15 | Previous startup (8) + industry exp capped at 7 | Signals founder grit and domain knowledge |
| Industry Knowledge | 10 | Problem statement length / 20 (max 5) + customer known (5) | Can they articulate the problem clearly? |
| MVP Readiness | 20 | Idea=0, Prototype=5, MVP=12, Launched=18, Revenue=20 | How far along is the product? |
| Traction | 20 | Users (7) + Revenue (8) + Growth (5) | Hard evidence of market pull |
| Team Strength | 15 | Size >1 (5) + co-founder (10) | Teams beat solo founders |
| Validation | 10 | Revenue exists (5) + user validation (5) | External validation signals |
| Funding Readiness | 10 | Full-time (5) + realistic ask ≤$5M (5) | Are they ready to close? |

### Founder — Dimension Detail

#### Founder Experience (15 pts)
- Previous startup: yes = 8, no = 2
- Industry experience: min(years, 7)

#### Industry Knowledge (10 pts)
- Problem clarity: min(floor(problem.length / 20), 5)
- Target customer known: customer.length > 0 ? 5 : 0

#### MVP Readiness (20 pts)
- Idea: 0
- Prototype: 5
- MVP: 12
- Launched: 18
- Revenue: 20

#### Traction (20 pts)
- Users: >100 = 7, >10 = 4, >0 = 2, none = 0
- Revenue: >$10k = 8, >$1k = 5, >0 = 2, none = 0
- Growth: >20% = 5, >10% = 3, >0 = 1, none = 0

#### Team Strength (15 pts)
- Team size: >1 = 5, else 2
- Co-founder: yes = 10, no = 0

#### Validation (10 pts)
- Revenue exists: revenue > 0 ? 5 : 0
- User validation: >50 = 5, >10 = 3, >0 = 1, none = 0

#### Funding Readiness (10 pts)
- Commitment: full-time = 5, part-time = 1
- Ask: $1–$5M = 5, >$5M = 3, $0 = 0

## 3. Investor Score (100 points)

| Dimension | Weight | Calculation |
|---|---|---|
| Active Investor | 20 | Actively investing (10) + looking for deals (10) |
| Cheque Size | 20 | ≥$500k = 20, ≥$100k = 15, >$0 = 5 |
| Deployment Timeline | 15 | <3mo = 15, 3-6mo = 10, 6-12mo = 5, 12+ = 0 |
| Portfolio Quality | 15 | ≥5 companies = 15, 2-4 = 10, 1 = 5, 0 = 0 |
| Sector Match | 15 | ≥3 sectors = 15, 2 = 10, 1 = 5, none = 0 |
| Value Add | 15 | Description >100 chars = 15, >50 = 10, >0 = 5, empty = 0 |

### Investor — Dimension Detail

#### Active Investor (20 pts)
- Actively investing: yes = 10, not-yet = 2, paused = 2
- Looking for deals: true = 10, false = 0

#### Cheque Size (20 pts)
- Max cheque ≥$500k: 20
- Max cheque ≥$100k: 15
- Max cheque > $0: 5
- No cheque: 0

#### Deployment Timeline (15 pts)
- 0–3 months: 15
- 3–6 months: 10
- 6–12 months: 5
- 12+ months: 0

#### Portfolio Quality (15 pts)
- 5+ companies: 15
- 2–4 companies: 10
- 1 company: 5
- 0 companies: 0

#### Sector Match (15 pts)
- 3+ sectors selected: 15
- 2 sectors: 10
- 1 sector: 5
- 0 sectors: 0

#### Value Add (15 pts)
- Description >100 characters: 15
- >50 characters: 10
- >0 characters: 5
- Empty: 0

## 4. Buckets

| Range | Bucket | Label | Action |
|---|---|---|---|
| 80–100 | `hot` | Hot 🔥 | Immediate personal outreach |
| 60–79 | `good` | Good ✅ | Nurture sequence (email drip) |
| 40–59 | `maybe` | Maybe ⏳ | Monitor, re-engage in 30 days |
| 0–39 | `low` | Low 📉 | Long-term nurture / automated digest |

## 5. Storage

Each dimension's score is stored as a separate row in `qualification_scores`:

```json
{
  "dimension": "founder_experience",
  "score": 13,
  "weight": 15,
  "rationale": "Previous startup: yes (8), Industry experience: 5 years (5)"
}
```

This enables:
- Per-dimension score visualization in the dashboard
- Audit trail for qualification decisions
- Recalculation when weights change

## 6. Recalculation

The scoring engine is a pure function:

```
calculateScore(type: LeadType, answers: Record<string, unknown>)
  → { total: number, dimensions: ScoreDimension[] }
```

This means scores can be recalculated at any time without side effects. When scoring weights change, a backfill script can recalculate all historical scores.
