import { query } from "../pool.js";
import { findOne, insertOne } from "./base.repository.js";
import type { User, CreateUserInput } from "../../types/index.js";

const TABLE = "users";
const SELECT = "SELECT * FROM users";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function findByEmail(email: string): Promise<User | null> {
  return findOne<User>(`${SELECT} WHERE LOWER(email) = LOWER($1)`, [email]);
}

export async function findById(id: string): Promise<User | null> {
  return findOne<User>(`${SELECT} WHERE id = $1`, [id]);
}

export async function create(input: CreateUserInput): Promise<User> {
  return insertOne<User>(TABLE, {
    email: input.email,
    name: input.name,
    role: input.role,
    api_key_hash: input.api_key_hash,
  });
}

export async function updateLastLogin(id: string): Promise<void> {
  await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [id]);
}

export async function listActive(): Promise<User[]> {
  const result = await query<User>(
    `${SELECT} WHERE is_active = true ORDER BY name ASC`
  );
  return result.rows;
}

export async function deactivate(id: string): Promise<void> {
  await query("UPDATE users SET is_active = false WHERE id = $1", [id]);
}
