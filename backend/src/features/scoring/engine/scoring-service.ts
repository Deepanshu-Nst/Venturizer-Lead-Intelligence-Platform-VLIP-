import type { ScoreRule, ScoreOutput, ScoreDimension, ScoreBucket } from "./score-types.js";
import { getRules } from "./score-rules.js";

export function getBucket(score: number): ScoreBucket {
  if (score >= 70) return "hot";
  if (score >= 45) return "good";
  if (score >= 25) return "maybe";
  return "low";
}

export function getRecommendation(bucket: ScoreBucket): string {
  switch (bucket) {
    case "hot":
      return "Schedule intro call within 24 hours";
    case "good":
      return "Nurture with weekly check-ins and targeted content";
    case "maybe":
      return "Revisit in 30 days after additional engagement";
    case "low":
      return "Low priority — monitor for changes in activity";
  }
}

export function getExplanation(bucket: ScoreBucket): string {
  switch (bucket) {
    case "hot":
      return "Strong venture-fit profile with significant execution evidence.";
    case "good":
      return "Promising founder with measurable progress and moderate venture readiness.";
    case "maybe":
      return "Early-stage opportunity requiring additional validation.";
    case "low":
      return "Currently below investment readiness thresholds.";
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
      score: Math.round(result.score),
      weight: Math.round(rule.weight),
      maxScore: Math.round(result.maxScore),
      rationale: result.rationale,
    });
  }

  const total = Math.round(Math.min(
    dimensions.reduce((sum, d) => sum + d.score, 0),
    100
  ));

  const maxTotal = Math.min(
    dimensions.reduce((sum, d) => sum + d.weight, 0),
    100
  );

  const bucket = getBucket(total);

  const reasons = dimensions.map(
    (d) => `${d.dimension}: ${d.score}/${d.maxScore} — ${d.rationale}`
  );

  const recommendation = getRecommendation(bucket);
  const explanation = getExplanation(bucket);

  return { total, maxTotal, bucket, dimensions, reasons, recommendation, explanation };
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
