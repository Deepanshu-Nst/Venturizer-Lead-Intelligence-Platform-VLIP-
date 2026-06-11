export type LeadType = "founder" | "investor";
export type QuestionType =
  | "text" | "email" | "tel" | "url" | "number"
  | "select" | "multiselect" | "textarea" | "boolean" | "file";
export type Stage =
  | "personal" | "background" | "startup" | "product"
  | "traction" | "team" | "fundraising"
  | "profile" | "strategy" | "timeline" | "materials";
export type ScoreBucket = "hot" | "good" | "maybe" | "low";
export type DocumentType = "pitch-deck" | "investment-thesis" | "other";

export interface ShowIf {
  questionId: string;
  value: unknown;
}

export interface Validation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  stage: Stage;
  required: boolean;
  options?: QuestionOption[];
  validation?: Validation;
  placeholder?: string;
  helperText?: string;
  showIf?: ShowIf;
}

export interface BranchingRule {
  questionId: string;
  conditions: BranchCondition[];
}

export interface BranchCondition {
  ifValue: unknown;
  skipQuestions: string[];
}

export interface ScoreDimension {
  dimension: string;
  score: number;
  weight: number;
  maxScore: number;
  rationale: string;
}

export interface LeadSession {
  id: string;
  type: LeadType;
  answers: Record<string, unknown>;
  currentIndex: number;
  startedAt: Date;
  completedAt?: Date;
}
