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

// ---------------------------------------------------------------------------
// Founder Rules
// ---------------------------------------------------------------------------

const founderExperience: ScoreRule = {
  dimension: "founder_experience",
  weight: 15,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const prevStartup = answers.prev_startup === "yes" ? 8 : 2;
    const industryExp = Math.min(Math.max(num(answers.industry_experience), 0), 7);
    const score = prevStartup + industryExp;

    return {
      score,
      maxScore: 15,
      rationale: `Previous startup: ${str(answers.prev_startup)} (${prevStartup}/8), Industry experience: ${str(answers.industry_experience)} years (${industryExp}/7)`,
    };
  },
};

const industryKnowledge: ScoreRule = {
  dimension: "industry_knowledge",
  weight: 10,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const problemStatement = str(answers.problem_statement);
    const problemScore = Math.min(Math.floor(problemStatement.length / 20), 5);
    const targetCustomer = str(answers.target_customer);
    const customerScore = targetCustomer.length > 0 ? 5 : 0;
    const score = problemScore + customerScore;

    return {
      score,
      maxScore: 10,
      rationale: `Problem clarity: ${problemScore}/5, Customer knowledge: ${customerScore}/5`,
    };
  },
};

const mvpReadiness: ScoreRule = {
  dimension: "mvp_readiness",
  weight: 20,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const mvpScores: Record<string, number> = {
      idea: 0,
      prototype: 5,
      mvp: 12,
      launched: 18,
      revenue: 20,
    };
    const score = mvpScores[str(answers.mvp_status)] ?? 0;

    return {
      score,
      maxScore: 20,
      rationale: `MVP status: ${str(answers.mvp_status)} (${score}/20)`,
    };
  },
};

const traction: ScoreRule = {
  dimension: "traction",
  weight: 20,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const users = num(answers.active_users);
    const revenue = num(answers.monthly_revenue);
    const growth = num(answers.growth_rate);

    const usersScore = users > 100 ? 7 : users > 10 ? 4 : users > 0 ? 2 : 0;
    const revenueScore = revenue > 10000 ? 8 : revenue > 1000 ? 5 : revenue > 0 ? 2 : 0;
    const growthScore = growth > 20 ? 5 : growth > 10 ? 3 : growth > 0 ? 1 : 0;

    const score = usersScore + revenueScore + growthScore;
    return {
      score,
      maxScore: 20,
      rationale: `Active users: ${users} (${usersScore}/7), Monthly revenue: $${revenue} (${revenueScore}/8), Growth rate: ${growth}% (${growthScore}/5)`,
    };
  },
};

const teamStrength: ScoreRule = {
  dimension: "team_strength",
  weight: 15,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const teamSize = Math.max(num(answers.team_size), 1);
    const hasCoFounder = answers.has_cofounder === "yes";

    const teamScore = teamSize > 1 ? 5 : 2;
    const coFounderScore = hasCoFounder ? 10 : 0;

    const score = teamScore + coFounderScore;
    return {
      score,
      maxScore: 15,
      rationale: `Team size: ${teamSize} (${teamScore}/5), Co-founder: ${String(hasCoFounder)} (${coFounderScore}/10)`,
    };
  },
};

const validation: ScoreRule = {
  dimension: "validation",
  weight: 10,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const revenue = num(answers.monthly_revenue);
    const users = num(answers.active_users);

    const revenueScore = revenue > 0 ? 5 : 0;
    const userValidation = users > 50 ? 5 : users > 10 ? 3 : users > 0 ? 1 : 0;

    const score = revenueScore + userValidation;
    return {
      score,
      maxScore: 10,
      rationale: `Revenue exists: ${revenue > 0} (${revenueScore}/5), User validation: ${users} users (${userValidation}/5)`,
    };
  },
};

const fundingReadiness: ScoreRule = {
  dimension: "funding_readiness",
  weight: 10,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const commitment = str(answers.commitment);
    const ask = num(answers.funding_ask);

    const commitmentScore = commitment === "full-time" ? 5 : 1;
    const askScore = ask > 0 && ask <= 5000000 ? 5 : ask > 0 ? 3 : 0;

    const score = commitmentScore + askScore;
    return {
      score,
      maxScore: 10,
      rationale: `Commitment: ${commitment} (${commitmentScore}/5), Funding ask: $${ask} (${askScore}/5)`,
    };
  },
};

export const founderRules: ScoreRule[] = [
  founderExperience,
  industryKnowledge,
  mvpReadiness,
  traction,
  teamStrength,
  validation,
  fundingReadiness,
];

// ---------------------------------------------------------------------------
// Investor Rules
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
