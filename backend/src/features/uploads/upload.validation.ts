import { config } from "../../config/index.js";

const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46]; // %PDF

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFileType(mimeType: string): ValidationResult {
  if (!config.upload.allowedMimeTypes.includes(mimeType as "application/pdf")) {
    return { valid: false, error: "Only PDF files are allowed" };
  }
  return { valid: true };
}

export function validateFileSize(size: number): ValidationResult {
  if (size <= 0) {
    return { valid: false, error: "File is empty" };
  }
  if (size > config.upload.maxFileSize) {
    const maxMB = config.upload.maxFileSize / (1024 * 1024);
    return { valid: false, error: `File exceeds maximum size of ${maxMB}MB` };
  }
  return { valid: true };
}

export function validatePdfMagicBytes(buffer: Buffer): ValidationResult {
  if (buffer.length < 4) {
    return { valid: false, error: "File too small to be a valid PDF" };
  }

  for (let i = 0; i < PDF_MAGIC_BYTES.length; i++) {
    if (buffer[i] !== PDF_MAGIC_BYTES[i]) {
      return { valid: false, error: "File does not appear to be a valid PDF" };
    }
  }

  return { valid: true };
}

export function validateDocumentType(type: string): ValidationResult {
  const allowed = ["pitch-deck", "investment-thesis", "other"];
  if (!allowed.includes(type)) {
    return {
      valid: false,
      error: `Invalid document type. Must be one of: ${allowed.join(", ")}`,
    };
  }
  return { valid: true };
}

export function validateUpload(
  file: Express.Multer.File,
  docType: string
): ValidationResult {
  const typeCheck = validateFileType(file.mimetype);
  if (!typeCheck.valid) return typeCheck;

  const sizeCheck = validateFileSize(file.size);
  if (!sizeCheck.valid) return sizeCheck;

  const docTypeCheck = validateDocumentType(docType);
  if (!docTypeCheck.valid) return docTypeCheck;

  // Read first bytes for magic number validation
  if (Buffer.isBuffer(file.buffer) && file.buffer.length > 0) {
    return validatePdfMagicBytes(file.buffer);
  }

  return { valid: true };
}
