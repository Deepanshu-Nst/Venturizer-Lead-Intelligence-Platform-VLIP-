import type { ScoreRule, ScoreOutput, ScoreDimension, ScoreBucket } from "./score-types.js";
import { getRules } from "./score-rules.js";

export function getBucket(score: number): ScoreBucket {
  if (score >= 80) return "hot";
  if (score >= 60) return "good";
  if (score >= 40) return "maybe";
  return "low";
}

export function getRecommendation(bucket: ScoreBucket): string {
  switch (bucket) {
    case "hot":
      return "High-priority lead. Schedule immediate personal outreach.";
    case "good":
      return "Strong candidate. Begin nurture sequence.";
    case "maybe":
      return "Moderate potential. Monitor and re-engage in 30 days.";
    case "low":
      return "Early stage. Move to long-term nurture pipeline.";
  }
}

export function calculateWithRules(
  rules: ScoreRule[],
  answers: Record<string, unknown>
): ScoreOutput {
  const dimensions: ScoreDimension[] = [];

  for (const rule of rules) {
    const result = rule.evaluator(answers);
    dimensions.push({
      dimension: rule.dimension,
      score: result.score,
      weight: rule.weight,
      maxScore: result.maxScore,
      rationale: result.rationale,
    });
  }

  const total = Math.min(
    dimensions.reduce((sum, d) => sum + d.score, 0),
    100
  );

  const maxTotal = Math.min(
    dimensions.reduce((sum, d) => sum + d.weight, 0),
    100
  );

  const bucket = getBucket(total);

  const reasons = dimensions.map(
    (d) => `${d.dimension}: ${d.score}/${d.maxScore} — ${d.rationale}`
  );

  const recommendation = getRecommendation(bucket);

  return { total, maxTotal, bucket, dimensions, reasons, recommendation };
}

export function calculateScore(
  type: string,
  answers: Record<string, unknown>
): ScoreOutput {
  const rules = getRules(type);
  return calculateWithRules(rules, answers);
}

export function recalculate(
  type: string,
  answers: Record<string, unknown>,
  overrides?: Partial<{
    rules: ScoreRule[];
    bucketThresholds: Record<ScoreBucket, number>;
  }>
): ScoreOutput {
  if (overrides?.rules) {
    return calculateWithRules(overrides.rules, answers);
  }
  return calculateScore(type, answers);
}
