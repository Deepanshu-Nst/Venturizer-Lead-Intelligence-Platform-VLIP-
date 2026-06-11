import type { Document, CreateDocumentInput } from "../../../shared/types/index.js";
import * as docsRepo from "../../../shared/db/repositories/documents.repository.js";

export async function findByLeadId(leadId: string): Promise<Document[]> {
  return docsRepo.findByLeadId(leadId);
}

export async function create(input: CreateDocumentInput): Promise<Document> {
  return docsRepo.create(input);
}

export { type Document };
