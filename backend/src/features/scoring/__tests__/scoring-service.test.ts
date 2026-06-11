import { describe, it, expect } from "vitest";
import { calculateScore, getBucket, getRecommendation, recalculate, calculateWithRules } from "../engine/scoring-service.js";
import { founderRules, investorRules } from "../engine/score-rules.js";
import type { ScoreRule } from "../engine/score-types.js";

// ---------------------------------------------------------------------------
// Founder Scoring Tests
// ---------------------------------------------------------------------------

const idealFounder = {
  prev_startup: "yes",
  industry_experience: 7,
  commitment: "full-time",
  startup_name: "Acme AI",
  industry: "saas",
  problem_statement: "We solve the critical challenge of data fragmentation across enterprise SaaS platforms, enabling seamless integration that saves thousands of engineering hours annually while improving data accuracy by 40%.",
  target_customer: "Mid-market B2B SaaS companies with 50-500 employees",
  mvp_status: "revenue",
  active_users: 500,
  monthly_revenue: 25000,
  growth_rate: 25,
  team_size: 4,
  has_cofounder: "yes",
  funding_ask: 2000000,
};

const weakFounder = {
  prev_startup: "no",
  industry_experience: 0,
  commitment: "part-time",
  startup_name: "Test Inc",
  industry: "other",
  problem_statement: "Making things better",
  target_customer: "",
  mvp_status: "idea",
  active_users: 0,
  monthly_revenue: 0,
  growth_rate: 0,
  team_size: 1,
  has_cofounder: "no",
  funding_ask: 0,
};

const midFounder = {
  prev_startup: "no",
  industry_experience: 3,
  commitment: "part-time",
  startup_name: "Growth Co",
  industry: "fintech",
  problem_statement: "We help small businesses manage their cash flow with AI-powered forecasting and automated reconciliation tools.",
  target_customer: "Small business owners",
  mvp_status: "mvp",
  active_users: 50,
  monthly_revenue: 3000,
  growth_rate: 15,
  team_size: 2,
  has_cofounder: "yes",
  funding_ask: 1500000,
};

describe("getBucket", () => {
  it("returns hot for 80-100", () => {
    expect(getBucket(80)).toBe("hot");
    expect(getBucket(100)).toBe("hot");
    expect(getBucket(95)).toBe("hot");
  });

  it("returns good for 60-79", () => {
    expect(getBucket(60)).toBe("good");
    expect(getBucket(79)).toBe("good");
    expect(getBucket(70)).toBe("good");
  });

  it("returns maybe for 40-59", () => {
    expect(getBucket(40)).toBe("maybe");
    expect(getBucket(59)).toBe("maybe");
    expect(getBucket(50)).toBe("maybe");
  });

  it("returns low for 0-39", () => {
    expect(getBucket(0)).toBe("low");
    expect(getBucket(39)).toBe("low");
    expect(getBucket(20)).toBe("low");
  });
});

describe("getRecommendation", () => {
  it("returns appropriate messages per bucket", () => {
    expect(getRecommendation("hot")).toContain("immediate");
    expect(getRecommendation("good")).toContain("nurture");
    expect(getRecommendation("maybe")).toContain("30 days");
    expect(getRecommendation("low")).toContain("long-term");
  });
});

