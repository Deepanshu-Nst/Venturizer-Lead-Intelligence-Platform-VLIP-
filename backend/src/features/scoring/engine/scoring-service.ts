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
      return "Immediate outreach + program";
    case "good":
      return "Standard follow-up";
    case "maybe":
      return "Request clarification";
    case "low":
      return "Polite rejection";
  }
}

export function getExplanation(bucket: ScoreBucket): string {
  switch (bucket) {
    case "hot":
      return "Score 80-100: Top tier fit for immediate outreach and program inclusion.";
    case "good":
      return "Score 60-79: Solid profile warranting standard follow-up and engagement.";
    case "maybe":
      return "Score 40-59: Unclear or borderline fit, request clarification.";
    case "low":
      return "Score 0-39: Below threshold for current mandate, send polite rejection.";
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

  const total = Math.round(Math.max(0, Math.min(
    dimensions.reduce((sum, d) => sum + d.score, 0),
    100
  )));

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
