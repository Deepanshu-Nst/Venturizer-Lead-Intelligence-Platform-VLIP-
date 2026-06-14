import { getStorageEngine } from "./storage/index.js";
import { validateUpload } from "./upload.validation.js";
import * as documentsRepository from "../../shared/db/repositories/documents.repository.js";
import { AppError } from "../../shared/middleware/errorHandler.js";
import type { UploadResult } from "./upload.types.js";

export async function handleUpload(
  file: Express.Multer.File,
  leadId: string,
  docType: "pitch-deck" | "investment-thesis" | "other"
): Promise<UploadResult> {
  const validation = validateUpload(file, docType);
  if (!validation.valid) {
    throw new AppError(400, "VALIDATION_ERROR", validation.error ?? "Invalid file");
  }

  const storage = getStorageEngine();
  let buffer: Buffer;
  if (Buffer.isBuffer(file.buffer)) {
    buffer = file.buffer;
  } else {
    buffer = await getFileBuffer(file);
  }

  const stored = await storage.save(
    file.originalname,
    buffer,
    file.mimetype
  );

  const document = await documentsRepository.create({
    lead_id: leadId,
    type: docType,
    file_name: file.originalname,
    file_size: file.size,
    mime_type: file.mimetype,
    storage_key: stored.key,
  });

  return {
    documentId: document.id,
    fileName: document.file_name,
    fileSize: document.file_size ?? file.size,
    mimeType: document.mime_type,
    storageKey: document.storage_key,
    url: stored.url,
  };
}

async function getFileBuffer(file: Express.Multer.File): Promise<Buffer> {
  // multer disk storage doesn't provide buffer; read from path
  const { readFile } = await import("node:fs/promises");
  return readFile(file.path);
}

export async function getDocumentStream(documentId: string) {
  const document = await documentsRepository.findById(documentId);
  if (!document) {
    throw new AppError(404, "NOT_FOUND", "Document not found");
  }

  const storage = getStorageEngine();
  const stream = await storage.getStream(document.storage_key);

  return {
    stream,
    fileName: document.file_name,
    mimeType: document.mime_type,
    fileSize: document.file_size ?? undefined,
  };
}
