import type { LeadType, Question } from "../types/lead.types.js";

export interface StartLeadRequest {
  type: LeadType;
}

export interface StartLeadResponse {
  session_id: string;
  flow_type: LeadType;
  total_questions: number;
  first_question: Question | null;
}
