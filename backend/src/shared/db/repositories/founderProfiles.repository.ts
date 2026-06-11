import { findOne, insertOne } from "./base.repository.js";
import { query } from "../pool.js";
import type { FounderProfile, CreateFounderProfileInput } from "../../types/index.js";

const TABLE = "founder_profiles";
const SELECT = "SELECT * FROM founder_profiles";

export async function findByLeadId(leadId: string): Promise<FounderProfile | null> {
  return findOne<FounderProfile>(`${SELECT} WHERE lead_id = $1`, [leadId]);
}

export async function create(input: CreateFounderProfileInput): Promise<FounderProfile> {
  return insertOne<FounderProfile>(TABLE, {
    lead_id: input.lead_id,
    prev_startup: input.prev_startup ?? null,
    industry_experience: input.industry_experience ?? null,
    commitment: input.commitment ?? null,
    startup_name: input.startup_name ?? null,
    industry: input.industry ?? null,
    problem_statement: input.problem_statement ?? null,
    target_customer: input.target_customer ?? null,
    mvp_status: input.mvp_status ?? null,
    active_users: input.active_users ?? null,
    monthly_revenue: input.monthly_revenue ?? null,
    growth_rate: input.growth_rate ?? null,
    team_size: input.team_size ?? null,
    has_cofounder: input.has_cofounder ?? null,
    funding_ask: input.funding_ask ?? null,
  });
}

export async function upsert(input: CreateFounderProfileInput): Promise<FounderProfile> {
  const existing = await findByLeadId(input.lead_id);
  if (existing) {
    const result = await query<FounderProfile>(
      `UPDATE founder_profiles SET
        prev_startup = COALESCE($1, prev_startup),
        industry_experience = COALESCE($2, industry_experience),
        commitment = COALESCE($3, commitment),
        startup_name = COALESCE($4, startup_name),
        industry = COALESCE($5, industry),
        problem_statement = COALESCE($6, problem_statement),
        target_customer = COALESCE($7, target_customer),
        mvp_status = COALESCE($8, mvp_status),
        active_users = COALESCE($9, active_users),
        monthly_revenue = COALESCE($10, monthly_revenue),
        growth_rate = COALESCE($11, growth_rate),
        team_size = COALESCE($12, team_size),
        has_cofounder = COALESCE($13, has_cofounder),
        funding_ask = COALESCE($14, funding_ask)
      WHERE lead_id = $15 RETURNING *`,
      [
        input.prev_startup ?? null,
        input.industry_experience ?? null,
        input.commitment ?? null,
        input.startup_name ?? null,
        input.industry ?? null,
        input.problem_statement ?? null,
        input.target_customer ?? null,
        input.mvp_status ?? null,
        input.active_users ?? null,
        input.monthly_revenue ?? null,
        input.growth_rate ?? null,
        input.team_size ?? null,
        input.has_cofounder ?? null,
        input.funding_ask ?? null,
        input.lead_id,
      ]
    );
    return result.rows[0];
  }
  return create(input);
}
