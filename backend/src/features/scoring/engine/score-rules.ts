import type { ScoreRule, ScoreResult } from "./score-types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function str(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function num(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

/** Logarithmic score: returns 0→max based on value's magnitude.
 *  Half of maxScore is reached when value reaches sqrt(maxVal).
 *  Near-max is reached at maxVal/10. Full max at maxVal. */
function logScore(value: number, maxVal: number, maxScore: number): number {
  if (value <= 0) return 0;
  const ratio = Math.log10(value + 1) / Math.log10(maxVal + 1);
  return Math.min(Math.max(ratio, 0), 1) * maxScore;
}

/** Estimates whether a problem statement contains domain-specific language. */
function hasDomainTerms(text: string): boolean {
  const terms = [
    "enterprise", "b2b", "b2c", "saas", "api", "platform", "pipeline",
    "workflow", "infrastructure", "compliance", "latency", "throughput",
    "automation", "integration", "scal", "migrat", "deploy", "container",
    "microservice", "ml", "ai", "model", "algorithm", "neural",
    "regression", "churn", "lifetime value", "ltv", "cac", "cohort",
    "unit economics", "margins", "revenue", "arr", "mrr", "gmv",
    "manufacturing", "supply chain", "logistics", "inventory",
    "clinical", "patient", "diagnostic", "regulatory", "fda",
    "fintech", "payments", "underwriting", "risk", "compliance",
    "protocol", "layer", "consensus", "validator", "sequencer",
  ];
  const lower = text.toLowerCase();
  return terms.some((t) => lower.includes(t));
}

/** Counts how many non-empty answer fields the user filled. */
function nonEmptyCount(answers: Record<string, unknown>): number {
  let count = 0;
  for (const v of Object.values(answers)) {
    if (v !== undefined && v !== null && v !== "") count++;
    else if (Array.isArray(v) && v.length > 0) count++;
  }
  return count;
}

/** Average character length of all text-type answers. */
function avgTextLength(answers: Record<string, unknown>): number {
  let total = 0;
  let count = 0;
  for (const v of Object.values(answers)) {
    if (typeof v === "string" && v.length > 0) {
      total += v.length;
      count++;
    }
  }
  return count > 0 ? total / count : 0;
}

// ---------------------------------------------------------------------------
// Experience (10) — previous startup + industry experience
// ---------------------------------------------------------------------------

const experience: ScoreRule = {
  dimension: "experience",
  weight: 10,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const prevStartup = answers.prev_startup === "yes" ? 4 : 0;
    const years = Math.max(num(answers.industry_experience), 0);

    // Logarithmic: 0→0, 2→2, 5→4, 10→5, 15→6, 20→6 (capped)
    const industryScore = logScore(years, 15, 6);

    const score = Math.min(prevStartup + industryScore, 10);

    return {
      score,
      maxScore: 10,
      rationale:
        `Previous startup: ${str(answers.prev_startup)} (${prevStartup}/4), ` +
        `Industry experience: ${years}y (${industryScore.toFixed(1)}/6)`,
    };
  },
};

// ---------------------------------------------------------------------------
// Founder-Market Fit (10) — alignment between founder and problem space
// ---------------------------------------------------------------------------

const founderMarketFit: ScoreRule = {
  dimension: "founder_market_fit",
  weight: 10,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const years = num(answers.industry_experience);
    const problem = str(answers.problem_statement);
    const target = str(answers.target_customer);

    // Problem depth (0–3)
    const problemDepth =
      problem.length >= 300 ? 3 : problem.length >= 150 ? 2 : problem.length >= 50 ? 1 : 0;

    // Target customer specificity (0–2)
    const targetScore = target.length >= 80 ? 2 : target.length >= 20 ? 1 : 0;

    // Domain language detection (0–3): require substance, not just a keyword
    const domainScore = hasDomainTerms(problem) && problem.length >= 80 ? 3 :
      hasDomainTerms(problem) ? 1 : problem.length > 100 ? 1 : 0;

    // Experience-to-problem alignment (0–2): founder with domain experience
    // should demonstrate deeper problem understanding
    const alignment =
      years >= 3 && problemDepth >= 2 ? 2 :
      years >= 3 && problemDepth >= 1 ? 1 :
      years >= 1 && problemDepth >= 2 ? 2 :
      years >= 1 && problemDepth >= 1 ? 1 : 0;

    const score = Math.min(problemDepth + targetScore + domainScore + alignment, 10);

    return {
      score,
      maxScore: 10,
      rationale:
        `Problem depth: ${problem.length}c (${problemDepth}/3), ` +
        `Target specificity: ${target.length}c (${targetScore}/2), ` +
        `Domain language: ${hasDomainTerms(problem) ? "detected" : "not detected"} (${domainScore}/3), ` +
        `Experience alignment: ${years}y experience, ${problemDepth}/3 depth (${alignment}/2)`,
    };
  },
};