describe("calculateScore — founder", () => {
  it("returns ideal founder score in hot bucket", () => {
    const result = calculateScore("founder", idealFounder);

    expect(result.total).toBeGreaterThanOrEqual(80);
    expect(result.bucket).toBe("hot");
    expect(result.dimensions).toHaveLength(7);
    expect(result.reasons).toHaveLength(7);
    expect(result.recommendation).toBeTruthy();
    expect(result.maxTotal).toBe(100);

    // Verify key dimensions
    const exp = result.dimensions.find((d) => d.dimension === "founder_experience");
    expect(exp?.score).toBeGreaterThan(10);

    const mvp = result.dimensions.find((d) => d.dimension === "mvp_readiness");
    expect(mvp?.score).toBe(20);

    const traction = result.dimensions.find((d) => d.dimension === "traction");
    expect(traction?.score).toBe(20);
  });

  it("returns low score for weak founder", () => {
    const result = calculateScore("founder", weakFounder);

    expect(result.total).toBeLessThan(40);
    expect(result.bucket).toBe("low");
    expect(result.total).toBeGreaterThanOrEqual(0);

    // MVP at idea = 0
    const mvp = result.dimensions.find((d) => d.dimension === "mvp_readiness");
    expect(mvp?.score).toBe(0);

    // Traction all zeros
    const traction = result.dimensions.find((d) => d.dimension === "traction");
    expect(traction?.score).toBe(0);
  });

  it("returns moderate score for mid-tier founder", () => {
    const result = calculateScore("founder", midFounder);

    expect(result.total).toBeGreaterThanOrEqual(40);
    expect(result.total).toBeLessThan(80);
    expect(["good", "maybe"]).toContain(result.bucket);

    // MVP at mvp = 12
    const mvp = result.dimensions.find((d) => d.dimension === "mvp_readiness");
    expect(mvp?.score).toBe(12);

    // Has cofounder
    const team = result.dimensions.find((d) => d.dimension === "team_strength");
    expect(team?.score).toBe(15);
  });

  it("caps total at 100", () => {
    const overkill = {
      ...idealFounder,
      industry_experience: 100,
      active_users: 999999,
      monthly_revenue: 99999999,
      growth_rate: 999,
    };
    const result = calculateScore("founder", overkill);
    expect(result.total).toBeLessThanOrEqual(100);
  });
});

// ---------------------------------------------------------------------------
// Investor Scoring Tests
// ---------------------------------------------------------------------------

const idealInvestor = {
  investor_type: "vc",
  preferred_stage: "seed",
  sector_focus: ["fintech", "saas", "ai-ml"],
  cheque_min: 250000,
  cheque_max: 1000000,
  deployment_timeline: "0-3",
  portfolio_count: 10,
  geography: "global",
  follow_on_strategy: "We reserve 50% of fund for follow-on investments in top-performing portfolio companies across subsequent rounds.",
  value_add: "We provide hands-on operational support including executive recruiting, go-to-market strategy, and international expansion guidance through our platform team of 15 former operators.",
  decision_timeline: "2-4",
  actively_investing: "yes",
  looking_for_deals: true,
};

const weakInvestor = {
  investor_type: "angel",
  preferred_stage: "series-b-plus",
  sector_focus: [],
  cheque_min: 0,
  cheque_max: 0,
  deployment_timeline: "12-plus",
  portfolio_count: 0,
  geography: "north-america",
  follow_on_strategy: "",
  value_add: "",
  decision_timeline: "8-plus",
  actively_investing: "not-yet",
  looking_for_deals: false,
};

const midInvestor = {
  investor_type: "family-office",
  preferred_stage: "series-a",
  sector_focus: ["health", "climate"],
  cheque_min: 100000,
  cheque_max: 250000,
  deployment_timeline: "3-6",
  portfolio_count: 3,
  geography: "europe",
  follow_on_strategy: "We invest alongside lead investors and reserve rights for pro-rata participation in future rounds.",
  value_add: "We offer strategic advisory and board representation to help portfolio companies scale responsibly.",
  decision_timeline: "4-8",
  actively_investing: "yes",
  looking_for_deals: true,
};

