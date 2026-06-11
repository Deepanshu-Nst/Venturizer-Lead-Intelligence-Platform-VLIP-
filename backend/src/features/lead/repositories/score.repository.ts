import type { PoolClient } from "../../../shared/db/pool.js";
import type { LeadScore, CreateLeadScoreInput } from "../../../shared/types/index.js";
import * as scoresRepo from "../../../shared/db/repositories/leadScores.repository.js";

export async function findByLeadId(leadId: string): Promise<LeadScore[]> {
  return scoresRepo.findByLeadId(leadId);
}

export async function createMany(inputs: CreateLeadScoreInput[], client?: PoolClient): Promise<LeadScore[]> {
  return scoresRepo.createMany(inputs, client);
}

export async function deleteByLeadId(leadId: string, client?: PoolClient): Promise<void> {
  return scoresRepo.deleteByLeadId(leadId, client);
}

export { type LeadScore };
