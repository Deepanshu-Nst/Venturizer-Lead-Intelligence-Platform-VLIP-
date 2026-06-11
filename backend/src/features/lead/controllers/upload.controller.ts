import type { Request, Response } from "express";
import * as documentService from "../services/document.service.js";
import { success, error } from "../../../shared/types/responses.js";

export async function uploadFile(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json(error("NO_FILE", "No file provided"));
    return;
  }

  const body = req.body as Record<string, string | undefined>;
  const leadId = body.leadId;
  const docType = (body.type ?? "other") as "pitch-deck" | "investment-thesis" | "other";

  if (!leadId) {
    res.status(400).json(error("VALIDATION_ERROR", "leadId is required"));
    return;
  }

  try {
    const result = await documentService.uploadDocument(
      {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      leadId,
      docType
    );
    res.status(201).json(success(result));
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message: string };
    res.status(e.statusCode ?? 500).json(error("ERROR", e.message));
  }
}
