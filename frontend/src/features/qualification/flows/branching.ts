import type { BranchingRule } from "@/features/qualification/types";

export const founderBranching: BranchingRule[] = [];

export const investorBranching: BranchingRule[] = [
  {
    questionId: "actively_investing",
    conditions: [
      { ifValue: "not-yet", skipQuestions: ["looking_for_deals"] },
      { ifValue: "paused", skipQuestions: ["looking_for_deals"] },
    ],
  },
];
