import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as leadScoresRepository from "../../shared/db/repositories/leadScores.repository.js";
import { success } from "../../shared/types/responses.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/:leadId",
  asyncHandler(async (req, res) => {
    const scores = await leadScoresRepository.findByLeadId(req.params.leadId);
    res.json(success(scores));
  })
);

export default router;
