import type { ScoreRule, ScoreOutput, ScoreDimension, ScoreBucket } from "./score-types.js";
import { getRules } from "./score-rules.js";
import { detectSubmissionVersion, normalizeAnswersForScoring } from "./version-detector.js";
import { getStageWeight } from "./stage-weights.js";

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
  rawAnswers: Record<string, unknown>
): ScoreOutput {
  const version = detectSubmissionVersion(rawAnswers);
  const answers = normalizeAnswersForScoring(rawAnswers, version);

  const dimensions: ScoreDimension[] = [];

  const isFounder = "startup_name" in answers;
  const stage = String(answers.mvp_status || "idea");
  const type = isFounder ? "founder" : "investor";

  for (const rule of rules) {
    const result = rule.evaluator(answers, version);
    
    // Apply Stage-Aware Weight overrides
    let activeWeight = rule.weight;
    let activeMaxScore = result.maxScore;
    let activeScore = result.score;
    let isExcluded = result.excluded;
    let activeRationale = result.rationale;
    
    const stageWeight = getStageWeight(type, rule.dimension, stage);
    if (stageWeight !== undefined) {
      activeWeight = stageWeight;
      
      if (activeWeight === 0) {
        isExcluded = true;
        activeRationale = "Excluded from scoring (not applicable for this stage)";
        activeMaxScore = 0;
        activeScore = 0;
      } else {
        // If we have a new weight, we must scale the score fraction to this new weight
        const fraction = result.maxScore > 0 ? result.score / result.maxScore : 0;
        activeScore = fraction * activeWeight;
        activeMaxScore = activeWeight;
      }
    }

    dimensions.push({
      dimension: rule.dimension,
      score: Math.round(activeScore),
      weight: Math.round(activeWeight),
      maxScore: Math.round(activeMaxScore),
      rationale: activeRationale,
      excluded: isExcluded,
    });
  }

  const includedDimensions = dimensions.filter(d => !d.excluded);


  const rawMaxTotal = includedDimensions.reduce((sum, d) => sum + d.maxScore, 0);

  let multiplier = 1;
  if (rawMaxTotal > 0) {
    multiplier = 100 / rawMaxTotal;
  }

  // Scale the included dimensions so their individual max scores visibly sum to 100
  let accumulatedMax = 0;
  let accumulatedScore = 0;
  
  for (let i = 0; i < includedDimensions.length; i++) {
    const d = includedDimensions[i];
    
    // Scale maxScore
    let scaledMax = Math.round(d.maxScore * multiplier);
    // Adjust last element to perfectly hit 100 to avoid rounding gaps
    if (i === includedDimensions.length - 1 && rawMaxTotal > 0) {
      scaledMax = 100 - accumulatedMax;
    }
    
    // Scale achieved score proportionally
    const achievedFraction = d.maxScore > 0 ? d.score / d.maxScore : 0;
    const scaledScore = Math.round(scaledMax * achievedFraction);
    
    d.maxScore = scaledMax;
    d.weight = scaledMax;
    d.score = scaledScore;
    
    accumulatedMax += scaledMax;
    accumulatedScore += scaledScore;
  }

  const total = rawMaxTotal > 0 ? accumulatedScore : 0;
  const maxTotal = rawMaxTotal > 0 ? 100 : 0;

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