// ---------------------------------------------------------------------------
// Problem & Market (15) — clarity + market potential
// ---------------------------------------------------------------------------

const problemMarket: ScoreRule = {
  dimension: "problem_market",
  weight: 15,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const problem = str(answers.problem_statement);
    const target = str(answers.target_customer);
    const industry = str(answers.industry);

    // Problem clarity (0–6) — requires real substance
    const clarity =
      problem.length >= 500 ? 6 :
      problem.length >= 300 ? 4 :
      problem.length >= 150 ? 2 :
      problem.length >= 50 ? 1 : 0;

    // Market understanding via target customer (0–5)
    const marketUnderstanding =
      target.length >= 200 ? 5 :
      target.length >= 120 ? 4 :
      target.length >= 70 ? 3 :
      target.length >= 30 ? 2 :
      target.length > 0 ? 1 : 0;

    // Industry signal (0–4): specific industries indicate thoughtfulness
    const knownIndustries = [
      "saas", "fintech", "health", "climate", "ai-ml", "ecommerce",
      "edtech", "biotech", "cleantech", "proptech", "hrtech",
      "legaltech", "cybersecurity", "gaming", "marketplace",
      "logistics", "manufacturing", "energy",
    ];
    const industryScore = knownIndustries.includes(industry.toLowerCase()) ? 4 :
      industry.length > 0 ? 2 : 0;

    const score = Math.min(clarity + marketUnderstanding + industryScore, 15);

    return {
      score,
      maxScore: 15,
      rationale:
        `Problem clarity: ${problem.length}c (${clarity}/6), ` +
        `Market understanding: ${target.length}c (${marketUnderstanding}/5), ` +
        `Industry: ${industry || "none"} (${industryScore}/4)`,
    };
  },
};

// ---------------------------------------------------------------------------
// MVP (10) — product readiness
// ---------------------------------------------------------------------------

const mvpReadiness: ScoreRule = {
  dimension: "mvp_readiness",
  weight: 10,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const mvpScores: Record<string, number> = {
      idea: 0,
      prototype: 3,
      beta: 5,
      mvp: 7,
      launched: 9,
      revenue: 10,
    };
    const status = str(answers.mvp_status);
    const score = mvpScores[status] ?? 0;

    return {
      score,
      maxScore: 10,
      rationale: `MVP status: ${status} (${score}/10)`,
    };
  },
};

// ---------------------------------------------------------------------------
// Traction (30) — logarithmic scaling, anti-gaming cross-checks
// ---------------------------------------------------------------------------

const traction: ScoreRule = {
  dimension: "traction",
  weight: 30,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const users = num(answers.active_users);
    const revenue = num(answers.monthly_revenue);
    const growth = num(answers.growth_rate);
    const mvpStatus = str(answers.mvp_status);

    // Users: logarithmic, max 10 at 5M users (diminishing returns)
    const usersScore = logScore(users, 5_000_000, 10);

    // Revenue: logarithmic, max 10 at $3M MRR (harder to max)
    const revenueScore = logScore(revenue, 3_000_000, 10);

    // Growth rate: logarithmic, max 5 at 200% MoM
    const growthScore = logScore(growth, 200, 5);

    // Consistency check (0–3): does traction match stage?
    // If MVP is "idea" but users > 1000, that's inconsistent → penalize
    // If MVP is "revenue" but users = 0, also inconsistent
    const earlyStage = ["idea", "prototype", "beta"];
    const lateStage = ["launched", "revenue"];
    let consistencyScore = 3;
    if (earlyStage.includes(mvpStatus) && (users > 5000 || revenue > 10000)) {
      consistencyScore = 0;
    } else if (earlyStage.includes(mvpStatus) && (users > 1000 || revenue > 1000)) {
      consistencyScore = 1;
    } else if (lateStage.includes(mvpStatus) && users === 0 && revenue === 0) {
      consistencyScore = 0;
    } else if (lateStage.includes(mvpStatus) && users < 50 && revenue < 100) {
      consistencyScore = 1;
    }

    // Capital efficiency signal (0–2): revenue without excessive marketing spend
    // If growth is very high but revenue is low, could be early/pre-revenue hype
    // If revenue is meaningful relative to users (B2B signal), bonus
    let efficiencyScore = 0;
    if (revenue > 0 && users > 0) {
      const revPerUser = revenue / users;
      if (revPerUser >= 10) efficiencyScore = 2; // B2B or high-value
      else if (revPerUser >= 1) efficiencyScore = 1;
    }

    const raw = usersScore + revenueScore + growthScore + consistencyScore + efficiencyScore;
    const score = Math.min(raw, 30);

    return {
      score,
      maxScore: 30,
      rationale:
        `Active users: ${users} (${usersScore.toFixed(1)}/10, log), ` +
        `Monthly revenue: $${revenue} (${revenueScore.toFixed(1)}/10, log), ` +
        `Growth rate: ${growth}% (${growthScore.toFixed(1)}/5, log), ` +
        `Stage consistency: ${consistencyScore}/3, ` +
        `Capital efficiency: ${efficiencyScore}/2`,
    };
  },
};

