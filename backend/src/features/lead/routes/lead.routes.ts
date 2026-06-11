import { Router } from "express";
import multer from "multer";
import { config } from "../../../config/index.js";
import { validate } from "../../../shared/middleware/validate.js";
import { asyncHandler } from "../../../shared/middleware/asyncHandler.js";
import { AppError } from "../../../shared/middleware/errorHandler.js";
import * as leadController from "../controllers/lead.controller.js";
import * as uploadController from "../controllers/upload.controller.js";
import { startSchema, answerSchema, submitSchema } from "../validation/lead.schemas.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new AppError(400, "INVALID_FILE_TYPE", "Only PDF files are allowed"));
    }
  },
});

const router = Router();

router.post("/start", validate(startSchema), asyncHandler(leadController.start));

router.post("/answer", validate(answerSchema), asyncHandler(leadController.answer));

router.post("/submit", validate(submitSchema), asyncHandler(leadController.submit));

router.get("/:id", asyncHandler(leadController.getById));

router.post(
  "/upload",
  upload.single("file"),
  asyncHandler(uploadController.uploadFile)
);

export default router;
