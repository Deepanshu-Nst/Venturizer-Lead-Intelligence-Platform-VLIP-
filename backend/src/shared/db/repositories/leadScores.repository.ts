import { query } from "../pool.js";
import type { LeadScore, CreateLeadScoreInput } from "../../types/index.js";

const SELECT = "SELECT * FROM lead_scores";

export async function findByLeadId(leadId: string): Promise<LeadScore[]> {
  const result = await query<LeadScore>(
    `${SELECT} WHERE lead_id = $1 ORDER BY weight DESC`,
    [leadId]
  );
  return result.rows;
}

export async function create(input: CreateLeadScoreInput): Promise<LeadScore> {
  const result = await query<LeadScore>(
    `INSERT INTO lead_scores (lead_id, dimension, score, weight, rationale)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [input.lead_id, input.dimension, input.score, input.weight, input.rationale ?? null]
  );
  return result.rows[0];
}

export async function createMany(inputs: CreateLeadScoreInput[]): Promise<LeadScore[]> {
  if (inputs.length === 0) return [];

  const values: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  for (const input of inputs) {
    values.push(
      `($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`
    );
    params.push(input.lead_id, input.dimension, input.score, input.weight, input.rationale ?? null);
  }

  const result = await query<LeadScore>(
    `INSERT INTO lead_scores (lead_id, dimension, score, weight, rationale)
     VALUES ${values.join(", ")} RETURNING *`,
    params
  );
  return result.rows;
}

export async function deleteByLeadId(leadId: string): Promise<void> {
  await query("DELETE FROM lead_scores WHERE lead_id = $1", [leadId]);
}