describe("calculateScore — investor", () => {
  it("returns ideal investor score in hot bucket", () => {
    const result = calculateScore("investor", idealInvestor);

    expect(result.total).toBeGreaterThanOrEqual(80);
    expect(result.bucket).toBe("hot");
    expect(result.dimensions).toHaveLength(6);
    expect(result.reasons).toHaveLength(6);

    // Active investor max = 20
    const active = result.dimensions.find((d) => d.dimension === "active_investor");
    expect(active?.score).toBe(20);

    // Cheque size >= 500k = 20
    const cheque = result.dimensions.find((d) => d.dimension === "cheque_size");
    expect(cheque?.score).toBe(20);
  });

  it("returns low score for weak investor", () => {
    const result = calculateScore("investor", weakInvestor);

    expect(result.total).toBeLessThan(40);
    expect(result.bucket).toBe("low");

    // Active investor: not-yet + no looking = 2
    const active = result.dimensions.find((d) => d.dimension === "active_investor");
    expect(active?.score).toBe(2);

    // No cheque
    const cheque = result.dimensions.find((d) => d.dimension === "cheque_size");
    expect(cheque?.score).toBe(0);

    // No portfolio
    const portfolio = result.dimensions.find((d) => d.dimension === "portfolio_quality");
    expect(portfolio?.score).toBe(0);
  });

  it("returns moderate score for mid-tier investor", () => {
    const result = calculateScore("investor", midInvestor);

    expect(result.total).toBeGreaterThanOrEqual(40);
    expect(result.total).toBeLessThan(80);
    expect(["good", "maybe"]).toContain(result.bucket);

    // 2 sectors = 10
    const sector = result.dimensions.find((d) => d.dimension === "sector_match");
    expect(sector?.score).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// Configurable Rules Tests
// ---------------------------------------------------------------------------

describe("calculateWithRules", () => {
  it("evaluates custom rules independently", () => {
    const customRule: ScoreRule = {
      dimension: "custom",
      weight: 50,
      evaluator: () => ({ score: 25, maxScore: 50, rationale: "Custom test" }),
    };

    const result = calculateWithRules([customRule], {});
    expect(result.total).toBe(25);
    expect(result.dimensions).toHaveLength(1);
    expect(result.dimensions[0]?.rationale).toBe("Custom test");
  });

  it("handles empty rule set", () => {
    const result = calculateWithRules([], {});
    expect(result.total).toBe(0);
    expect(result.dimensions).toHaveLength(0);
    expect(result.bucket).toBe("low");
  });
});

describe("recalculate", () => {
  it("recalculates with same rules by default", () => {
    const first = calculateScore("founder", midFounder);
    const second = recalculate("founder", midFounder);
    expect(second.total).toBe(first.total);
    expect(second.bucket).toBe(first.bucket);
  });

  it("accepts overridden rules", () => {
    const strictRule: ScoreRule = {
      dimension: "strict",
      weight: 100,
      evaluator: () => ({ score: 10, maxScore: 100, rationale: "Always 10" }),
    };

    const result = recalculate("founder", {}, { rules: [strictRule] });
    expect(result.total).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// Edge Cases
// ---------------------------------------------------------------------------

describe("edge cases", () => {
  it("handles empty answers", () => {
    const result = calculateScore("founder", {});
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.dimensions).toHaveLength(7);
  });

  it("handles null values gracefully", () => {
    const result = calculateScore("investor", {
      cheque_max: null,
      portfolio_count: null,
      sector_focus: null,
      actively_investing: null,
    });
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.dimensions).toHaveLength(6);
  });

  it("handles undefined values gracefully", () => {
    const result = calculateScore("founder", {
      prev_startup: undefined,
      industry_experience: undefined,
    });
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it("handles sector_focus as string", () => {
    const result = calculateScore("investor", {
      ...idealInvestor,
      sector_focus: "fintech",
    });
    const sector = result.dimensions.find((d) => d.dimension === "sector_match");
    expect(sector?.score).toBe(5);
  });

  it("founder rules are configurable (array can be modified)", () => {
    expect(founderRules).toHaveLength(7);
  });

  it("investor rules are configurable (array can be modified)", () => {
    expect(investorRules).toHaveLength(6);
  });
});
