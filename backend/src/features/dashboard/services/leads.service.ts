import * as dashboardRepo from "../repositories/dashboard.repository.js";
import * as founderRepo from "../../../shared/db/repositories/founderProfiles.repository.js";
import * as investorRepo from "../../../shared/db/repositories/investorProfiles.repository.js";
import * as scoresRepo from "../../../shared/db/repositories/leadScores.repository.js";
import * as documentsRepo from "../../../shared/db/repositories/documents.repository.js";
import * as activityLogsRepo from "../../../shared/db/repositories/activityLogs.repository.js";
import type { LeadFiltersDTO, PaginatedLeadsDTO, LeadSummaryDTO } from "../dto/leads.dto.js";
import type { LeadDetailDTO, ScoreDimensionDTO, DocumentDTO, ActivityLogDTO } from "../dto/lead-detail.dto.js";

export async function listLeads(filters: LeadFiltersDTO): Promise<PaginatedLeadsDTO> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 20;
  const sortBy = filters.sortBy ?? "created_at";
  const sortOrder = filters.sortOrder ?? "desc";

  if (filters.type) {
    conditions.push(`type = $${params.length + 1}`);
    params.push(filters.type);
  }
  if (filters.status) {
    conditions.push(`status = $${params.length + 1}`);
    params.push(filters.status);
  }
  if (filters.bucket) {
    conditions.push(`score_bucket = $${params.length + 1}`);
    params.push(filters.bucket);
  }
  if (filters.scoreMin !== undefined) {
    conditions.push(`score >= $${params.length + 1}`);
    params.push(filters.scoreMin);
  }
  if (filters.scoreMax !== undefined) {
    conditions.push(`score <= $${params.length + 1}`);
    params.push(filters.scoreMax);
  }
  if (filters.search) {
    conditions.push(`(full_name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`);
    params.push(`%${filters.search}%`);
  }
  if (filters.dateFrom) {
    conditions.push(`created_at >= $${params.length + 1}`);
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    conditions.push(`created_at <= $${params.length + 1}`);
    params.push(filters.dateTo);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const order = sortOrder === "asc" ? "ASC" : "DESC";
  const offset = (page - 1) * perPage;

  const [rows, total] = await Promise.all([
    dashboardRepo.findLeads(
      `${whereClause} ORDER BY ${sortBy} ${order}`,
      params,
      perPage,
      offset
    ),
    dashboardRepo.countLeads(whereClause, params),
  ]);

  const data: LeadSummaryDTO[] = rows.map((r) => ({
    id: r.id,
    type: r.type,
    full_name: r.full_name,
    email: r.email,
    phone: r.phone,
    status: r.status,
    score: r.score,
    score_bucket: r.score_bucket,
    source: r.source,
    assigned_to: r.assigned_to,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));

  return {
    data,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getLeadDetail(id: string): Promise<LeadDetailDTO | null> {
  const lead = await dashboardRepo.findById(id);
  if (!lead) return null;

  const founderProfile = await founderRepo.findByLeadId(id);
  const investorProfile = await investorRepo.findByLeadId(id);
  const scores = await scoresRepo.findByLeadId(id);
  const documents = await documentsRepo.findByLeadId(id);
  const activityLog = await activityLogsRepo.findByLeadId(id);

  const profile = (founderProfile ?? investorProfile) as Record<string, unknown> | null;

  const scoreDims: ScoreDimensionDTO[] = scores.map((s) => ({
    dimension: s.dimension,
    score: s.score,
    weight: s.weight,
    maxScore: s.score,
    rationale: s.rationale ?? "",
  }));

  const docDTOs: DocumentDTO[] = documents.map((d) => ({
    id: d.id,
    type: d.type,
    file_name: d.file_name,
    file_size: d.file_size,
    mime_type: d.mime_type,
    storage_key: d.storage_key,
    url: `/api/v1/uploads/file/${d.storage_key}`,
    created_at: d.created_at,
  }));

  const logDTOs: ActivityLogDTO[] = activityLog.map((a) => ({
    id: a.id,
    action: a.action,
    description: a.description,
    user_id: a.user_id,
    metadata: a.metadata,
    created_at: a.created_at,
  }));

  return {
    id: lead.id,
    type: lead.type,
    full_name: lead.full_name,
    email: lead.email,
    phone: lead.phone,
    linkedin_url: lead.linkedin_url,
    status: lead.status,
    score: lead.score,
    score_bucket: lead.score_bucket,
    source: lead.source,
    assigned_to: lead.assigned_to,
    created_at: lead.created_at,
    updated_at: lead.updated_at,
    profile,
    scores: scoreDims,
    documents: docDTOs,
    activity_log: logDTOs,
    ai_evaluation: typeof lead.ai_evaluation === 'string' ? JSON.parse(lead.ai_evaluation) : (lead.ai_evaluation ?? null),
  };
}
