import { findOne, insertOne } from "./base.repository.js";
import { query } from "../pool.js";
import type { Document, CreateDocumentInput } from "../../types/index.js";

const TABLE = "documents";
const SELECT = "SELECT * FROM documents";

export async function findByLeadId(leadId: string): Promise<Document[]> {
  const result = await query<Document>(
    `${SELECT} WHERE lead_id = $1 ORDER BY created_at DESC`,
    [leadId]
  );
  return result.rows;
}

export async function findById(id: string): Promise<Document | null> {
  return findOne<Document>(`${SELECT} WHERE id = $1`, [id]);
}

export async function findByStorageKey(storageKey: string): Promise<Document | null> {
  return findOne<Document>(`${SELECT} WHERE storage_key = $1`, [storageKey]);
}

export async function create(input: CreateDocumentInput): Promise<Document> {
  return insertOne<Document>(TABLE, {
    lead_id: input.lead_id,
    type: input.type,
    file_name: input.file_name,
    file_size: input.file_size,
    mime_type: input.mime_type,
    storage_key: input.storage_key,
    uploaded_by: input.uploaded_by ?? null,
  });
}

export async function remove(id: string): Promise<boolean> {
  const result = await query("DELETE FROM documents WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
