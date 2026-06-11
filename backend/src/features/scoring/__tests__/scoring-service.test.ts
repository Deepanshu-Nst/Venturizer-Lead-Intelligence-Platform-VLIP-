import { describe, it, expect } from "vitest";
import { calculateScore, getBucket, getRecommendation, getExplanation, recalculate, calculateWithRules } from "../engine/scoring-service.js";
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
  target_customer: "Mid-market B2B SaaS companies with 50-500 employees struggling with fragmented toolchains and manual data reconciliation across their CRM, ERP, and analytics platforms.",
  mvp_status: "revenue",
  active_users: 5000,
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
  target_customer: "Small business owners with 10-50 employees",
  mvp_status: "mvp",
  active_users: 200,
  monthly_revenue: 3000,
  growth_rate: 15,
  team_size: 2,
  has_cofounder: "yes",
  funding_ask: 1500000,
};

describe("getBucket", () => {
  it("returns hot for 70-100", () => {
    expect(getBucket(70)).toBe("hot");
    expect(getBucket(100)).toBe("hot");
    expect(getBucket(85)).toBe("hot");
  });

  it("returns good for 45-69", () => {
    expect(getBucket(45)).toBe("good");
    expect(getBucket(69)).toBe("good");
    expect(getBucket(55)).toBe("good");
  });

  it("returns maybe for 25-44", () => {
    expect(getBucket(25)).toBe("maybe");
    expect(getBucket(44)).toBe("maybe");
    expect(getBucket(35)).toBe("maybe");
  });

  it("returns low for 0-24", () => {
    expect(getBucket(0)).toBe("low");
    expect(getBucket(24)).toBe("low");
    expect(getBucket(10)).toBe("low");
  });
});

describe("getRecommendation", () => {
  it("returns appropriate messages per bucket", () => {
    expect(getRecommendation("hot")).toContain("intro call");
    expect(getRecommendation("good")).toContain("check-ins");
    expect(getRecommendation("maybe")).toContain("30 days");
    expect(getRecommendation("low")).toContain("monitor");
  });
});

describe("getExplanation", () => {
  it("returns bucket explanation text", () => {
    expect(getExplanation("hot")).toContain("Strong venture-fit");
    expect(getExplanation("good")).toContain("Promising");
    expect(getExplanation("maybe")).toContain("Early-stage");
    expect(getExplanation("low")).toContain("below investment");
  });
});

