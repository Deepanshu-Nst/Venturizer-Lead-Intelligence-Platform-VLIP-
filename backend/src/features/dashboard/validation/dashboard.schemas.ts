import { z } from "zod";

export const leadsQuerySchema = z.object({
  type: z.enum(["founder", "investor"]).optional(),
  status: z.enum(["new", "contacted", "qualified", "disqualified", "archived"]).optional(),
  bucket: z.enum(["hot", "good", "maybe", "low"]).optional(),
  scoreMin: z.coerce.number().min(0).max(100).optional(),
  scoreMax: z.coerce.number().min(0).max(100).optional(),
  search: z.string().max(200).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(["created_at", "score", "full_name"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  perPage: z.coerce.number().int().min(1).max(100).optional(),
});
