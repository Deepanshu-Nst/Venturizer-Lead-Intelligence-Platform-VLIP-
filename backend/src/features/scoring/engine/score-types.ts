export type ScoreBucket = "hot" | "good" | "maybe" | "low";
export type LeadType = "founder" | "investor";

export interface ScoreResult {
  score: number;
  maxScore: number;
  rationale: string;
  excluded?: boolean;
}

export interface ScoreRule {
  dimension: string;
  weight: number;
  evaluator: (answers: Record<string, unknown>, version: "legacy" | "v2.1" | "v2.2") => ScoreResult;
}

export interface ScoreDimension {
  dimension: string;
  score: number;
  weight: number;
  maxScore: number;
  rationale: string;
  excluded?: boolean;
}

export interface ScoreOutput {
  total: number;
  maxTotal: number;
  bucket: ScoreBucket;
  dimensions: ScoreDimension[];
  reasons: string[];
  recommendation: string;
  explanation: string;
}
