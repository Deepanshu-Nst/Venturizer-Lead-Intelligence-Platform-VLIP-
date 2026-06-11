export type LeadType = "founder" | "investor";

export type LeadStatus =
  | "new"
  | "reviewing"
  | "qualified"
  | "contacted"
  | "rejected"
  | "converted";

export type ScoreBucket = "hot" | "good" | "maybe" | "low";

export interface BucketDistribution {
  bucket: string;
  count: number;
  percentage: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface WeeklyTrend {
  week: string;
  count: number;
}

export interface DashboardSummary {
  total_leads: number;
  total_founders: number;
  total_investors: number;
  hot_leads: number;
  good_leads: number;
  maybe_leads: number;
  low_leads: number;
  conversion_rate: number;
  new_leads_this_week: number;
  new_leads_this_month: number;
  avg_score: number | null;
  bucket_distribution: BucketDistribution[];
  status_distribution: StatusDistribution[];
  weekly_trend: WeeklyTrend[];
}

export interface LeadFilters {
  type?: LeadType;
  status?: LeadStatus;
  bucket?: ScoreBucket;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "created_at" | "score" | "full_name";
  sortOrder?: "asc" | "desc";
  page?: number;
  perPage?: number;
}

export interface LeadSummary {
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

export interface PaginatedLeads {
  data: LeadSummary[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ScoreDimension {
  dimension: string;
  score: number;
  weight: number;
  maxScore: number;
  rationale: string;
}

export interface Document {
  id: string;
  type: string;
  file_name: string;
  file_size: number | null;
  mime_type: string;
  storage_key: string;
  url: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  user_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface LeadDetail {
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
  scores: ScoreDimension[];
  documents: Document[];
  activity_log: ActivityLog[];
}

export interface QualificationSummary {
  strengths: string[];
  concerns: string[];
  explanation: string;
  recommendation: string;
}
