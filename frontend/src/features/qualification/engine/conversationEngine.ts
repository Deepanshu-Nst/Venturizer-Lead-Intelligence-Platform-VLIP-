import type { Question, FlowType } from "@/features/qualification/types";
import type { BranchingRule } from "@/features/qualification/types";
import { getFlow, getBranchingRules } from "./questionRegistry";

export interface BuildFlowOptions {
  flowType: FlowType;
  answers: Record<string, unknown>;
}

export function applyBranching(
  questions: Question[],
  answers: Record<string, unknown>,
  rules: BranchingRule[]
): Question[] {
  const toRemove = new Set<string>();

  for (const rule of rules) {
    const answerValue = answers[rule.questionId];
    if (answerValue === undefined || answerValue === null) continue;

    for (const condition of rule.conditions) {
      const op = condition.operator || "eq";
      let match = false;

      if (op === "eq") {
        match = answerValue === condition.ifValue;
      } else if (op === "gt") {
        match = Number(answerValue) > Number(condition.ifValue);
      } else if (op === "gte") {
        match = Number(answerValue) >= Number(condition.ifValue);
      } else if (op === "lt") {
        match = Number(answerValue) < Number(condition.ifValue);
      } else if (op === "lte") {
        match = Number(answerValue) <= Number(condition.ifValue);
      } else if (op === "in" && Array.isArray(condition.ifValue)) {
        match = condition.ifValue.includes(answerValue);
      }

      if (match) {
        for (const skipId of condition.skipQuestions) {
          toRemove.add(skipId);
        }
      }
    }
  }

  return questions.filter((q) => !toRemove.has(q.id));
}

export function buildQuestionFlow(options: BuildFlowOptions): Question[] {
  const flow = getFlow(options.flowType);
  if (!flow) return [];

  const rules = getBranchingRules(options.flowType);
  return applyBranching(flow.questions, options.answers, rules);
}

export function getNextQuestion(
  questions: Question[],
  currentIndex: number
): { question: Question; index: number; isComplete: boolean } {
  const nextIndex = currentIndex + 1;

  if (nextIndex >= questions.length) {
    return { question: questions[questions.length - 1]!, index: nextIndex, isComplete: true };
  }

  return {
    question: questions[nextIndex]!,
    index: nextIndex,
    isComplete: false,
  };
}

export function getPrevQuestion(
  questions: Question[],
  currentIndex: number
): { question: Question; index: number; isAtStart: boolean } {
  const prevIndex = currentIndex - 1;

  if (prevIndex < 0) {
    return { question: questions[0]!, index: 0, isAtStart: true };
  }

  return {
    question: questions[prevIndex]!,
    index: prevIndex,
    isAtStart: false,
  };
}
