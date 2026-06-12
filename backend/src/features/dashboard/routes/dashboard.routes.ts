import { Router } from "express";
import { requireAuth } from "../../../shared/middleware/auth.js";
import { asyncHandler } from "../../../shared/middleware/asyncHandler.js";
import * as dashboardController from "../controllers/dashboard.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/summary", asyncHandler(dashboardController.summary));

router.get("/leads", asyncHandler(dashboardController.listLeads));

router.get("/leads/:id", asyncHandler(dashboardController.getLeadDetail));

router.patch("/leads/:id/status", asyncHandler(dashboardController.updateLeadStatus));

router.post("/leads/:id/notes", asyncHandler(dashboardController.addNote));

router.get("/leads/:id/notes", asyncHandler(dashboardController.getNotes));

export default router;
