import type { BranchingRule } from "@/features/qualification/types";

const ideaQuestions = ["idea_why_now", "idea_insight", "idea_biggest_assumption", "idea_why_right_person"];
const prototypeQuestions = ["prototype_what_built", "prototype_who_tested", "prototype_surprising_feedback", "prototype_next_milestone"];
const mvpQuestions = ["mvp_active_users", "mvp_weekly_metric", "mvp_why_return", "mvp_biggest_blocker"];
const revenueQuestions = ["monthly_revenue", "growth_rate", "revenue_acquisition_channel", "revenue_biggest_bottleneck", "revenue_post_raise_plan"];

const angelQuestions = ["angel_why_invest", "angel_founder_traits"];
const vcQuestions = ["vc_themes", "vc_meeting_signal"];
const foQuestions = ["fo_time_horizon", "fo_success_outcome"];
const oaQuestions = ["oa_value_provided"];
const cvcQuestions = ["cvc_strategic_thesis", "cvc_support_model"];

export const founderBranching: BranchingRule[] = [
  {
    questionId: "mvp_status",
    conditions: [
      { 
        ifValue: "idea", 
        skipQuestions: [...prototypeQuestions, ...mvpQuestions, ...revenueQuestions] 
      },
      { 
        ifValue: "prototype", 
        skipQuestions: [...ideaQuestions, ...mvpQuestions, ...revenueQuestions] 
      },
      { 
        ifValue: "mvp", 
        skipQuestions: [...ideaQuestions, ...prototypeQuestions, ...revenueQuestions] 
      },
      { 
        ifValue: "revenue", 
        skipQuestions: [...ideaQuestions, ...prototypeQuestions, ...mvpQuestions] 
      },
    ],
  }
];

export const investorBranching: BranchingRule[] = [
  {
    questionId: "investor_type",
    conditions: [
      { ifValue: "angel", skipQuestions: [...vcQuestions, ...foQuestions, ...oaQuestions, ...cvcQuestions] },
      { ifValue: "vc", skipQuestions: [...angelQuestions, ...foQuestions, ...oaQuestions, ...cvcQuestions] },
      { ifValue: "family-office", skipQuestions: [...angelQuestions, ...vcQuestions, ...oaQuestions, ...cvcQuestions] },
      { ifValue: "corporate", skipQuestions: [...angelQuestions, ...vcQuestions, ...foQuestions, ...oaQuestions] },
      { ifValue: "operator-angel", skipQuestions: [...angelQuestions, ...vcQuestions, ...foQuestions, ...cvcQuestions] }
    ]
  }
];
