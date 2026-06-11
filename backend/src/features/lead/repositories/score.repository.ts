import type { LeadScore, CreateLeadScoreInput } from "../../../shared/types/index.js";
import * as scoresRepo from "../../../shared/db/repositories/leadScores.repository.js";

export async function findByLeadId(leadId: string): Promise<LeadScore[]> {
  return scoresRepo.findByLeadId(leadId);
}

export async function createMany(inputs: CreateLeadScoreInput[]): Promise<LeadScore[]> {
  return scoresRepo.createMany(inputs);
}

export async function deleteByLeadId(leadId: string): Promise<void> {
  return scoresRepo.deleteByLeadId(leadId);
}

export { type LeadScore };
