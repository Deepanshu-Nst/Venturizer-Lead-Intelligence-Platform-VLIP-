import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../shared/db/pool.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
  console.log("Running migrations...");

  try {
    const sql = readFileSync(join(__dirname, "001_initial.sql"), "utf-8");
    await pool.query(sql);
    console.log("Migration 001_initial.sql completed successfully.");
    
    const sql3 = readFileSync(join(__dirname, "003_add_ai_evaluation.sql"), "utf-8");
    try { await pool.query(sql3); } catch(e) {} // ignore if already exists
    console.log("Migration 003_add_ai_evaluation.sql completed successfully.");
    
    const sql4 = readFileSync(join(__dirname, "004_update_founder_industry.sql"), "utf-8");
    await pool.query(sql4);
    console.log("Migration 004_update_founder_industry.sql completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

void runMigrations();