// ---------------------------------------------------------------------------
// Team (10) — co-founder + team structure
// ---------------------------------------------------------------------------

const teamStrength: ScoreRule = {
  dimension: "team",
  weight: 10,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const teamSize = Math.max(num(answers.team_size), 1);
    const hasCoFounder = answers.has_cofounder === "yes";

    // Co-founder bonus (0–4)
    const cofounderScore = hasCoFounder ? 4 : 0;

    // Team maturity (0–6): logarithmic, max at 20
    const teamScore = logScore(teamSize, 20, 6);

    const score = Math.min(cofounderScore + teamScore, 10);

    return {
      score,
      maxScore: 10,
      rationale:
        `Co-founder: ${hasCoFounder ? "yes" : "no"} (${cofounderScore}/4), ` +
        `Team size: ${teamSize} (${teamScore.toFixed(1)}/6, log)`,
    };
  },
};

// ---------------------------------------------------------------------------
// Funding Readiness (10) — commitment + capital efficiency
// ---------------------------------------------------------------------------

const fundingReadiness: ScoreRule = {
  dimension: "funding_readiness",
  weight: 10,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const commitment = str(answers.commitment);
    const ask = num(answers.funding_ask);
    const revenue = num(answers.monthly_revenue);
    const users = num(answers.active_users);

    // Commitment (0–4)
    const commitmentScore = commitment === "full-time" ? 4 :
      commitment === "part-time" ? 1 : 0;

    // Ask reasonableness (0–4):
    // Evaluate ask relative to traction
    let askScore = 0;
    if (ask > 0 && revenue > 0) {
      // Capital efficiency: ask / monthly revenue
      const monthsOfRevenue = ask / revenue;
      if (monthsOfRevenue >= 12 && monthsOfRevenue <= 60) {
        askScore = 4; // Reasonable ask: 1x-5x annual revenue
      } else if (monthsOfRevenue > 60 && monthsOfRevenue <= 120) {
        askScore = 3; // High but plausible
      } else if (monthsOfRevenue > 0 && monthsOfRevenue < 12) {
        askScore = 2; // Low ask relative to revenue (small ask)
      } else {
        askScore = 1; // Very high ask
      }
    } else if (ask > 0 && users > 100) {
      // Pre-revenue but has users
      askScore = 2;
    } else if (ask > 0) {
      askScore = 1; // Pre-revenue, pre-users
    }

    // Raise readiness signal (0–2): ask existence + traction combo
    const readinessScore = ask > 0 ? (revenue > 0 || users > 100 ? 2 : 1) : 0;

    const score = Math.min(commitmentScore + askScore + readinessScore, 10);

    return {
      score,
      maxScore: 10,
      rationale:
        `Commitment: ${commitment} (${commitmentScore}/4), ` +
        `Ask reasonableness: $${ask} vs $${revenue}/mo revenue (${askScore}/4), ` +
        `Raise readiness: ask=${ask > 0}, traction=${revenue > 0 || users > 100} (${readinessScore}/2)`,
    };
  },
};

// ---------------------------------------------------------------------------
// Evidence Quality (5) — answer completeness & depth (anti-gaming governor)
// ---------------------------------------------------------------------------

const evidenceQuality: ScoreRule = {
  dimension: "evidence_quality",
  weight: 5,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const nonEmpty = nonEmptyCount(answers);
    const avgLen = avgTextLength(answers);

    // Completeness (0–2)
    const textFields = [
      "problem_statement", "target_customer", "startup_name",
      "industry", "founder_background",
    ];
    let completeness = 0;
    for (const field of textFields) {
      const val = str(answers[field]);
      if (val.length >= 20) completeness++;
    }
    const completenessScore = Math.min(completeness, 2);

    // Depth (0–2) — answers must be substantive
    const depthScore =
      avgLen >= 200 ? 2 :
      avgLen >= 100 ? 1 : 0;

    // Answer count signal (0–1)
    const totalQuestions = 18;
    const answeredRatio = nonEmpty / totalQuestions;
    const coverageScore = answeredRatio >= 0.8 ? 1 : answeredRatio >= 0.5 ? 0.5 : 0;

    const score = Math.min(Math.round(completenessScore + depthScore + coverageScore), 5);

    return {
      score,
      maxScore: 5,
      rationale:
        `Completeness: ${completenessScore}/2 fields detailed, ` +
        `Avg answer depth: ${avgLen.toFixed(0)}c (${depthScore}/2), ` +
        `Coverage: ${nonEmpty}/18 answered (${(coverageScore * 2).toFixed(1)}/1)`,
    };
  },
};

