import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as leadsRepository from "../../shared/db/repositories/leads.repository.js";
import * as founderProfilesRepository from "../../shared/db/repositories/founderProfiles.repository.js";
import * as investorProfilesRepository from "../../shared/db/repositories/investorProfiles.repository.js";
import * as activityLogsRepository from "../../shared/db/repositories/activityLogs.repository.js";
import {
  calculateScore,
  persistScores,
} from "../scoring/scoring.service.js";
import * as documentsRepository from "../../shared/db/repositories/documents.repository.js";
import { consumeTempFile } from "../uploads/temp-store.js";
import { success, error } from "../../shared/types/responses.js";
import { startSchema, answerSchema, completeSchema } from "./types/qualification.schemas.js";
import type { StartBody, AnswerBody, CompleteBody } from "./types/qualification.schemas.js";
import type { ServerSession } from "./types/qualification.types.js";
import { getQuestions, applyBranching, getNextQuestion } from "./questionRegistry.js";

const router = Router();

// In-memory session store
const sessions = new Map<string, ServerSession>();

// Clean up stale sessions every 30 minutes
setInterval(() => {
  const staleThreshold = Date.now() - 1000 * 60 * 60 * 2; // 2 hours
  for (const [id, session] of sessions) {
    if (session.startedAt.getTime() < staleThreshold) {
      sessions.delete(id);
    }
  }
}, 1000 * 60 * 30);

// ---------------------------------------------------------------------------
// POST /qualification/start — begin a new flow session
// ---------------------------------------------------------------------------
router.post("/start", validate(startSchema), (req, res) => {
  const { type } = req.body as StartBody;
  const sessionId = crypto.randomUUID();
  const questions = getQuestions(type);

  const session: ServerSession = {
    id: sessionId,
    flowType: type,
    answers: {},
    currentIndex: 0,
    startedAt: new Date(),
  };

  sessions.set(sessionId, session);

  res.json(
    success({
      session_id: sessionId,
      flow_type: type,
      total_questions: questions.length,
      first_question: questions[0] ?? null,
    })
  );
});

// ---------------------------------------------------------------------------
// POST /qualification/answer — submit one answer
// ---------------------------------------------------------------------------
router.post("/answer", validate(answerSchema), asyncHandler((req, res) => {
  const { sessionId, questionId, value } = req.body as AnswerBody;

  const session = sessions.get(sessionId);
  if (!session) {
    res.status(404).json(error("NOT_FOUND", "Session not found"));
    return;
  }

  session.answers[questionId] = value;

  // Rebuild question list with branching applied
  const allQuestions = getQuestions(session.flowType);
  const filteredQuestions = applyBranching(allQuestions, session.answers, session.flowType);

  // Find current question index
  const currentQIndex = filteredQuestions.findIndex((q) => q.id === questionId);
  const nextIndex = currentQIndex >= 0
    ? getNextQuestion(currentQIndex, filteredQuestions.length)
    : null;

  session.currentIndex = nextIndex !== null ? nextIndex : filteredQuestions.length;

  res.json(
    success({
      session_id: sessionId,
      question_id: questionId,
      value,
      next_question: nextIndex !== null ? filteredQuestions[nextIndex] ?? null : null,
      is_complete: nextIndex === null,
    })
  );
}));

