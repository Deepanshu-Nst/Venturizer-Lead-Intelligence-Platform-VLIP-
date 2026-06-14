import type { LeadType, ScoreBucket } from "../../../shared/types/index.js";

export interface ScoreDimensionDTO {
  dimension: string;
  score: number;
  weight: number;
  maxScore: number;
  rationale: string;
}

export interface DocumentDTO {
  id: string;
  type: string;
  file_name: string;
  file_size: number | null;
  mime_type: string;
  storage_key: string;
  url: string;
  created_at: string;
}

export interface ActivityLogDTO {
  id: string;
  action: string;
  description: string;
  user_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface LeadDetailDTO {
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
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  profile: Record<string, unknown> | null;
  scores: ScoreDimensionDTO[];
  documents: DocumentDTO[];
  activity_log: ActivityLogDTO[];
  ai_evaluation?: Record<string, any> | null;
}
