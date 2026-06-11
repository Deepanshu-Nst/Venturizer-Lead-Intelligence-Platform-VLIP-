import type { Question, QuestionFlow, Stage } from "@/features/qualification/types";
import { founderFlow } from "@/features/qualification/flows/founderFlow";
import { investorFlow } from "@/features/qualification/flows/investorFlow";
import { founderBranching, investorBranching } from "@/features/qualification/flows/branching";

const flows: Record<string, QuestionFlow> = {
  founder: founderFlow,
  investor: investorFlow,
};

const branchingRules: Record<string, typeof founderBranching> = {
  founder: founderBranching,
  investor: investorBranching,
};

export function getQuestionById(id: string, flowType: string): Question | undefined {
  const flow = flows[flowType];
  if (!flow) return undefined;
  return flow.questions.find((q) => q.id === id);
}

export function getFlowStages(flowType: string): Stage[] {
  const flow = flows[flowType];
  if (!flow) return [];
  const seen = new Set<Stage>();
  const stages: Stage[] = [];
  for (const q of flow.questions) {
    if (!seen.has(q.stage)) {
      seen.add(q.stage);
      stages.push(q.stage);
    }
  }
  return stages;
}

export function getStageLabel(stage: Stage): string {
  const labels: Record<Stage, string> = {
    personal: "Personal Info",
    background: "Background",
    startup: "Startup",
    product: "Product",
    traction: "Traction",
    team: "Team",
    fundraising: "Fundraising",
    profile: "Profile",
    strategy: "Strategy",
    timeline: "Timeline",
    materials: "Materials",
  };
  return labels[stage] || stage;
}

export function getFlow(flowType: string): QuestionFlow | undefined {
  return flows[flowType];
}

export function getBranchingRules(flowType: string) {
  return branchingRules[flowType] || [];
}
