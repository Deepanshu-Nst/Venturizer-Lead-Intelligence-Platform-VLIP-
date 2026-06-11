import type { PoolClient } from "../../../shared/db/pool.js";
import type { Lead, CreateLeadInput } from "../../../shared/types/index.js";
import * as leadsRepo from "../../../shared/db/repositories/leads.repository.js";

export async function findById(id: string): Promise<Lead | null> {
  return leadsRepo.findById(id);
}

export async function create(input: CreateLeadInput, client?: PoolClient): Promise<Lead> {
  return leadsRepo.create(input, client);
}

export async function findByEmail(email: string): Promise<Lead | null> {
  return leadsRepo.findByEmail(email);
}

export async function updateScore(
  id: string,
  score: number,
  bucket: string
): Promise<Lead | null> {
  return leadsRepo.updateScore(id, score, bucket);
}

export { type Lead };
