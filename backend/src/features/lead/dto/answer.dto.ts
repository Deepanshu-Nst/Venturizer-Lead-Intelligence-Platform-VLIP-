import type { Question } from "../types/lead.types.js";

export interface AnswerRequest {
  sessionId: string;
  questionId: string;
  value: string | number | boolean | string[] | null;
}

export interface AnswerResponse {
  session_id: string;
  question_id: string;
  value: unknown;
  next_question: Question | null;
  is_complete: boolean;
}
