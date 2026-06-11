export type ScoreBucket = "hot" | "good" | "maybe" | "low";
export type LeadType = "founder" | "investor";

export interface ScoreResult {
  score: number;
  maxScore: number;
  rationale: string;
}

export interface ScoreRule {
  dimension: string;
  weight: number;
  evaluator: (answers: Record<string, unknown>) => ScoreResult;
}

export interface ScoreDimension {
  dimension: string;
  score: number;
  weight: number;
  maxScore: number;
  rationale: string;
}

export interface ScoreOutput {
  total: number;
  maxTotal: number;
  bucket: ScoreBucket;
  dimensions: ScoreDimension[];
  reasons: string[];
  recommendation: string;
}
