import { query, type PoolClient } from "../pool.js";
import type { QueryResultRow } from "pg";

// ---------------------------------------------------------------------------
// Generic helpers used by all repositories
// ---------------------------------------------------------------------------

export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export interface PaginatedQueryResult<T> {
  rows: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/**
 * Execute a paginated SELECT with a count query.
 */
export async function paginatedQuery<T extends QueryResultRow>(
  baseQuery: string,
  countQuery: string,
  params: unknown[],
  pagination: PaginationParams
): Promise<PaginatedQueryResult<T>> {
  const page = Math.max(pagination.page ?? 1, 1);
  const perPage = Math.min(Math.max(pagination.perPage ?? 20, 1), 100);
  const offset = (page - 1) * perPage;

  const [countResult, dataResult] = await Promise.all([
    query<{ count: string }>(countQuery, params),
    query<T>(`${baseQuery} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [
      ...params,
      perPage,
      offset,
    ]),
  ]);

  const total = parseInt(countResult.rows[0]?.count ?? "0", 10);

  return {
    rows: dataResult.rows,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

/**
 * Return a single row or null.
 */
export async function findOne<T extends QueryResultRow>(
  sql: string,
  params: unknown[]
): Promise<T | null> {
  const result = await query<T>(sql, params);
  return result.rows[0] ?? null;
}

/**
 * Insert and return the row.
 */
export async function insertOne<T extends QueryResultRow>(
  table: string,
  data: Record<string, unknown>,
  client?: PoolClient
): Promise<T> {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");

  const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders}) RETURNING *`;
  const result = await query<T>(sql, values, client);
  return result.rows[0];
}
