import type { ScoreBucket, ScoreDimension } from "../types/lead.types.js";

export interface SubmitRequest {
  sessionId: string;
  type: "founder" | "investor";
  answers: Record<string, unknown>;
}

export interface SubmitResponse {
  lead_id: string;
  score: number;
  bucket: ScoreBucket;
  dimensions: ScoreDimension[];
  reasons: string[];
  recommendation: string;
}
