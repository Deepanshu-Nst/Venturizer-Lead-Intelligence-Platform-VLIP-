import { query, type PoolClient } from "../pool.js";
import { findOne, paginatedQuery, insertOne } from "./base.repository.js";
import type {
  Lead,
  CreateLeadInput,
  LeadFilters,
  DashboardStats,
  PaginatedResult,
} from "../../types/index.js";

const TABLE = "leads";
const SELECT = "SELECT * FROM leads";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function findMany(
  filters: LeadFilters = {}
): Promise<PaginatedResult<Lead>> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 20;

  if (filters.type) {
    conditions.push(`type = $${params.length + 1}`);
    params.push(filters.type);
  }
  if (filters.status) {
    conditions.push(`status = $${params.length + 1}`);
    params.push(filters.status);
  }
  if (filters.scoreMin !== undefined) {
    conditions.push(`score >= $${params.length + 1}`);
    params.push(filters.scoreMin);
  }
  if (filters.scoreMax !== undefined) {
    conditions.push(`score <= $${params.length + 1}`);
    params.push(filters.scoreMax);
  }
  if (filters.bucket) {
    conditions.push(`score_bucket = $${params.length + 1}`);
    params.push(filters.bucket);
  }
  if (filters.assignedTo) {
    conditions.push(`assigned_to = $${params.length + 1}`);
    params.push(filters.assignedTo);
  }
  if (filters.dateFrom) {
    conditions.push(`created_at >= $${params.length + 1}`);
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    conditions.push(`created_at <= $${params.length + 1}`);
    params.push(filters.dateTo);
  }
  if (filters.search) {
    conditions.push(`(full_name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`);
    params.push(`%${filters.search}%`);
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await paginatedQuery<Lead>(
    `${SELECT} ${whereSql} ORDER BY created_at DESC`,
    `SELECT COUNT(*) FROM leads ${whereSql}`,
    params,
    { page, perPage }
  );

  return {
    data: result.rows,
    total: result.total,
    page: result.page,
    perPage: result.perPage,
    totalPages: result.totalPages,
  };
}

export async function findById(id: string): Promise<Lead | null> {
  return findOne<Lead>(`${SELECT} WHERE id = $1`, [id]);
}

export async function findByEmail(email: string): Promise<Lead | null> {
  return findOne<Lead>(`${SELECT} WHERE LOWER(email) = LOWER($1)`, [email]);
}

export async function create(input: CreateLeadInput, client?: PoolClient): Promise<Lead> {
  return insertOne<Lead>(TABLE, {
    type: input.type,
    full_name: input.full_name,
    email: input.email,
    phone: input.phone ?? null,
    linkedin_url: input.linkedin_url ?? null,
    source: input.source ?? "direct",
  }, client);
}

export async function updateStatus(
  id: string,
  status: string
): Promise<Lead | null> {
  const result = await query<Lead>(
    `UPDATE leads SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0] ?? null;
}

export async function assignTo(
  id: string,
  userId: string | null
): Promise<Lead | null> {
  const result = await query<Lead>(
    `UPDATE leads SET assigned_to = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [userId, id]
  );
  return result.rows[0] ?? null;
}

export async function updateScore(
  id: string,
  score: number,
  bucket: string
): Promise<Lead | null> {
  const result = await query<Lead>(
    `UPDATE leads SET score = $1, score_bucket = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
    [score, bucket, id]
  );
  return result.rows[0] ?? null;
}

export async function remove(id: string): Promise<boolean> {
  const result = await query("DELETE FROM leads WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// Aggregations
// ---------------------------------------------------------------------------

export async function getDashboardStats(): Promise<DashboardStats> {
  const result = await query<{
    total: string;
    founders: string;
    investors: string;
    hot: string;
    good: string;
    maybe: string;
    low: string;
  }>(`
    SELECT
      COUNT(*)::text AS total,
      COUNT(*) FILTER (WHERE type = 'founder')::text AS founders,
      COUNT(*) FILTER (WHERE type = 'investor')::text AS investors,
      COUNT(*) FILTER (WHERE score_bucket = 'hot')::text AS hot,
      COUNT(*) FILTER (WHERE score_bucket = 'good')::text AS good,
      COUNT(*) FILTER (WHERE score_bucket = 'maybe')::text AS maybe,
      COUNT(*) FILTER (WHERE score_bucket = 'low')::text AS low
    FROM leads
  `);

  const row = result.rows[0];
  const total = parseInt(row.total, 10);
  const hot = parseInt(row.hot, 10);

  return {
    total_leads: total,
    total_founders: parseInt(row.founders, 10),
    total_investors: parseInt(row.investors, 10),
    hot_leads: hot,
    good_leads: parseInt(row.good, 10),
    maybe_leads: parseInt(row.maybe, 10),
    low_leads: parseInt(row.low, 10),
    conversion_rate: total > 0 ? Math.round((hot / total) * 100) : 0,
  };
}

export async function findRecent(limit = 10): Promise<Lead[]> {
  const result = await query<Lead>(
    `${SELECT} ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}
