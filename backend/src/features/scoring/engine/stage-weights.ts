export type StageWeightMap = Record<string, number>;

// Total should be 100 per stage
const founderStageWeights: Record<string, StageWeightMap> = {
  idea: {
    founder_market_fit: 40,
    problem_market: 30,
    evidence_quality: 20,
    mvp_readiness: 10,
    funding_readiness: 0,
    traction: 0,
  },
  prototype: {
    founder_market_fit: 30,
    problem_market: 20,
    mvp_readiness: 20,
    evidence_quality: 10,
    funding_readiness: 10,
    traction: 10,
  },
  mvp: {
    founder_market_fit: 15,
    problem_market: 15,
    mvp_readiness: 20,
    evidence_quality: 10,
    funding_readiness: 10,
    traction: 30,
  },
  revenue: {
    traction: 60,
    funding_readiness: 15,
    mvp_readiness: 10,
    problem_market: 5,
    founder_market_fit: 5,
    evidence_quality: 5,
  },
};

export function getStageWeight(
  type: string,
  dimension: string,
  stage: string
): number | undefined {
  if (type === "investor") {
    // Investor rules use their built-in default weights
    return undefined;
  }

  const s = stage.toLowerCase() || "idea";
  const stageMap = founderStageWeights[s] || founderStageWeights["idea"];
  
  // Return the mapped weight, or undefined if not mapped (e.g. team/experience which are excluded via score-rules)
  return stageMap[dimension];
}
