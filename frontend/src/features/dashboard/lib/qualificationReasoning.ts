import type { ScoreDimension, LeadDetail, QualificationSummary, ScoreBucket } from "@/features/dashboard/types/dashboard";

export function generateQualificationSummary(lead: LeadDetail): QualificationSummary {
  const strengths: string[] = [];
  const concerns: string[] = [];
  let explanation: string;

  if (lead.type === "founder") {
    analyzeFounderScores(lead.scores, strengths, concerns);
    explanation = generateFounderExplanation(lead.score_bucket);
  } else {
    analyzeInvestorScores(lead.scores, strengths, concerns);
    explanation = generateInvestorExplanation(lead.score_bucket);
  }

  const recommendation = generateRecommendation(lead.score_bucket);

  return { strengths, concerns, explanation, recommendation };
}

function analyzeFounderScores(
  scores: ScoreDimension[],
  strengths: string[],
  concerns: string[]
) {
  const scoreMap = toMap(scores);

  const exp = scoreMap.experience;
  if (exp) {
    if (exp.score >= exp.weight * 0.6) {
      strengths.push("Strong founding experience with relevant industry background");
    } else if (exp.score < exp.weight * 0.4) {
      concerns.push("Limited prior startup or industry experience");
    }
  }

  const fit = scoreMap.founder_market_fit;
  if (fit) {
    if (fit.score >= fit.weight * 0.6) {
      strengths.push("Founder background closely aligns with the problem being solved");
    } else if (fit.score < fit.weight * 0.4) {
      concerns.push("Weak connection between founder background and market problem");
    }
  }

  const pm = scoreMap.problem_market;
  if (pm) {
    if (pm.score >= pm.weight * 0.6) {
      strengths.push("Clear problem articulation with well-defined market understanding");
    } else if (pm.score < pm.weight * 0.4) {
      concerns.push("Problem statement and market definition need more specificity");
    }
  }

  const mvp = scoreMap.mvp_readiness;
  if (mvp) {
    if (mvp.score >= mvp.weight * 0.6) {
      strengths.push("Product has progressed beyond idea stage with demonstrated execution");
    } else if (mvp.score < mvp.weight * 0.4) {
      concerns.push("Product is still in early conceptual stages");
    }
  }

  const trac = scoreMap.traction;
  if (trac) {
    if (trac.score >= trac.weight * 0.6) {
      strengths.push("Strong traction signals with growing user adoption and revenue");
    } else if (trac.score >= trac.weight * 0.3) {
      strengths.push("Early traction signals emerging in user adoption or revenue");
    } else {
      concerns.push("Limited traction data available to validate market demand");
    }
  }

  const team = scoreMap.team;
  if (team) {
    if (team.score >= team.weight * 0.6) {
      strengths.push("Well-structured team with co-founder dynamic");
    } else if (team.score < team.weight * 0.4) {
      concerns.push("Solo founder — team building is a key risk factor");
    }
  }

  const fund = scoreMap.funding_readiness;
  if (fund) {
    if (fund.score >= fund.weight * 0.6) {
      strengths.push("Funding-ready with clear raise strategy and full-time commitment");
    } else if (fund.score < fund.weight * 0.4) {
      concerns.push("Funding strategy and commitment level need further evaluation");
    }
  }

  const evidence = scoreMap.evidence_quality;
  if (evidence) {
    if (evidence.score >= evidence.weight * 0.6) {
      strengths.push("High-quality answers with specific, detailed responses throughout");
    } else if (evidence.score < evidence.weight * 0.4) {
      concerns.push("Answers lack sufficient detail — more specificity needed");
    }
  }
}

function analyzeInvestorScores(
  scores: ScoreDimension[],
  strengths: string[],
  concerns: string[]
) {
  const scoreMap = toMap(scores);

  const active = scoreMap.active_investor;
  if (active) {
    if (active.score >= active.weight * 0.6) {
      strengths.push("Actively deploying capital with strong engagement in deal flow");
    } else {
      concerns.push("Limited evidence of active capital deployment right now");
    }
  }

  const cheque = scoreMap.cheque_size;
  if (cheque) {
    if (cheque.score >= cheque.weight * 0.6) {
      strengths.push("Meaningful cheque capacity to lead or co-lead rounds");
    } else {
      concerns.push("Cheque capacity is limited relative to typical round sizes");
    }
  }

  const deploy = scoreMap.deployment_timeline;
  if (deploy) {
    if (deploy.score >= deploy.weight * 0.6) {
      strengths.push("Fast deployment timeline indicates active capital rotation");
    } else {
      concerns.push("Slow deployment timeline may limit near-term investment activity");
    }
  }

  const port = scoreMap.portfolio_quality;
  if (port) {
    if (port.score >= port.weight * 0.6) {
      strengths.push("Experienced investor with a meaningful portfolio of companies");
    } else if (port.score < port.weight * 0.4) {
      concerns.push("Limited or no portfolio track record available");
    }
  }

  const sector = scoreMap.sector_match;
  if (sector) {
    if (sector.score >= sector.weight * 0.6) {
      strengths.push("Broad sector focus aligned with diverse investment opportunities");
    } else {
      concerns.push("Narrow sector focus may limit opportunity pipeline");
    }
  }

  const value = scoreMap.value_add;
  if (value) {
    if (value.score >= value.weight * 0.6) {
      strengths.push("Strong value-add capabilities for portfolio company support");
    } else {
      concerns.push("Value-add proposition needs further definition");
    }
  }
}

function generateFounderExplanation(bucket: ScoreBucket | null): string {
  switch (bucket) {
    case "hot":
      return "Strong venture-fit profile: deep domain expertise, clear problem articulation, and meaningful traction evidence aligned with market opportunity.";
    case "good":
      return "Promising founder with demonstrated competence and early execution progress. Foundational elements are in place but require further scaling validation.";
    case "maybe":
      return "Early-stage opportunity with emerging signals. Core hypothesis needs additional validation through customer development or product iteration.";
    case "low":
      return "Currently below investment readiness thresholds. Significant gaps in problem definition, market understanding, or execution evidence.";
    default:
      return "Awaiting qualification data.";
  }
}

function generateInvestorExplanation(bucket: ScoreBucket | null): string {
  switch (bucket) {
    case "hot":
      return "Strong investor profile with active deployment and meaningful cheque capacity.";
    case "good":
      return "Solid investor with defined thesis and moderate deployment activity.";
    case "maybe":
      return "Early-stage investor with developing criteria and limited track record.";
    case "low":
      return "Investor criteria not yet aligned with active deployment requirements.";
    default:
      return "Awaiting qualification data.";
  }
}

function generateRecommendation(
  bucket: ScoreBucket | null,
): string {
  if (bucket === "hot") return "Schedule intro call within 24 hours";
  if (bucket === "good") return "Nurture with weekly check-ins and targeted content";
  if (bucket === "maybe") return "Revisit in 30 days after additional engagement";
  if (bucket === "low") return "Low priority — monitor for changes in activity";
  return "Awaiting qualification data";
}

function toMap(scores: ScoreDimension[]): Record<string, ScoreDimension> {
  const map: Record<string, ScoreDimension> = {};
  for (const s of scores) {
    map[s.dimension] = s;
  }
  return map;
}
