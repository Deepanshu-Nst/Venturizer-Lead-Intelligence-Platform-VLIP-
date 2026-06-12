import type { Request, Response } from "express";
import * as analyticsService from "../services/analytics.service.js";
import * as leadsService from "../services/leads.service.js";
import * as leadsRepo from "../../../shared/db/repositories/leads.repository.js";
import * as activityLogsRepo from "../../../shared/db/repositories/activityLogs.repository.js";
import { success, paginated, error } from "../../../shared/types/responses.js";

export async function summary(_req: Request, res: Response): Promise<void> {
  const result = await analyticsService.getSummary();
  res.json(success(result));
}

export async function listLeads(req: Request, res: Response): Promise<void> {
  const q = req.query as Record<string, string | undefined>;

  const result = await leadsService.listLeads({
    type: q.type as "founder" | "investor" | undefined,
    status: q.status,
    bucket: q.bucket as "hot" | "good" | "maybe" | "low" | undefined,
    scoreMin: q.score_min ? parseInt(q.score_min, 10) : undefined,
    scoreMax: q.score_max ? parseInt(q.score_max, 10) : undefined,
    search: q.search,
    dateFrom: q.date_from,
    dateTo: q.date_to,
    sortBy: q.sort_by as "created_at" | "score" | "full_name" | undefined,
    sortOrder: q.sort_order as "asc" | "desc" | undefined,
    page: q.page ? parseInt(q.page, 10) : undefined,
    perPage: q.per_page ? parseInt(q.per_page, 10) : undefined,
  });

  res.json(paginated(result.data, result.total, result.page, result.perPage));
}

export async function getLeadDetail(req: Request, res: Response): Promise<void> {
  const lead = await leadsService.getLeadDetail(req.params.id);
  if (!lead) {
    res.status(404).json(error("NOT_FOUND", "Lead not found"));
    return;
  }
  res.json(success(lead));
}

export async function updateLeadStatus(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { status } = req.body as { status?: string };

  if (!status || typeof status !== "string") {
    res.status(400).json(error("VALIDATION", "Status is required"));
    return;
  }

  const lead = await leadsRepo.updateStatus(id, status);
  if (!lead) {
    res.status(404).json(error("NOT_FOUND", "Lead not found"));
    return;
  }

  await activityLogsRepo.create({
    lead_id: id,
    action: "lead_status_changed",
    description: `Status changed to ${status}`,
    metadata: { status },
  });

  res.json(success(lead));
}

export async function addNote(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { content } = req.body as { content?: string };

  if (!content || typeof content !== "string" || !content.trim()) {
    res.status(400).json(error("VALIDATION", "Note content is required"));
    return;
  }

  const log = await activityLogsRepo.create({
    lead_id: id,
    action: "note_added",
    description: content.trim(),
    metadata: { type: "internal_note" },
  });

  res.status(201).json(success(log));
}

export async function getNotes(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const notes = await activityLogsRepo.findByLeadAndAction(id, "note_added");

  res.json(success(notes));
}
