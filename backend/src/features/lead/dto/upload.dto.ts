export interface UploadRequest {
  leadId: string;
  type: "pitch-deck" | "investment-thesis" | "other";
}

export interface UploadResponse {
  document_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  url: string | null;
}
