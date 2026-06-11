import type { CreateLeadScoreInput } from "../../shared/types/index.js";
import * as leadScoresRepository from "../../shared/db/repositories/leadScores.repository.js";
import * as leadsRepository from "../../shared/db/repositories/leads.repository.js";
import { calculateScore as calcEngine, getBucket } from "./engine/scoring-service.js";
import type { ScoreDimension, ScoreBucket } from "./engine/score-types.js";

export type { ScoreDimension, ScoreBucket };

/**
 * Legacy compatibility — wraps the configurable engine into the old
 * { total, dimensions } format used by qualification.routes.ts.
 */
export function calculateFounderScore(
  answers: Record<string, unknown>
): { total: number; dimensions: ScoreDimension[] } {
  const output = calcEngine("founder", answers);
  return { total: output.total, dimensions: output.dimensions };
}

export function calculateInvestorScore(
  answers: Record<string, unknown>
): { total: number; dimensions: ScoreDimension[] } {
  const output = calcEngine("investor", answers);
  return { total: output.total, dimensions: output.dimensions };
}

export function calculateScore(
  type: string,
  answers: Record<string, unknown>
): { total: number; dimensions: ScoreDimension[] } {
  const output = calcEngine(type, answers);
  return { total: output.total, dimensions: output.dimensions };
}

export { getBucket };

export async function persistScores(
  leadId: string,
  total: number,
  dimensions: ScoreDimension[]
): Promise<void> {
  await leadScoresRepository.deleteByLeadId(leadId);

  const inputs: CreateLeadScoreInput[] = dimensions.map((d) => ({
    lead_id: leadId,
    dimension: d.dimension,
    score: d.score,
    weight: d.weight,
    rationale: d.rationale,
  }));

  if (inputs.length > 0) {
    await leadScoresRepository.createMany(inputs);
  }

  const bucket = getBucket(total);
  await leadsRepository.updateScore(leadId, total, bucket);
}
