import { Router } from "express";
import multer from "multer";
import { config } from "../../config/index.js";
import { requireAuth } from "../../shared/middleware/auth.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as documentsRepository from "../../shared/db/repositories/documents.repository.js";
import { success, error } from "../../shared/types/responses.js";
import { handleUpload, getDocumentStream } from "./upload.service.js";
import { validateDocumentType } from "./upload.validation.js";
import { addTempFile } from "./temp-store.js";
import { AppError } from "../../shared/middleware/errorHandler.js";

const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
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

// ---------------------------------------------------------------------------
// POST /uploads/qualification — public upload for qualification flow
// No auth required. Stores file temporarily until lead is created.
// ---------------------------------------------------------------------------
router.post(
  "/qualification",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json(error("NO_FILE", "No file provided"));
      return;
    }

    const body = req.body as Record<string, string | undefined>;
    const docType = body.type ?? "other";

    const typeValidation = validateDocumentType(docType);
    if (!typeValidation.valid) {
      res.status(400).json(error("VALIDATION_ERROR", typeValidation.error ?? "Invalid document type"));
      return;
    }

    const stored = await (await import("./storage/index.js")).getStorageEngine().save(
      req.file.originalname,
      req.file.buffer,
      req.file.mimetype
    );

    const tempId = crypto.randomUUID();
    addTempFile(tempId, {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      storageKey: stored.key,
    });

    res.status(201).json(
      success({
        file_id: tempId,
        storage_key: stored.key,
        url: stored.url,
      })
    );
  })
);

// ---------------------------------------------------------------------------
// POST /uploads — authenticated dashboard upload (lead must exist)
// ---------------------------------------------------------------------------
router.post(
  "/",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json(error("NO_FILE", "No file provided"));
      return;
    }

    const body = req.body as Record<string, string | undefined>;
    const leadId = body.lead_id;
    const docType = body.type ?? "other";

    if (!leadId) {
      res.status(400).json(error("VALIDATION_ERROR", "lead_id is required"));
      return;
    }

    const result = await handleUpload(
      req.file,
      leadId,
      docType as "pitch-deck" | "investment-thesis" | "other"
    );

    res.status(201).json(success(result));
  })
);

// ---------------------------------------------------------------------------
// GET /uploads/:documentId — get document metadata
// ---------------------------------------------------------------------------
router.get(
  "/:documentId",
  asyncHandler(async (req, res) => {
    const document = await documentsRepository.findById(req.params.documentId);
    if (!document) {
      res.status(404).json(error("NOT_FOUND", "Document not found"));
      return;
    }
    res.json(success(document));
  })
);

// ---------------------------------------------------------------------------
// GET /uploads/file/:storageKey — download/serve file
// ---------------------------------------------------------------------------
router.get(
  "/file/:storageKey",
  asyncHandler(async (req, res) => {
    const { storageKey } = req.params;

    const docs = await documentsRepository.findByStorageKey(storageKey);
    if (!docs) {
      res.status(404).json(error("NOT_FOUND", "File not found"));
      return;
    }

    const { stream, fileName, mimeType } = await getDocumentStream(docs.id);

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    if (docs.file_size) {
      res.setHeader("Content-Length", String(docs.file_size));
    }

    stream.pipe(res);
  })
);

export default router;