// ---------------------------------------------------------------------------
// Founder Rules — assembled
// ---------------------------------------------------------------------------

export const founderRules: ScoreRule[] = [
  experience,
  founderMarketFit,
  problemMarket,
  mvpReadiness,
  traction,
  teamStrength,
  fundingReadiness,
  evidenceQuality,
];

// ---------------------------------------------------------------------------
// Investor Rules (unchanged — keeping existing logic)
// ---------------------------------------------------------------------------

const activeInvestor: ScoreRule = {
  dimension: "active_investor",
  weight: 20,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const activelyInvesting = str(answers.actively_investing);
    const lookingNow = answers.looking_for_deals === true || answers.looking_for_deals === "true";

    const investingScore = activelyInvesting === "yes" ? 10 : 2;
    const lookingScore = lookingNow ? 10 : 0;

    const score = investingScore + lookingScore;
    return {
      score,
      maxScore: 20,
      rationale: `Actively investing: ${activelyInvesting} (${investingScore}/10), Looking for deals: ${String(lookingNow)} (${lookingScore}/10)`,
    };
  },
};

const chequeSize: ScoreRule = {
  dimension: "cheque_size",
  weight: 20,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const chequeMax = num(answers.cheque_max);

    const score = chequeMax >= 500000 ? 20 : chequeMax >= 100000 ? 15 : chequeMax > 0 ? 5 : 0;
    return {
      score,
      maxScore: 20,
      rationale: `Maximum cheque: $${chequeMax} (${score}/20)`,
    };
  },
};

const deploymentTimeline: ScoreRule = {
  dimension: "deployment_timeline",
  weight: 15,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const timeline = str(answers.deployment_timeline);
    const timelineScores: Record<string, number> = {
      "0-3": 15,
      "3-6": 10,
      "6-12": 5,
      "12-plus": 0,
    };

    const score = timelineScores[timeline] ?? 0;
    return {
      score,
      maxScore: 15,
      rationale: `Deployment timeline: ${timeline} (${score}/15)`,
    };
  },
};

const portfolioQuality: ScoreRule = {
  dimension: "portfolio_quality",
  weight: 15,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const portfolioCount = num(answers.portfolio_count);

    const score = portfolioCount >= 5 ? 15 : portfolioCount >= 2 ? 10 : portfolioCount > 0 ? 5 : 0;
    return {
      score,
      maxScore: 15,
      rationale: `Portfolio companies: ${portfolioCount} (${score}/15)`,
    };
  },
};

const sectorMatch: ScoreRule = {
  dimension: "sector_match",
  weight: 15,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const raw = answers.sector_focus;
    const sectors: string[] = Array.isArray(raw)
      ? raw.filter((s): s is string => typeof s === "string")
      : typeof raw === "string"
        ? [raw]
        : [];

    const count = sectors.length;
    const score = count >= 3 ? 15 : count === 2 ? 10 : count === 1 ? 5 : 0;
    return {
      score,
      maxScore: 15,
      rationale: `Sector focus: ${count} sectors selected (${score}/15)`,
    };
  },
};

const valueAdd: ScoreRule = {
  dimension: "value_add",
  weight: 15,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const description = str(answers.value_add);
    const length = description.length;

    const score = length > 100 ? 15 : length > 50 ? 10 : length > 0 ? 5 : 0;
    return {
      score,
      maxScore: 15,
      rationale: `Value add description: ${length} characters (${score}/15)`,
    };
  },
};

export const investorRules: ScoreRule[] = [
  activeInvestor,
  chequeSize,
  deploymentTimeline,
  portfolioQuality,
  sectorMatch,
  valueAdd,
];

// ---------------------------------------------------------------------------
// Rule Registry
// ---------------------------------------------------------------------------

export const rulesByType: Record<string, ScoreRule[]> = {
  founder: founderRules,
  investor: investorRules,
};

export function getRules(type: string): ScoreRule[] {
  return rulesByType[type] ?? [];
}
