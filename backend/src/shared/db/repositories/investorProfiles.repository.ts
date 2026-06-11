import { findOne, insertOne } from "./base.repository.js";
import { query } from "../pool.js";
import type { InvestorProfile, CreateInvestorProfileInput } from "../../types/index.js";

const TABLE = "investor_profiles";
const SELECT = "SELECT * FROM investor_profiles";

export async function findByLeadId(leadId: string): Promise<InvestorProfile | null> {
  return findOne<InvestorProfile>(`${SELECT} WHERE lead_id = $1`, [leadId]);
}

export async function create(input: CreateInvestorProfileInput): Promise<InvestorProfile> {
  return insertOne<InvestorProfile>(TABLE, {
    lead_id: input.lead_id,
    investor_type: input.investor_type ?? null,
    preferred_stage: input.preferred_stage ?? null,
    sector_focus: input.sector_focus ?? null,
    cheque_min: input.cheque_min ?? null,
    cheque_max: input.cheque_max ?? null,
    deployment_timeline: input.deployment_timeline ?? null,
    portfolio_count: input.portfolio_count ?? null,
    geography: input.geography ?? null,
    follow_on_strategy: input.follow_on_strategy ?? null,
    value_add: input.value_add ?? null,
    decision_timeline: input.decision_timeline ?? null,
    actively_investing: input.actively_investing ?? null,
    looking_for_deals: input.looking_for_deals ?? null,
  });
}

export async function upsert(input: CreateInvestorProfileInput): Promise<InvestorProfile> {
  const existing = await findByLeadId(input.lead_id);
  if (existing) {
    const result = await query<InvestorProfile>(
      `UPDATE investor_profiles SET
        investor_type = COALESCE($1, investor_type),
        preferred_stage = COALESCE($2, preferred_stage),
        sector_focus = COALESCE($3, sector_focus),
        cheque_min = COALESCE($4, cheque_min),
        cheque_max = COALESCE($5, cheque_max),
        deployment_timeline = COALESCE($6, deployment_timeline),
        portfolio_count = COALESCE($7, portfolio_count),
        geography = COALESCE($8, geography),
        follow_on_strategy = COALESCE($9, follow_on_strategy),
        value_add = COALESCE($10, value_add),
        decision_timeline = COALESCE($11, decision_timeline),
        actively_investing = COALESCE($12, actively_investing),
        looking_for_deals = COALESCE($13, looking_for_deals)
      WHERE lead_id = $14 RETURNING *`,
      [
        input.investor_type ?? null,
        input.preferred_stage ?? null,
        input.sector_focus ?? null,
        input.cheque_min ?? null,
        input.cheque_max ?? null,
        input.deployment_timeline ?? null,
        input.portfolio_count ?? null,
        input.geography ?? null,
        input.follow_on_strategy ?? null,
        input.value_add ?? null,
        input.decision_timeline ?? null,
        input.actively_investing ?? null,
        input.looking_for_deals ?? null,
        input.lead_id,
      ]
    );
    return result.rows[0];
  }
  return create(input);
}
