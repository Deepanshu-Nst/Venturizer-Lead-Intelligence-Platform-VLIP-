import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as leadService from "./leads.service.js";
import { success, paginated, error } from "../../shared/types/responses.js";

const router = Router();
router.use(requireAuth);

// ---------------------------------------------------------------------------
// GET /leads — paginated, filterable
// ---------------------------------------------------------------------------
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = req.query as Record<string, string | undefined>;

    const result = await leadService.list({
      type: q.type as "founder" | "investor" | undefined,
      status: q.status as "new" | "contacted" | "qualified" | "disqualified" | "archived" | undefined,
      scoreMin: q.score_min ? parseInt(q.score_min, 10) : undefined,
      scoreMax: q.score_max ? parseInt(q.score_max, 10) : undefined,
      bucket: q.bucket as "hot" | "good" | "maybe" | "low" | undefined,
      assignedTo: q.assigned_to,
      dateFrom: q.date_from,
      dateTo: q.date_to,
      search: q.search,
      page: q.page ? parseInt(q.page, 10) : undefined,
      perPage: q.per_page ? parseInt(q.per_page, 10) : undefined,
    });

    res.json(
      paginated(result.data, result.total, result.page, result.perPage)
    );
  })
);

// ---------------------------------------------------------------------------
// GET /leads/:id — full lead with profile, scores, documents
// ---------------------------------------------------------------------------
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const lead = await leadService.getWithProfile(req.params.id);
    if (!lead) {
      res.status(404).json(error("NOT_FOUND", "Lead not found"));
      return;
    }
    res.json(success(lead));
  })
);

// ---------------------------------------------------------------------------
// PATCH /leads/:id — update status or assignment
// ---------------------------------------------------------------------------
const updateLeadSchema = z.object({
  status: z
    .enum(["new", "contacted", "qualified", "disqualified", "archived"])
    .optional(),
  assigned_to: z.string().uuid().nullable().optional(),
});

router.patch(
  "/:id",
  validate(updateLeadSchema),
  asyncHandler(async (req, res) => {
    const { status: newStatus, assigned_to } = req.body as z.infer<
      typeof updateLeadSchema
    >;

    if (newStatus) {
      const lead = await leadService.changeStatus(req.params.id, newStatus);
      if (!lead) {
        res.status(404).json(error("NOT_FOUND", "Lead not found"));
        return;
      }
      res.json(success(lead));
      return;
    }

    if (assigned_to !== undefined) {
      const lead = await leadService.assign(req.params.id, assigned_to);
      if (!lead) {
        res.status(404).json(error("NOT_FOUND", "Lead not found"));
        return;
      }
      res.json(success(lead));
      return;
    }

    const lead = await leadService.getById(req.params.id);
    if (!lead) {
      res.status(404).json(error("NOT_FOUND", "Lead not found"));
      return;
    }
    res.json(success(lead));
  })
);

// ---------------------------------------------------------------------------
// DELETE /leads/:id
// ---------------------------------------------------------------------------
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await leadService.remove(req.params.id);
    if (!deleted) {
      res.status(404).json(error("NOT_FOUND", "Lead not found"));
      return;
    }
    res.json(success({ deleted: true }));
  })
);

export default router;
