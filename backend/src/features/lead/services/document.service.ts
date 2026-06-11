import { getStorageEngine } from "../../uploads/storage/index.js";
import { validateFileType, validateFileSize, validatePdfMagicBytes } from "../../uploads/upload.validation.js";
import * as documentRepo from "../repositories/document.repository.js";
import type { UploadResponse } from "../dto/upload.dto.js";

export interface FileInput {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export async function uploadDocument(
  file: FileInput,
  leadId: string,
  docType: "pitch-deck" | "investment-thesis" | "other"
): Promise<UploadResponse> {
  const typeCheck = validateFileType(file.mimetype);
  if (!typeCheck.valid) {
    throw Object.assign(new Error(typeCheck.error ?? "Invalid file type"), { statusCode: 400 });
  }

  const sizeCheck = validateFileSize(file.size);
  if (!sizeCheck.valid) {
    throw Object.assign(new Error(sizeCheck.error ?? "Invalid file size"), { statusCode: 400 });
  }

  const magicCheck = validatePdfMagicBytes(file.buffer);
  if (!magicCheck.valid) {
    throw Object.assign(new Error(magicCheck.error ?? "Invalid PDF"), { statusCode: 400 });
  }

  const storage = getStorageEngine();
  const stored = await storage.save(file.originalname, file.buffer, file.mimetype);

  const doc = await documentRepo.create({
    lead_id: leadId,
    type: docType,
    file_name: file.originalname,
    file_size: file.size,
    mime_type: file.mimetype,
    storage_key: stored.key,
  });

  return {
    document_id: doc.id,
    file_name: doc.file_name,
    file_size: doc.file_size ?? 0,
    mime_type: doc.mime_type,
    url: stored.url,
  };
}
