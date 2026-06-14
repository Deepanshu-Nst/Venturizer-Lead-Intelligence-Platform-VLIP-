export interface UploadResult {
  documentId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  url: string | null;
}

export interface UploadRequest {
  leadId: string;
  type: "pitch-deck" | "investment-thesis" | "other";
  file: Express.Multer.File;
}

export interface TempFile {
  originalname: string;
  size: number;
  mimetype: string;
  storageKey: string;
}
