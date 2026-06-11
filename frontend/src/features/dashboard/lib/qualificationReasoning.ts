import type { ScoreDimension, LeadDetail, QualificationSummary, ScoreBucket } from "@/features/dashboard/types/dashboard";

export function generateQualificationSummary(lead: LeadDetail): QualificationSummary {
  const strengths: string[] = [];
  const concerns: string[] = [];
  let explanation: string;

  if (lead.type === "founder") {
    analyzeFounderScores(lead.scores, strengths, concerns);
    explanation = generateFounderExplanation(lead.scores, lead.score_bucket);
  } else {
    analyzeInvestorScores(lead.scores, strengths, concerns);
    explanation = generateInvestorExplanation(lead.scores, lead.score_bucket);
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

  const exp = scoreMap.founder_experience;
  if (exp) {
    if (exp.score >= exp.weight * 0.6) {
      strengths.push("Strong founding experience with relevant industry background");
    } else if (exp.score < exp.weight * 0.4) {
      concerns.push("Limited prior startup or industry experience");
    }
  }

  const ind = scoreMap.industry_knowledge;
  if (ind) {
    if (ind.score >= ind.weight * 0.6) {
      strengths.push("Deep understanding of the problem space and target customer");
    } else if (ind.score < ind.weight * 0.4) {
      concerns.push("Problem statement needs more clarity and specificity");
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
      strengths.push("Early traction signals with growing user adoption and revenue");
    } else {
      concerns.push("Limited traction data available to validate market demand");
    }
  }

  const team = scoreMap.team_strength;
  if (team) {
    if (team.score >= team.weight * 0.6) {
      strengths.push("Well-structured team with co-founder dynamic");
    } else if (team.score < team.weight * 0.4) {
      concerns.push("Solo founder — team building is a key risk factor");
    }
  }

  const val = scoreMap.validation;
  if (val && val.score < val.weight * 0.4) {
    concerns.push("Market validation signals are still emerging");
  }

  const fund = scoreMap.funding_readiness;
  if (fund) {
    if (fund.score >= fund.weight * 0.6) {
      strengths.push("Funding-ready with clear raise strategy and full-time commitment");
    } else if (fund.score < fund.weight * 0.4) {
      concerns.push("Funding strategy and commitment level need further evaluation");
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

function generateFounderExplanation(
  scores: ScoreDimension[],
  bucket: ScoreBucket | null
): string {
  const total = scores.reduce((s, d) => s + d.score, 0);
  const maxTotal = scores.reduce((s, d) => s + d.weight, 0);
  const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;

  if (bucket === "hot") {
    return `Strong founder profile scoring ${pct}% overall. Strong product execution, traction signals, and team structure indicate high potential for funding success.`;
  }
  if (bucket === "good") {
    return `Solid founder profile at ${pct}% overall. Good fundamentals with clear progress, though some areas need further development to reach top-tier readiness.`;
  }
  if (bucket === "maybe") {
    return `Moderate founder profile at ${pct}% overall. Early-stage signals present but significant validation and traction milestones remain ahead.`;
  }
  return `Early-stage founder profile at ${pct}% overall. The concept and team are forming but require substantial development before investment readiness.`;
}

function generateInvestorExplanation(
  scores: ScoreDimension[],
  bucket: ScoreBucket | null
): string {
  const total = scores.reduce((s, d) => s + d.score, 0);
  const maxTotal = scores.reduce((s, d) => s + d.weight, 0);
  const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;

  if (bucket === "hot") {
    return `Strong investor profile scoring ${pct}% overall. Active deployment, meaningful cheque capacity, and broad sector focus make this investor highly attractive for deal flow matching.`;
  }
  if (bucket === "good") {
    return `Solid investor profile at ${pct}% overall. Good alignment with investment criteria though deployment capacity or portfolio experience may be developing.`;
  }
  if (bucket === "maybe") {
    return `Moderate investor profile at ${pct}% overall. Investment thesis is defined but engagement levels or deployment history require further validation.`;
  }
  return `Early-stage investor profile at ${pct}% overall. Investment criteria are forming but active deployment track record is not yet established.`;
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
