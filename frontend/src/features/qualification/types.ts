export type FlowType = "founder" | "investor";

export type QuestionType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "number"
  | "select"
  | "multiselect"
  | "textarea"
  | "boolean"
  | "file";

export type Stage =
  | "personal"
  | "background"
  | "startup"
  | "product"
  | "traction"
  | "team"
  | "fundraising"
  | "profile"
  | "strategy"
  | "timeline"
  | "materials";

export type ScoreBucket = "hot" | "good" | "maybe" | "low";

export interface Validation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minField?: string;
}

export interface QuestionOption {
  value: string;
  label: string;
}

export interface ShowIf {
  questionId: string;
  value: unknown;
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

export interface QuestionFlow {
  type: FlowType;
  title: string;
  description: string;
  questions: Question[];
  totalQuestions: number;
  stages: Stage[];
}

export interface Answer {
  questionId: string;
  value: string | string[] | number | boolean | null;
}

export interface MachineState {
  flowType: FlowType | null;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, unknown>;
  visited: string[];
  isComplete: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  sessionId: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export type MachineAction =
  | { type: "SELECT_FLOW"; flowType: FlowType }
  | { type: "ANSWER"; questionId: string; value: unknown }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "GO_TO_QUESTION"; index: number }
  | { type: "RESUME"; state: MachineState }
  | { type: "RESET" }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_DONE"; sessionId: string }
  | { type: "SUBMIT_ERROR"; error: string }
  | { type: "CLEAR_SUBMIT_ERROR" };

export interface PersistedSession {
  flowType: FlowType;
  currentIndex: number;
  answers: Record<string, unknown>;
  visited: string[];
  sessionId: string | null;
  startedAt: string | null;
}

export interface BranchingRule {
  questionId: string;
  conditions: BranchCondition[];
}

export interface BranchCondition {
  operator?: "eq" | "gt" | "gte" | "lt" | "lte" | "in";
  ifValue: unknown;
  skipQuestions: string[];
}

export interface ValidationError {
  field: string;
  message: string;
}
