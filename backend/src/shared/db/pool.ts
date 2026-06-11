import pg from "pg";
import { config } from "../../config/index.js";

const { Pool } = pg;
export type PoolClient = pg.PoolClient;

export const pool = new Pool({
  connectionString: config.database.url,
  ssl: config.database.ssl,
  max: config.database.pool.max,
  idleTimeoutMillis: config.database.pool.idleTimeoutMillis,
  connectionTimeoutMillis: config.database.pool.connectionTimeoutMillis,
});

pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
  process.exit(-1);
});

export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: unknown[],
  client?: pg.PoolClient
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  const result = client
    ? await client.query<T>(text, params)
    : await pool.query<T>(text, params);
  const duration = Date.now() - start;

  if (config.isDev) {
    console.log("Query executed", {
      text: text.substring(0, 80),
      duration: `${duration}ms`,
      rows: result.rowCount,
    });
  }

  return result;
}

export async function getClient(): Promise<pg.PoolClient> {
  return pool.connect();
}

export async function withTransaction<T>(
  fn: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
