// ============================================================
// Enums / Literal Types
// ============================================================

export type LeadType = "founder" | "investor";

export type LeadStatus = "new" | "contacted" | "qualified" | "disqualified" | "archived";

export type ScoreBucket = "hot" | "good" | "maybe" | "low";

export type UserRole = "admin" | "editor" | "viewer";

export type DocumentType = "pitch-deck" | "investment-thesis" | "other";

export type ActivityAction =
  | "lead_created"
  | "lead_updated"
  | "lead_status_changed"
  | "lead_assigned"
  | "score_calculated"
  | "document_uploaded"
  | "note_added"
  | "lead_contacted"
  | "lead_qualified"
  | "lead_disqualified";

// ============================================================
// Users
// ============================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  api_key_hash: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  role: UserRole;
  api_key_hash: string;
}

// ============================================================
// Leads
// ============================================================

export interface Lead {
  id: string;
  type: LeadType;
  full_name: string;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  status: LeadStatus;
  score: number | null;
  score_bucket: ScoreBucket | null;
  assigned_to: string | null;
  source: string;
  ai_evaluation?: Record<string, any> | null;
  conversation_context?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadInput {
  type: LeadType;
  full_name: string;
  email: string;
  phone?: string | null;
  linkedin_url?: string | null;
  source?: string;
  conversation_context?: Record<string, any> | null;
}

export interface LeadFilters {
  type?: LeadType;
  status?: LeadStatus;
  scoreMin?: number;
  scoreMax?: number;
  bucket?: ScoreBucket;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

// ============================================================
// Founder Profiles
// ============================================================

export interface FounderProfile {
  id: string;
  lead_id: string;
  prev_startup: boolean | null;
  industry_experience: number | null;
  commitment: string | null;
  startup_name: string | null;
  industry: string | null;
  problem_statement: string | null;
  target_customer: string | null;
  mvp_status: string | null;
  active_users: number | null;
  monthly_revenue: number | null;
  growth_rate: number | null;
  team_size: number | null;
  has_cofounder: boolean | null;
  funding_ask: number | null;
}

export interface CreateFounderProfileInput {
  lead_id: string;
  prev_startup?: boolean | null;
  industry_experience?: number | null;
  commitment?: string | null;
  startup_name?: string | null;
  industry?: string | null;
  problem_statement?: string | null;
  target_customer?: string | null;
  mvp_status?: string | null;
  active_users?: number | null;
  monthly_revenue?: number | null;
  growth_rate?: number | null;
  team_size?: number | null;
  has_cofounder?: boolean | null;
  funding_ask?: number | null;
}

// ============================================================
// Investor Profiles
// ============================================================

export interface InvestorProfile {
  id: string;
  lead_id: string;
  investor_type: string | null;
  preferred_stage: string | null;
  sector_focus: string[] | null;
  cheque_min: number | null;
  cheque_max: number | null;
  deployment_timeline: string | null;
  portfolio_count: number | null;
  geography: string | null;
  follow_on_strategy: string | null;
  value_add: string | null;
  decision_timeline: string | null;
  actively_investing: string | null;
  looking_for_deals: boolean | null;
}

export interface CreateInvestorProfileInput {
  lead_id: string;
  investor_type?: string | null;
  preferred_stage?: string | null;
  sector_focus?: string[] | null;
  cheque_min?: number | null;
  cheque_max?: number | null;
  deployment_timeline?: string | null;
  portfolio_count?: number | null;
  geography?: string | null;
  follow_on_strategy?: string | null;
  value_add?: string | null;
  decision_timeline?: string | null;
  actively_investing?: string | null;
  looking_for_deals?: boolean | null;
}

// ============================================================
// Lead Scores
// ============================================================

export interface LeadScore {
  id: string;
  lead_id: string;
  dimension: string;
  score: number;
  weight: number;
  rationale: string | null;
  created_at: string;
}

export interface CreateLeadScoreInput {
  lead_id: string;
  dimension: string;
  score: number;
  weight: number;
  rationale?: string | null;
}

// ============================================================
// Documents
// ============================================================

export interface Document {
  id: string;
  lead_id: string;
  type: DocumentType;
  file_name: string;
  file_size: number | null;
  mime_type: string;
  storage_key: string;
  uploaded_by: string | null;
  created_at: string;
}

export interface CreateDocumentInput {
  lead_id: string;
  type: DocumentType;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_key: string;
  uploaded_by?: string | null;
}

// ============================================================
// Activity Logs
// ============================================================

export interface ActivityLog {
  id: string;
  lead_id: string;
  user_id: string | null;
  action: ActivityAction;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface CreateActivityLogInput {
  lead_id: string;
  user_id?: string | null;
  action: ActivityAction;
  description: string;
  metadata?: Record<string, unknown> | null;
}

// ============================================================
// Aggregated / Query Result Types
// ============================================================

export interface DashboardStats {
  total_leads: number;
  total_founders: number;
  total_investors: number;
  hot_leads: number;
  good_leads: number;
  maybe_leads: number;
  low_leads: number;
  conversion_rate: number;
}

export interface LeadWithProfile extends Lead {
  founder_profile?: FounderProfile | null;
  investor_profile?: InvestorProfile | null;
  scores?: LeadScore[];
  documents?: Document[];
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
