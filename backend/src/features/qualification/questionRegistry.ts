import type { Question, BranchingRule } from "./types/qualification.types.js";

const founderQuestions: Question[] = [
  { id: "full_name", question: "What is your full name?", type: "text", stage: "personal", required: true, validation: { minLength: 2 } },
  { id: "email", question: "What is your email address?", type: "email", stage: "personal", required: true },
  { id: "phone", question: "What is your phone number?", type: "tel", stage: "personal", required: true },
  { id: "linkedin", question: "What is your LinkedIn profile URL?", type: "url", stage: "personal", required: true, validation: { pattern: "linkedin.com" } },
  { id: "prev_startup", question: "Have you started a company before?", type: "select", stage: "background", required: true, options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
  { id: "industry_experience", question: "How many years of industry experience do you have?", type: "number", stage: "background", required: true, validation: { min: 0, max: 50 } },
  { id: "commitment", question: "Are you working on this full-time or part-time?", type: "select", stage: "background", required: true, options: [{ value: "full-time", label: "Full-time" }, { value: "part-time", label: "Part-time" }] },
  { id: "startup_name", question: "What is your startup called?", type: "text", stage: "startup", required: true },
  { id: "industry", question: "Which industry are you in?", type: "select", stage: "startup", required: true, options: [
    { value: "fintech", label: "Fintech" }, { value: "health", label: "Health / Bio" }, { value: "saas", label: "SaaS" }, { value: "ai-ml", label: "AI / ML" }, { value: "climate", label: "Climate / Energy" }, { value: "edtech", label: "Edtech" }, { value: "ecommerce", label: "E-commerce" }, { value: "consumer", label: "Consumer" }, { value: "web3", label: "Web3 / Crypto" }, { value: "hardtech", label: "Hardtech / Robotics" }, { value: "space", label: "Space / Defense" }, { value: "other", label: "Other" }
  ] },
  { id: "problem_statement", question: "What problem are you solving?", type: "textarea", stage: "startup", required: true, validation: { minLength: 50 } },
  { id: "target_customer", question: "Who is your target customer?", type: "text", stage: "startup", required: true },
  { id: "mvp_status", question: "What is your current MVP status?", type: "select", stage: "product", required: true, options: [
    { value: "idea", label: "Idea" }, { value: "prototype", label: "Prototype" }, { value: "mvp", label: "MVP" }, { value: "launched", label: "Launched" }, { value: "revenue", label: "Revenue" },
  ]},
  { id: "active_users", question: "How many active users or customers do you have?", type: "number", stage: "traction", required: true, validation: { min: 0 } },
  { id: "monthly_revenue", question: "What is your monthly revenue (USD)?", type: "number", stage: "traction", required: true, validation: { min: 0 } },
  { id: "growth_rate", question: "What is your month-over-month growth rate (%)?", type: "number", stage: "traction", required: true, validation: { min: 0, max: 100 } },
  { id: "team_size", question: "How many people are on your team?", type: "number", stage: "team", required: true, validation: { min: 1 } },
  { id: "has_cofounder", question: "Do you have a co-founder?", type: "select", stage: "team", required: true, options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
  { id: "funding_ask", question: "How much funding are you raising (USD)?", type: "number", stage: "fundraising", required: true, validation: { min: 0 } },
];

const investorQuestions: Question[] = [
  { id: "full_name", question: "What is your full name?", type: "text", stage: "personal", required: true, validation: { minLength: 2 } },
  { id: "email", question: "What is your email address?", type: "email", stage: "personal", required: true },
  { id: "phone", question: "What is your phone number?", type: "tel", stage: "personal", required: true },
  { id: "linkedin", question: "What is your LinkedIn profile URL?", type: "url", stage: "personal", required: true, validation: { pattern: "linkedin.com" } },
  { id: "investor_type", question: "What type of investor are you?", type: "select", stage: "profile", required: true, options: [
    { value: "angel", label: "Angel Investor" }, { value: "vc", label: "Venture Capital" }, { value: "family-office", label: "Family Office" }, { value: "corporate", label: "Corporate VC" },
  ]},
  { id: "preferred_stage", question: "What stage do you typically invest in?", type: "select", stage: "profile", required: true, options: [
    { value: "pre-seed", label: "Pre-seed" }, { value: "seed", label: "Seed" }, { value: "series-a", label: "Series A" }, { value: "series-b-plus", label: "Series B+" },
  ]},
  { id: "sector_focus", question: "Which sectors are you focused on?", type: "multiselect", stage: "profile", required: true, options: [
    { value: "fintech", label: "Fintech" }, { value: "health", label: "Health / Bio" }, { value: "saas", label: "SaaS" }, { value: "ai-ml", label: "AI / ML" },
    { value: "climate", label: "Climate / Energy" }, { value: "edtech", label: "Edtech" }, { value: "ecommerce", label: "E-commerce" }, { value: "other", label: "Other" },
  ]},
  { id: "cheque_min", question: "What is your minimum cheque size (USD)?", type: "number", stage: "profile", required: true, validation: { min: 0 } },
  { id: "cheque_max", question: "What is your maximum cheque size (USD)?", type: "number", stage: "profile", required: true, validation: { min: 0 } },
  { id: "deployment_timeline", question: "What is your typical deployment timeline?", type: "select", stage: "strategy", required: true, options: [
    { value: "0-3", label: "0–3 months" }, { value: "3-6", label: "3–6 months" }, { value: "6-12", label: "6–12 months" }, { value: "12-plus", label: "12+ months" },
  ]},
  { id: "portfolio_count", question: "How many companies are in your current portfolio?", type: "number", stage: "strategy", required: true, validation: { min: 0 } },
  { id: "geography", question: "What is your preferred geography?", type: "select", stage: "strategy", required: true, options: [
    { value: "north-america", label: "North America" }, { value: "europe", label: "Europe" }, { value: "asia", label: "Asia" }, { value: "global", label: "Global" },
  ]},
  { id: "follow_on_strategy", question: "What is your follow-on investment strategy?", type: "textarea", stage: "strategy", required: true, validation: { minLength: 50 } },
  { id: "value_add", question: "How do you add value to your portfolio companies?", type: "textarea", stage: "strategy", required: true, validation: { minLength: 50 } },
  { id: "decision_timeline", question: "How quickly do you typically make investment decisions?", type: "select", stage: "timeline", required: true, options: [
    { value: "1-2", label: "1–2 weeks" }, { value: "2-4", label: "2–4 weeks" }, { value: "4-8", label: "4–8 weeks" }, { value: "8-plus", label: "8+ weeks" },
  ]},
  { id: "actively_investing", question: "Are you actively investing right now?", type: "select", stage: "timeline", required: true, options: [
    { value: "yes", label: "Yes" }, { value: "not-yet", label: "Not yet" }, { value: "paused", label: "Paused" },
  ]},
  { id: "looking_for_deals", question: "Are you currently looking for new deals?", type: "boolean", stage: "timeline", required: true },
];

const questionFlows: Record<string, Question[]> = {
  founder: founderQuestions,
  investor: investorQuestions,
};

const branchingRules: Record<string, BranchingRule[]> = {
  founder: [],
  investor: [
    {
      questionId: "actively_investing",
      conditions: [
        { ifValue: "not-yet", skipQuestions: ["looking_for_deals"] },
        { ifValue: "paused", skipQuestions: ["looking_for_deals"] },
      ],
    },
  ],
};

export function getQuestions(type: string): Question[] {
  return (questionFlows[type] ?? []).map((q) => ({
    ...q,
    showIf: undefined,
  }));
}

export function getBranchingRules(type: string): BranchingRule[] {
  return branchingRules[type] ?? [];
}

export function applyBranching(questions: Question[], answers: Record<string, unknown>, type: string): Question[] {
  const rules = getBranchingRules(type);
  const toRemove = new Set<string>();

  for (const rule of rules) {
    const answerValue = answers[rule.questionId];
    if (answerValue === undefined || answerValue === null) continue;

    for (const condition of rule.conditions) {
      if (answerValue === condition.ifValue) {
        for (const skipId of condition.skipQuestions) {
          toRemove.add(skipId);
        }
      }
    }
  }

  return questions.filter((q) => !toRemove.has(q.id));
}

export function getNextQuestion(currentIndex: number, totalQuestions: number): number | null {
  const nextIndex = currentIndex + 1;
  return nextIndex >= totalQuestions ? null : nextIndex;
}
