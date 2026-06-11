import { query } from "../pool.js";
import type { ActivityLog, CreateActivityLogInput } from "../../types/index.js";

const SELECT = "SELECT * FROM activity_logs";

export async function findByLeadId(leadId: string): Promise<ActivityLog[]> {
  const result = await query<ActivityLog>(
    `${SELECT} WHERE lead_id = $1 ORDER BY created_at DESC`,
    [leadId]
  );
  return result.rows;
}

export async function create(input: CreateActivityLogInput): Promise<ActivityLog> {
  const result = await query<ActivityLog>(
    `INSERT INTO activity_logs (lead_id, user_id, action, description, metadata)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [
      input.lead_id,
      input.user_id ?? null,
      input.action,
      input.description,
      input.metadata ? JSON.stringify(input.metadata) : null,
    ]
  );
  return result.rows[0];
}

export async function findRecent(limit = 20): Promise<ActivityLog[]> {
  const result = await query<ActivityLog>(
    `${SELECT} ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}

export async function findByLeadAndAction(
  leadId: string,
  action: string
): Promise<ActivityLog[]> {
  const result = await query<ActivityLog>(
    `${SELECT} WHERE lead_id = $1 AND action = $2 ORDER BY created_at DESC`,
    [leadId, action]
  );
  return result.rows;
}
