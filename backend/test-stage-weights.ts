import { calculateScore } from "./src/features/scoring/scoring.service.js";


const ideaAnswers = {
  startup_name: "IdeaCo",
  mvp_status: "idea",
  problem_statement: "This is a really big problem statement that has more than 20 characters.",
  target_customer: "A very specific target customer",
  industry: "saas",
  active_users: 0,
  monthly_revenue: 0,
  growth_rate: 0,
  idea_insight: "yes",
};

const mvpAnswers = {
  startup_name: "MVPCo",
  mvp_status: "mvp",
  problem_statement: "This is a really big problem statement that has more than 20 characters.",
  target_customer: "A very specific target customer",
  industry: "saas",
  active_users: 100,
  monthly_revenue: 500,
  growth_rate: 10,
  mvp_active_users: 100,
};

const revenueAnswers = {
  startup_name: "RevCo",
  mvp_status: "revenue",
  problem_statement: "This is a really big problem statement that has more than 20 characters.",
  target_customer: "A very specific target customer",
  industry: "saas",
  active_users: 5000,
  monthly_revenue: 50000,
  growth_rate: 20,
  mvp_active_users: 5000,
};

console.log("=== IDEA FOUNDER ===");
console.log(JSON.stringify(calculateScore("founder", ideaAnswers), null, 2));

console.log("\n=== MVP FOUNDER ===");
console.log(JSON.stringify(calculateScore("founder", mvpAnswers), null, 2));

console.log("\n=== REVENUE FOUNDER ===");
console.log(JSON.stringify(calculateScore("founder", revenueAnswers), null, 2));
