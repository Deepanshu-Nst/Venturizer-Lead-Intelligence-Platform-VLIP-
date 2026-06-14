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
  // Do not exit the process. The pool will automatically try to reconnect or create new connections.
});

export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: unknown[],
  client?: pg.PoolClient,
  retries = 2
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  try {
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
  } catch (err: any) {
    const isConnectionError = err.message?.includes('Connection terminated') || err.message?.includes('socket closed') || err.code === 'ECONNRESET' || err.code === '57P01' || err.message?.includes('timeout');
    // Only retry if we are NOT inside an explicit client transaction, otherwise the transaction is broken anyway
    if (retries > 0 && !client && isConnectionError) {
      console.warn(`[DB] Query failed due to connection drop. Retrying... (${retries} left)`);
      await new Promise(res => setTimeout(res, 1500));
      return query(text, params, client, retries - 1);
    }
    throw err;
  }
}

export async function getClient(retries = 2): Promise<pg.PoolClient> {
  try {
    return await pool.connect();
  } catch (err: any) {
    const isConnectionError = err.message?.includes('Connection terminated') || err.message?.includes('socket closed') || err.code === 'ECONNRESET' || err.code === '57P01' || err.message?.includes('timeout');
    if (retries > 0 && isConnectionError) {
      console.warn(`[DB] getClient failed due to connection drop. Retrying... (${retries} left)`);
      await new Promise(res => setTimeout(res, 1500));
      return getClient(retries - 1);
    }
    throw err;
  }
}

export async function withTransaction<T>(
  fn: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
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
