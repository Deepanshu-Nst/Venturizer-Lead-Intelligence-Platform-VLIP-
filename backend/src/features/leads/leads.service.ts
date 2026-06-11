import * as leadsRepository from "../../shared/db/repositories/leads.repository.js";
import * as founderProfilesRepository from "../../shared/db/repositories/founderProfiles.repository.js";
import * as investorProfilesRepository from "../../shared/db/repositories/investorProfiles.repository.js";
import * as leadScoresRepository from "../../shared/db/repositories/leadScores.repository.js";
import * as documentsRepository from "../../shared/db/repositories/documents.repository.js";
import * as activityLogsRepository from "../../shared/db/repositories/activityLogs.repository.js";
import type {
  Lead,
  CreateLeadInput,
  LeadFilters,
  LeadWithProfile,
  PaginatedResult,
} from "../../shared/types/index.js";

export async function list(filters: LeadFilters = {}): Promise<PaginatedResult<Lead>> {
  return leadsRepository.findMany(filters);
}

export async function getById(id: string): Promise<Lead | null> {
  return leadsRepository.findById(id);
}

export async function getWithProfile(id: string): Promise<LeadWithProfile | null> {
  const lead = await leadsRepository.findById(id);
  if (!lead) return null;

  const result: LeadWithProfile = { ...lead };

  if (lead.type === "founder") {
    result.founder_profile = await founderProfilesRepository.findByLeadId(id);
  } else {
    result.investor_profile = await investorProfilesRepository.findByLeadId(id);
  }

  result.scores = await leadScoresRepository.findByLeadId(id);
  result.documents = await documentsRepository.findByLeadId(id);

  return result;
}

export async function create(input: CreateLeadInput): Promise<Lead> {
  return leadsRepository.create(input);
}

export async function changeStatus(
  id: string,
  status: string,
  userId?: string
): Promise<Lead | null> {
  const lead = await leadsRepository.updateStatus(id, status);
  if (lead) {
    await activityLogsRepository.create({
      lead_id: id,
      user_id: userId ?? null,
      action: "lead_status_changed",
      description: `Status changed to ${status}`,
      metadata: { previous: lead.status, new: status },
    });
  }
  return lead;
}

export async function assign(
  id: string,
  userId: string | null,
  assignedBy?: string
): Promise<Lead | null> {
  const lead = await leadsRepository.assignTo(id, userId);
  if (lead) {
    await activityLogsRepository.create({
      lead_id: id,
      user_id: assignedBy ?? null,
      action: "lead_assigned",
      description: userId
        ? `Assigned to user ${userId}`
        : "Assignment removed",
      metadata: { assigned_to: userId },
    });
  }
  return lead;
}

export async function remove(id: string): Promise<boolean> {
  return leadsRepository.remove(id);
}

export async function getDashboardStats() {
  return leadsRepository.getDashboardStats();
}

export async function getRecentLeads(limit = 10) {
  return leadsRepository.findRecent(limit);
}
