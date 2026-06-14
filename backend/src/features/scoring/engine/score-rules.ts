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



function isLowQualityText(text: string): boolean {
  if (text.length < 5) return true;
  const lower = text.toLowerCase().trim();
  // Check for excessive uppercase ratio (common in spam)
  const upperRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (upperRatio > 0.7 && text.length > 10) return true;
  
  // High ratio of non-alphabetic chars (spam/scraped junk)
  const alphaChars = (lower.match(/[a-z]/g) || []).length;
  if (alphaChars / lower.length < 0.5 && text.length > 10) return true;
  
  const words = lower.split(/\s+/).filter(w => w.length >= 3);
  if (words.length > 4) {
    const uniqueWords = new Set(words);
    if (uniqueWords.size < words.length * 0.3) return true;
  }
  
  return false;
}

/** Checks if critical text answers show real substance vs. gaming. */
function getQualityPenalty(answers: Record<string, unknown>): number {
  const problem = str(answers.problem_statement);
  const target = str(answers.target_customer);
  let penalty = 0;
  if (problem.length > 0 && isLowQualityText(problem)) penalty += 15;
  if (target.length > 0 && isLowQualityText(target)) penalty += 5;
  // Check for suspiciously round/extreme numbers with low-quality text
  const users = num(answers.active_users);
  const revenue = num(answers.monthly_revenue);
  if ((users >= 1000000 || revenue >= 1000000) && (penalty > 0)) {
    penalty += 10; // Extreme numbers + gibberish = likely gaming
  }
  return penalty;
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

    // If problem statement is gibberish, this dimension scores 0
    if (problem.length > 0 && isLowQualityText(problem)) {
      return {
        score: 0,
        maxScore: 10,
        rationale: `Problem statement quality too low for assessment`,
      };
    }

    // Problem depth: rely on existence rather than massive length
    const problemDepth = problem.length >= 20 ? 3 : problem.length > 0 ? 1 : 0;

    // Target customer specificity
    const targetScore = target.length >= 10 ? 2 : target.length > 0 ? 1 : 0;

    // Experience alignment
    let experienceScore = 0;
    if (years >= 5) experienceScore = 5;
    else if (years >= 3) experienceScore = 3;
    else if (years >= 1) experienceScore = 1;

    // Traction confidence boost to FMF
    const users = num(answers.active_users);
    const revenue = num(answers.monthly_revenue);
    let tractionBoost = 0;
    if (revenue > 1000 || users > 100) {
      tractionBoost = 2;
    }

    const score = Math.min(problemDepth + targetScore + experienceScore + tractionBoost, 10);

    return {
      score,
      maxScore: 10,
      rationale:
        `Problem depth: (${problemDepth}/3), ` +
        `Target specificity: (${targetScore}/2), ` +
        `Experience: ${years}y (${experienceScore}/5), ` +
        `Traction boost: +${tractionBoost}`,
    };
  },
};

// ---------------------------------------------------------------------------
// Problem & Market (15) — clarity + market potential
// ---------------------------------------------------------------------------