// ---------------------------------------------------------------------------
// POST /qualification/complete — finalize flow, persist lead + score + log
// ---------------------------------------------------------------------------
router.post(
  "/complete",
  validate(completeSchema),
  asyncHandler(async (req, res) => {
    const { type, answers } = req.body as CompleteBody;

    const email = answers.email as string | undefined;
    if (!email) {
      res.status(400).json(error("VALIDATION_ERROR", "Email is required"));
      return;
    }

    const existing = await leadsRepository.findByEmail(email);
    if (existing) {
      res.json(
        success({
          lead_id: existing.id,
          score: existing.score,
          bucket: existing.score_bucket,
          existing: true,
        })
      );
      return;
    }

    const lead = await leadsRepository.create({
      type,
      full_name: (answers.full_name as string | undefined) ?? "Unknown",
      email,
      phone: (answers.phone as string | undefined) ?? null,
      linkedin_url: (answers.linkedin as string | undefined) ?? null,
      source: "qualification",
    });

    // Attach uploaded document if file_id is present
    const fileId = type === "founder"
      ? (answers.pitch_deck as string | undefined)
      : (answers.investment_thesis as string | undefined);
    if (fileId) {
      const temp = consumeTempFile(fileId);
      if (temp) {
        await documentsRepository.create({
          lead_id: lead.id,
          type: type === "founder" ? "pitch-deck" : "investment-thesis",
          file_name: temp.originalname,
          file_size: temp.size,
          mime_type: temp.mimetype,
          storage_key: temp.storageKey,
        });
      }
    }

    if (type === "founder") {
      await founderProfilesRepository.create({
        lead_id: lead.id,
        prev_startup: answers.prev_startup === "yes" || null,
        industry_experience: answers.industry_experience
          ? Number(answers.industry_experience)
          : null,
        commitment: (answers.commitment as string | undefined) ?? null,
        startup_name: (answers.startup_name as string | undefined) ?? null,
        industry: (answers.industry as string | undefined) ?? null,
        problem_statement: (answers.problem_statement as string | undefined) ?? null,
        target_customer: (answers.target_customer as string | undefined) ?? null,
        mvp_status: (answers.mvp_status as string | undefined) ?? null,
        active_users: answers.active_users
          ? Number(answers.active_users)
          : null,
        monthly_revenue: answers.monthly_revenue
          ? Number(answers.monthly_revenue)
          : null,
        growth_rate: answers.growth_rate
          ? Number(answers.growth_rate)
          : null,
        team_size: answers.team_size ? Number(answers.team_size) : null,
        has_cofounder: answers.has_cofounder === "yes" || null,
        funding_ask: answers.funding_ask
          ? Number(answers.funding_ask)
          : null,
      });
    } else {
      await investorProfilesRepository.create({
        lead_id: lead.id,
        investor_type: (answers.investor_type as string | undefined) ?? null,
        preferred_stage: (answers.preferred_stage as string | undefined) ?? null,
        sector_focus: Array.isArray(answers.sector_focus)
          ? (answers.sector_focus as string[])
          : null,
        cheque_min: answers.cheque_min
          ? Number(answers.cheque_min)
          : null,
        cheque_max: answers.cheque_max
          ? Number(answers.cheque_max)
          : null,
        deployment_timeline: (answers.deployment_timeline as string | undefined) ?? null,
        portfolio_count: answers.portfolio_count
          ? Number(answers.portfolio_count)
          : null,
        geography: (answers.geography as string | undefined) ?? null,
        follow_on_strategy: (answers.follow_on_strategy as string | undefined) ?? null,
        value_add: (answers.value_add as string | undefined) ?? null,
        decision_timeline: (answers.decision_timeline as string | undefined) ?? null,
        actively_investing: (answers.actively_investing as string | undefined) ?? null,
        looking_for_deals:
          answers.looking_for_deals === true ||
          answers.looking_for_deals === "true",
      });
    }

    const { total, dimensions } = calculateScore(type, answers);
    await persistScores(lead.id, total, dimensions);

    await activityLogsRepository.create({
      lead_id: lead.id,
      action: "lead_created",
      description: `${type === "founder" ? "Founder" : "Investor"} qualification completed — score ${total}`,
      metadata: { score: total },
    });

    const bucket =
      total >= 80
        ? "hot"
        : total >= 60
          ? "good"
          : total >= 40
            ? "maybe"
            : "low";

    // Clean up session
    const { sessionId } = req.body as CompleteBody;
    if (sessionId) {
      sessions.delete(sessionId);
    }

    res.status(201).json(
      success({
        lead_id: lead.id,
        score: total,
        bucket,
      })
    );
  })
);

// ---------------------------------------------------------------------------
// GET /qualification/resume/:sessionId — resume a session
// ---------------------------------------------------------------------------
router.get("/resume/:sessionId", (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    // Fall back to returning session not found — client can resume from localStorage
    res.json(
      success({
        session_id: req.params.sessionId,
        found: false,
      })
    );
    return;
  }

  const allQuestions = getQuestions(session.flowType);
  const filteredQuestions = applyBranching(allQuestions, session.answers, session.flowType);
  const currentQuestion = filteredQuestions[session.currentIndex] ?? null;

  res.json(
    success({
      session_id: session.id,
      flow_type: session.flowType,
      answers: session.answers,
      current_index: session.currentIndex,
      current_question: currentQuestion,
      total_questions: filteredQuestions.length,
      found: true,
    })
  );
});

export default router;
