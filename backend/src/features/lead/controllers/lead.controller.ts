import type { Request, Response } from "express";
import type { StartLeadRequest } from "../dto/start.dto.js";
import type { AnswerRequest } from "../dto/answer.dto.js";
import type { SubmitRequest } from "../dto/submit.dto.js";
import * as leadService from "../services/lead.service.js";
import { success, error } from "../../../shared/types/responses.js";

export function start(req: Request, res: Response): void {
  const body = req.body as StartLeadRequest;
  const result = leadService.startFlow(body);
  res.json(success(result));
}

export function answer(req: Request, res: Response): void {
  try {
    const body = req.body as AnswerRequest;
    const result = leadService.answerQuestion(body);
    res.json(success(result));
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message: string };
    res.status(e.statusCode ?? 500).json(error("ERROR", e.message));
  }
}

export async function submit(req: Request, res: Response): Promise<void> {
  try {
    const payload = req.body as SubmitRequest;
    console.log("Lead submit payload:", payload);
    const result = await leadService.submitFlow(payload);
    res.status(201).json(success(result));
  } catch (err: unknown) {
    console.error("[lead.controller] submit error:", err);
    const e = err as { statusCode?: number; message?: string; detail?: string; code?: string };
    
    // Check if it's a PostgreSQL constraint or type error
    if (e.code && String(e.code).length === 5) {
      res.status(400).json(error("BAD_REQUEST", `Database error: ${e.detail || e.message}`));
      return;
    }

    const statusCode = typeof e.statusCode === "number" ? e.statusCode : 500;
    const message = e.message ?? "Internal server error";
    res.status(statusCode).json(error("ERROR", message));
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  const lead = await leadService.getLeadById(req.params.id);
  if (!lead) {
    res.status(404).json(error("NOT_FOUND", "Lead not found"));
    return;
  }
  res.json(success(lead));
}