const problemMarket: ScoreRule = {
  dimension: "problem_market",
  weight: 5,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const problem = str(answers.problem_statement);
    const target = str(answers.target_customer);
    const industryArray = Array.isArray(answers.industry) ? answers.industry : [str(answers.industry)];

    let score = 0;
    if (problem.length >= 20) score += 2;
    if (target.length >= 10) score += 2;
    if (industryArray.length > 0 && industryArray[0] !== "" && industryArray[0].toLowerCase() !== "other") score += 1;

    return {
      score,
      maxScore: 5,
      rationale:
        `Problem statement present: ${problem.length >= 20 ? "yes" : "no"} (+${problem.length >= 20 ? 2 : 0}), ` +
        `Target customer present: ${target.length >= 10 ? "yes" : "no"} (+${target.length >= 10 ? 2 : 0}), ` +
        `Industry present: ${industryArray.length > 0 && industryArray[0] !== "" && industryArray[0].toLowerCase() !== "other" ? "yes" : "no"} (+${industryArray.length > 0 && industryArray[0] !== "" && industryArray[0].toLowerCase() !== "other" ? 1 : 0})`,
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
  weight: 40,
  evaluator(answers: Record<string, unknown>): ScoreResult {
    const users = num(answers.active_users);
    const revenue = num(answers.monthly_revenue);
    const growth = num(answers.growth_rate);
    const mvpStatus = str(answers.mvp_status);

    // Users: logarithmic, max 15 at 5M users (diminishing returns)
    const usersScore = logScore(users, 5_000_000, 15);

    // Revenue: logarithmic, max 15 at $3M MRR (harder to max)
    const revenueScore = logScore(revenue, 3_000_000, 15);

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
    
    // Traction Confidence Boost
    let confidenceBoost = 0;
    if (users > 1000) confidenceBoost += 2;
    if (revenue > 10000) confidenceBoost += 3;
    if (growth > 10) confidenceBoost += 2;
    confidenceBoost = Math.min(confidenceBoost, 5); // cap at +5

    const score = Math.min(raw + confidenceBoost, 40);

    return {
      score,
      maxScore: 40,
      rationale:
        `Active users: ${users} (${usersScore.toFixed(1)}/10, log), ` +
        `Monthly revenue: $${revenue} (${revenueScore.toFixed(1)}/10, log), ` +
        `Growth rate: ${growth}% (${growthScore.toFixed(1)}/5, log), ` +
        `Stage consistency: ${consistencyScore}/3, ` +
        `Capital efficiency: ${efficiencyScore}/2, ` +
        `Confidence Boost: +${confidenceBoost}`,
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
    const ask = num(answers.funding_ask);
    const revenue = num(answers.monthly_revenue);
    const users = num(answers.active_users);
    const stage = str(answers.mvp_status);
    const commitment = str(answers.commitment);

    let score = 5; // Start in the middle

    // Evaluate ask relative to stage and reality
    if (ask > 0) {
      if (stage === "idea" && ask > 1000000) {
        score -= 5; // Delusional
      } else if (stage === "prototype" && ask > 2000000) {
        score -= 3; // Questionable
      } else if (revenue > 0) {
        const arr = revenue * 12;
        if (ask <= arr * 5) {
          score += 3; // Very reasonable
        } else if (ask <= arr * 10) {
          score += 1; // High but plausible
        } else {
          score -= 2; // Too high relative to revenue
        }
      } else if (users > 1000 && ask <= 2000000) {
        score += 2; // Pre-revenue but reasonable ask with traction
      }
    }

    if (commitment === "full-time") score += 2;
    else if (commitment === "part-time") score -= 2;

    score = Math.min(Math.max(score, 0), 10);

    return {
      score,
      maxScore: 10,
      rationale: `Founder Reality Check: Stage=${stage}, Ask=$${ask}, Revenue=$${revenue}/mo, Commitment=${commitment} -> Score: ${score}/10`,
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
    const qualityPenalty = getQualityPenalty(answers);

    // Anti-gaming / anti-gibberish governor
    if (qualityPenalty > 0) {
      return {
        score: -qualityPenalty,
        maxScore: 5,
        rationale: `Quality penalty: -${qualityPenalty} (gibberish/gaming detected in text answers)`,
      };
    }

    let score = 0;
    
    // Reward providing concrete numbers (no length penalty)
    if (num(answers.monthly_revenue) > 0) score += 2;
    if (num(answers.active_users) > 0) score += 1;
    if (num(answers.growth_rate) > 0) score += 1;
    if (num(answers.funding_ask) > 0) score += 1;

    score = Math.min(score, 5);

    return {
      score,
      maxScore: 5,
      rationale:
        `Evidence provided: revenue (${num(answers.monthly_revenue) > 0 ? '+2' : '0'}), ` +
        `users (${num(answers.active_users) > 0 ? '+1' : '0'}), ` +
        `growth (${num(answers.growth_rate) > 0 ? '+1' : '0'}), ` +
        `funding ask (${num(answers.funding_ask) > 0 ? '+1' : '0'})`,
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
