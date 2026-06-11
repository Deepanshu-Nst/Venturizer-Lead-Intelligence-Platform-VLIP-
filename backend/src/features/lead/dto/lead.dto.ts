import type {
  LeadType,
  ScoreBucket,
  ScoreDimension,
  DocumentType,
} from "../types/lead.types.js";

export interface LeadResponse {
  id: string;
  type: LeadType;
  full_name: string;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  status: string;
  score: number | null;
  score_bucket: ScoreBucket | null;
  source: string;
  created_at: string;
  updated_at: string;
  profile: Record<string, unknown> | null;
  scores: ScoreDimension[];
  documents: DocumentResponse[];
}

export interface DocumentResponse {
  id: string;
  type: DocumentType;
  file_name: string;
  file_size: number | null;
  mime_type: string;
  storage_key: string;
  url: string | null;
  created_at: string;
}