describe("calculateScore — founder", () => {
  it("returns ideal founder score in hot bucket", () => {
    const result = calculateScore("founder", idealFounder);

    expect(result.total).toBeGreaterThanOrEqual(70);
    expect(result.bucket).toBe("hot");
    expect(result.dimensions).toHaveLength(8);
    expect(result.reasons).toHaveLength(8);
    expect(result.recommendation).toBeTruthy();
    expect(result.explanation).toBeTruthy();
    expect(result.maxTotal).toBe(100);

    const exp = result.dimensions.find((d) => d.dimension === "experience");
    expect(exp?.score).toBeGreaterThanOrEqual(7);

    const mvp = result.dimensions.find((d) => d.dimension === "mvp_readiness");
    expect(mvp?.score).toBe(10);

    const trac = result.dimensions.find((d) => d.dimension === "traction");
    expect(trac?.score).toBeGreaterThanOrEqual(18);
  });

  it("returns low score for weak founder", () => {
    const result = calculateScore("founder", weakFounder);

    expect(result.total).toBeLessThan(25);
    expect(result.bucket).toBe("low");
    expect(result.total).toBeGreaterThanOrEqual(0);

    const mvp = result.dimensions.find((d) => d.dimension === "mvp_readiness");
    expect(mvp?.score).toBe(0);

    const trac = result.dimensions.find((d) => d.dimension === "traction");
    expect(trac?.score).toBeLessThan(5);
  });

  it("returns moderate score for mid-tier founder", () => {
    const result = calculateScore("founder", midFounder);

    expect(result.total).toBeGreaterThanOrEqual(45);
    expect(result.total).toBeLessThan(70);
    expect(result.bucket).toBe("good");

    const mvp = result.dimensions.find((d) => d.dimension === "mvp_readiness");
    expect(mvp?.score).toBe(7);

    const team = result.dimensions.find((d) => d.dimension === "team");
    expect(team?.score).toBeGreaterThanOrEqual(5);
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

  it("part-time founder with no traction scores low", () => {
    const partTimeNoTraction = {
      prev_startup: "no",
      industry_experience: 0,
      commitment: "part-time",
      startup_name: "",
      industry: "other",
      problem_statement: "An app",
      target_customer: "",
      mvp_status: "idea",
      active_users: 0,
      monthly_revenue: 0,
      growth_rate: 0,
      team_size: 1,
      has_cofounder: "no",
      funding_ask: 0,
    };
    const result = calculateScore("founder", partTimeNoTraction);
    expect(result.total).toBeLessThanOrEqual(25);
    expect(result.bucket).toBe("low");
  });

  it("prevents reaching 75+ with purely optimistic numeric inputs", () => {
    // All high numbers, vague text answers — anti-gaming check
    const gamer = {
      prev_startup: "yes",
      industry_experience: 20,
      commitment: "full-time",
      startup_name: "AI Corp",
      industry: "other",
      problem_statement: "We are disrupting everything with AI platform",
      target_customer: "Everyone",
      mvp_status: "launched",
      active_users: 100000,
      monthly_revenue: 100000,
      growth_rate: 80,
      team_size: 100,
      has_cofounder: "yes",
      funding_ask: 10000000,
    };
    const result = calculateScore("founder", gamer);
    // Evidence quality, founder-market fit, and problem clarity caps prevent 70+
    expect(result.total).toBeLessThan(70);
    expect(result.bucket).not.toBe("hot");
  });
});

// ---------------------------------------------------------------------------
// 10 Sample Founder Profiles — verify score distribution
// ---------------------------------------------------------------------------

const profiles: { name: string; answers: Record<string, unknown>; expectedRange: [number, number]; expectedBucket: string }[] = [
  {
    name: "No-show — barely any input",
    answers: {
      prev_startup: "no", industry_experience: 0, commitment: "part-time",
      startup_name: "", industry: "other", problem_statement: "Hi",
      target_customer: "", mvp_status: "idea", active_users: 0,
      monthly_revenue: 0, growth_rate: 0, team_size: 1, has_cofounder: "no",
      funding_ask: 0,
    },
    expectedRange: [0, 24], expectedBucket: "low",
  },
  {
    name: "Weekend hobbyist — no commitment, no traction",
    answers: {
      prev_startup: "no", industry_experience: 1, commitment: "part-time",
      startup_name: "SideProject", industry: "other", problem_statement: "A tool for organizing bookmarks using AI recommendations",
      target_customer: "", mvp_status: "idea", active_users: 5,
      monthly_revenue: 0, growth_rate: 0, team_size: 1, has_cofounder: "no",
      funding_ask: 0,
    },
    expectedRange: [0, 24], expectedBucket: "low",
  },
  {
    name: "First-time solo — early idea, no revenue",
    answers: {
      prev_startup: "no", industry_experience: 2, commitment: "part-time",
      startup_name: "MyApp", industry: "saas", problem_statement: "Helping remote teams collaborate more effectively through better async communication tools.",
      target_customer: "Remote workers", mvp_status: "prototype",
      active_users: 30, monthly_revenue: 0, growth_rate: 5,
      team_size: 1, has_cofounder: "no", funding_ask: 0,
    },
    expectedRange: [20, 25], expectedBucket: "low",
  },
  {
    name: "Early-stage team — prototype, some interest",
    answers: {
      prev_startup: "no", industry_experience: 4, commitment: "full-time",
      startup_name: "TeamFlow", industry: "saas", problem_statement: "Small teams waste hours on project status updates and status meetings. We automate async standups with AI-generated summaries that keep everyone aligned without the meeting overhead.",
      target_customer: "Engineering teams of 10-50 people in mid-growth startups", mvp_status: "prototype",
      active_users: 300, monthly_revenue: 0, growth_rate: 10,
      team_size: 2, has_cofounder: "yes", funding_ask: 50000,
    },
    expectedRange: [45, 69], expectedBucket: "good",
  },
  {
    name: "Average operator — MVP, small revenue, part-time",
    answers: {
      prev_startup: "no", industry_experience: 4, commitment: "part-time",
      startup_name: "GrowPro", industry: "saas", problem_statement: "Freelancers struggle to manage invoices and payment tracking. We built a simple all-in-one billing platform.",
      target_customer: "Freelancers and solo service providers", mvp_status: "mvp",
      active_users: 200, monthly_revenue: 500, growth_rate: 8,
      team_size: 2, has_cofounder: "yes", funding_ask: 100000,
    },
    expectedRange: [45, 69], expectedBucket: "good",
  },
  {
    name: "Rising startup — solid traction, full-time, cofounder",
    answers: {
      prev_startup: "no", industry_experience: 5, commitment: "full-time",
      startup_name: "ScaleUp", industry: "saas", problem_statement: "Mid-market companies waste $200k/year on manual contract review. Our AI parses and flags risks in seconds.",
      target_customer: "Legal departments at companies with 100-1000 employees", mvp_status: "launched",
      active_users: 800, monthly_revenue: 8000, growth_rate: 18,
      team_size: 4, has_cofounder: "yes", funding_ask: 500000,
    },
    expectedRange: [45, 69], expectedBucket: "good",
  },
  {
    name: "Repeat founder — prior exit, strong traction",
    answers: {
      prev_startup: "yes", industry_experience: 8, commitment: "full-time",
      startup_name: "ExitedCo", industry: "saas", problem_statement: "Enterprise data migrations fail 60% of the time. We built a zero-downtime migration platform that handles petabyte-scale transfers with automated validation.",
      target_customer: "Enterprise data engineering teams at Fortune 500 companies managing complex database migrations across cloud providers.", mvp_status: "revenue",
      active_users: 5000, monthly_revenue: 80000, growth_rate: 22,
      team_size: 6, has_cofounder: "yes", funding_ask: 3000000,
    },
    expectedRange: [70, 100], expectedBucket: "hot",
  },
  {
    name: "Deep tech — strong IP, full-time, high growth",
    answers: {
      prev_startup: "yes", industry_experience: 10, commitment: "full-time",
      startup_name: "DeepAI", industry: "ai-ml", problem_statement: "Computer vision models require millions of labelled images. Our synthetic data generator creates photorealistic training data 100x faster at fraction of the cost.",
      target_customer: "Autonomous vehicle companies and robotics teams building computer vision models for real-world deployment.", mvp_status: "revenue",
      active_users: 12000, monthly_revenue: 150000, growth_rate: 35,
      team_size: 12, has_cofounder: "yes", funding_ask: 5000000,
    },
    expectedRange: [70, 100], expectedBucket: "hot",
  },
  {
    name: "Hardware — prototype stage, team forming",
    answers: {
      prev_startup: "no", industry_experience: 6, commitment: "full-time",
      startup_name: "RoboMech", industry: "other", problem_statement: "Warehouse automation robots cost $500k+ and take 18 months to deploy. Our modular system deploys in 4 weeks for under $100k, making automation accessible to mid-size warehouses that were previously priced out.",
      target_customer: "Mid-size warehouse operators with 50-200 employees in logistics-intensive industries", mvp_status: "prototype",
      active_users: 200, monthly_revenue: 0, growth_rate: 0,
      team_size: 3, has_cofounder: "yes", funding_ask: 2000000,
    },
    expectedRange: [45, 69], expectedBucket: "good",
  },
  {
    name: "Lifestyle business — profitable but not venture-scalable",
    answers: {
      prev_startup: "no", industry_experience: 4, commitment: "part-time",
      startup_name: "BootstrapCo", industry: "ecommerce", problem_statement: "We built a platform for local artisans to sell directly to customers.",
      target_customer: "Independent artisans", mvp_status: "revenue",
      active_users: 100, monthly_revenue: 5000, growth_rate: 3,
      team_size: 2, has_cofounder: "yes", funding_ask: 0,
    },
    expectedRange: [45, 69], expectedBucket: "good",
  },
];

describe("10 sample founder profiles — score distribution", () => {
  for (const profile of profiles) {
    it(`${profile.name}: ${profile.expectedRange[0]}-${profile.expectedRange[1]} (${profile.expectedBucket})`, () => {
      const result = calculateScore("founder", profile.answers);
      expect(result.total).toBeGreaterThanOrEqual(profile.expectedRange[0]);
      expect(result.total).toBeLessThanOrEqual(profile.expectedRange[1]);
      expect(result.bucket).toBe(profile.expectedBucket);
      expect(result.explanation).toBeTruthy();
    });
  }
});

// ---------------------------------------------------------------------------
// Investor Scoring Tests
// ---------------------------------------------------------------------------

const idealInvestor = {
  investor_type: "vc",
  preferred_stage: "seed",
  sector_focus: ["fintech", "saas", "ai-ml", "climate", "health"],
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

    expect(result.total).toBeGreaterThanOrEqual(70);
    expect(result.bucket).toBe("hot");
    expect(result.dimensions).toHaveLength(6);
    expect(result.reasons).toHaveLength(6);

    const active = result.dimensions.find((d) => d.dimension === "active_investor");
    expect(active?.score).toBe(20);

    const cheque = result.dimensions.find((d) => d.dimension === "cheque_size");
    expect(cheque?.score).toBe(20);
  });

  it("returns low score for weak investor", () => {
    const result = calculateScore("investor", weakInvestor);

    expect(result.total).toBeLessThan(25);
    expect(result.bucket).toBe("low");

    const active = result.dimensions.find((d) => d.dimension === "active_investor");
    expect(active?.score).toBe(2);

    const cheque = result.dimensions.find((d) => d.dimension === "cheque_size");
    expect(cheque?.score).toBe(0);

    const portfolio = result.dimensions.find((d) => d.dimension === "portfolio_quality");
    expect(portfolio?.score).toBe(0);
  });

  it("returns solid score for mid-tier investor", () => {
    const result = calculateScore("investor", midInvestor);

    expect(result.total).toBeGreaterThanOrEqual(70);
    expect(result.bucket).toBe("hot");

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
    expect(result.explanation).toBeTruthy();
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
    expect(result.dimensions).toHaveLength(8);
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
    expect(founderRules).toHaveLength(8);
  });

  it("investor rules are configurable (array can be modified)", () => {
    expect(investorRules).toHaveLength(6);
  });
});
