import { query } from "../../../shared/db/pool.js";
import { findOne } from "../../../shared/db/repositories/base.repository.js";
import type { Lead } from "../../../shared/types/index.js";
import type { BucketDistribution, StatusDistribution, WeeklyTrend } from "../dto/summary.dto.js";

export async function findLeads(
  whereClause: string,
  params: unknown[],
  perPage: number,
  offset: number
): Promise<Lead[]> {
  const sql = `SELECT * FROM leads ${whereClause} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  const result = await query<Lead>(sql, [...params, perPage, offset]);
  return result.rows;
}

export async function countLeads(sql: string, params: unknown[]): Promise<number> {
  const countSql = `SELECT COUNT(*) FROM leads ${sql}`;
  const result = await query<{ count: string }>(countSql, params);
  return parseInt(result.rows[0]?.count ?? "0", 10);
}

export async function findById(id: string): Promise<Lead | null> {
  return findOne<Lead>("SELECT * FROM leads WHERE id = $1", [id]);
}

export async function getCountSince(date: Date): Promise<number> {
  const result = await query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM leads WHERE created_at >= $1",
    [date]
  );
  return parseInt(result.rows[0]?.count ?? "0", 10);
}

export async function getAvgScore(): Promise<number | null> {
  const result = await query<{ avg: string | null }>(
    "SELECT AVG(score)::text AS avg FROM leads WHERE score IS NOT NULL"
  );
  return result.rows[0]?.avg ? parseFloat(result.rows[0].avg) : null;
}

export async function getBucketDistribution(): Promise<BucketDistribution[]> {
  const result = await query<{ bucket: string; count: string }>(`
    SELECT COALESCE(score_bucket, 'unscored') AS bucket, COUNT(*)::text AS count
    FROM leads
    GROUP BY bucket
    ORDER BY bucket
  `);
  const total = result.rows.reduce((sum, r) => sum + parseInt(r.count, 10), 0);
  return result.rows.map((r) => ({
    bucket: r.bucket,
    count: parseInt(r.count, 10),
    percentage: total > 0 ? Math.round((parseInt(r.count, 10) / total) * 100) : 0,
  }));
}

export async function getStatusDistribution(): Promise<StatusDistribution[]> {
  const result = await query<{ status: string; count: string }>(`
    SELECT status, COUNT(*)::text AS count
    FROM leads
    GROUP BY status
    ORDER BY status
  `);
  return result.rows.map((r) => ({
    status: r.status,
    count: parseInt(r.count, 10),
  }));
}

export async function getWeeklyTrend(weeks = 8): Promise<WeeklyTrend[]> {
  const result = await query<{ week: string; count: string }>(`
    SELECT
      TO_CHAR(DATE_TRUNC('week', created_at), 'YYYY-MM-DD') AS week,
      COUNT(*)::text AS count
    FROM leads
    WHERE created_at >= NOW() - INTERVAL '${weeks} weeks'
    GROUP BY DATE_TRUNC('week', created_at)
    ORDER BY week ASC
  `);
  return result.rows.map((r) => ({
    week: r.week,
    count: parseInt(r.count, 10),
  }));
}
