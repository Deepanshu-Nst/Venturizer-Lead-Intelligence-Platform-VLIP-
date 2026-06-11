import type { LeadType, ScoreBucket } from "../../../shared/types/index.js";

export interface LeadFiltersDTO {
  type?: LeadType;
  status?: string;
  bucket?: ScoreBucket;
  scoreMin?: number;
  scoreMax?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "created_at" | "score" | "full_name";
  sortOrder?: "asc" | "desc";
  page?: number;
  perPage?: number;
}

export interface LeadSummaryDTO {
  id: string;
  type: LeadType;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  score: number | null;
  score_bucket: ScoreBucket | null;
  source: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedLeadsDTO {
  data: LeadSummaryDTO[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
