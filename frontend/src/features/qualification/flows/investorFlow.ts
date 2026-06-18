import type { Question, QuestionFlow } from "@/features/qualification/types";

const investorQuestions: Question[] = [
  // --- EVERYONE (10 questions) ---
  {
    id: "full_name",
    question: "What is your full name?",
    type: "text",
    stage: "personal",
    required: true,
    validation: { minLength: 2 },
  },
  {
    id: "email",
    question: "What is your email address?",
    type: "email",
    stage: "personal",
    required: true,
  },
  {
    id: "linkedin",
    question: "What is your LinkedIn profile URL?",
    type: "url",
    stage: "personal",
    required: true,
    validation: { pattern: "linkedin.com" },
  },
  {
    id: "investor_type",
    question: "What type of investor are you?",
    type: "select",
    stage: "profile",
    required: true,
    options: [
      { value: "angel", label: "Angel Investor" },
      { value: "vc", label: "Venture Capital" },
      { value: "family-office", label: "Family Office" },
      { value: "corporate", label: "Corporate VC" },
      { value: "operator-angel", label: "Operator Angel" }
    ],
  },
  {
    id: "preferred_stage",
    question: "What stage do you typically invest in?",
    type: "select",
    stage: "profile",
    required: true,
    options: [
      { value: "pre-seed", label: "Pre-seed" },
      { value: "seed", label: "Seed" },
      { value: "series-a", label: "Series A" },
      { value: "series-b-plus", label: "Series B+" },
    ],
  },
  {
    id: "sector_focus",
    question: "Which sectors are you focused on?",
    type: "multiselect",
    stage: "profile",
    required: true,
    options: [
      { value: "fintech", label: "Fintech" },
      { value: "health", label: "Health / Bio" },
      { value: "saas", label: "SaaS" },
      { value: "ai-ml", label: "AI / ML" },
      { value: "climate", label: "Climate / Energy" },
      { value: "edtech", label: "Edtech" },
      { value: "ecommerce", label: "E-commerce" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "cheque_min",
    question: "What is your minimum cheque size (USD)?",
    type: "number",
    stage: "profile",
    required: true,
    validation: { min: 0 },
  },
  {
    id: "cheque_max",
    question: "What is your maximum cheque size (USD)?",
    type: "number",
    stage: "profile",
    required: true,
    validation: { min: 0, minField: "cheque_min" },
  },
  {
    id: "portfolio_count",
    question: "How many companies are in your current portfolio?",
    type: "number",
    stage: "strategy",
    required: true,
    validation: { min: 0 },
  },
  {
    id: "actively_investing",
    question: "Are you actively investing right now?",
    type: "select",
    stage: "strategy",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "not-yet", label: "Not yet" },
      { value: "paused", label: "Paused" },
    ],
  },
  // --- ANGEL (2 questions) ---
  {
    id: "angel_why_invest",
    question: "Why do you invest in startups?",
    type: "textarea",
    stage: "strategy",
    required: false,
  },
  {
    id: "angel_founder_traits",
    question: "What founder traits matter most to you?",
    type: "textarea",
    stage: "strategy",
    required: false,
  },
  // --- VC (2 questions) ---
  {
    id: "vc_themes",
    question: "What themes are you most excited about right now?",
    type: "textarea",
    stage: "strategy",
    required: false,
  },
  {
    id: "vc_meeting_signal",
    question: "What signal gets you interested enough to take a meeting?",
    type: "textarea",
    stage: "strategy",
    required: false,
  },
  // --- FAMILY OFFICE (2 questions) ---
  {
    id: "fo_time_horizon",
    question: "What time horizon do you optimize for?",
    type: "textarea",
    stage: "strategy",
    required: false,
  },
  {
    id: "fo_success_outcome",
    question: "What outcome makes an investment successful for you?",
    type: "textarea",
    stage: "strategy",
    required: false,
  },
  // --- CORPORATE VC (2 questions) ---
  {
    id: "cvc_strategic_thesis",
    question: "What strategic themes or business areas are you actively investing around?",
    type: "textarea",
    stage: "strategy",
    required: false,
  },
  {
    id: "cvc_support_model",
    question: "Beyond capital, how can your organization help startups succeed?",
    type: "textarea",
    stage: "strategy",
    required: false,
  },
  // --- OPERATOR ANGEL (1 question) ---
  {
    id: "oa_value_provided",
    question: "What specific value do you provide to founders?",
    type: "textarea",
    stage: "strategy",
    required: false,
  },
  // --- FINAL (EVERYONE) ---
  {
    id: "investment_thesis",
    question: "Upload your investment thesis or investment mandate (optional)",
    type: "file",
    stage: "strategy",
    required: false,
    helperText: "PDF only, max 10MB.",
  },
];

export const investorFlow: QuestionFlow = {
  type: "investor",
  title: "Investor Qualification",
  description:
    "Help us understand your investment thesis so we can surface the best opportunities.",
  questions: investorQuestions,
  totalQuestions: investorQuestions.length,
  stages: ["personal", "profile", "strategy"],
};
