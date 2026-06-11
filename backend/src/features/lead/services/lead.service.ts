import type { StartLeadRequest, StartLeadResponse } from "../dto/start.dto.js";
import type { AnswerRequest, AnswerResponse } from "../dto/answer.dto.js";
import type { SubmitRequest, SubmitResponse } from "../dto/submit.dto.js";
import type { LeadResponse, DocumentResponse } from "../dto/lead.dto.js";
import * as questionsService from "./questions.service.js";
import * as leadRepo from "../repositories/lead.repository.js";
import * as profileRepo from "../repositories/profile.repository.js";
import * as scoreRepo from "../repositories/score.repository.js";
import * as documentRepo from "../repositories/document.repository.js";
import * as activityLogsRepo from "../../../shared/db/repositories/activityLogs.repository.js";
import { calculateScore, getBucket } from "../../scoring/scoring.service.js";
import { consumeTempFile } from "../../uploads/temp-store.js";

const sessions = new Map<string, {
  id: string;
  type: "founder" | "investor";
  answers: Record<string, unknown>;
  currentIndex: number;
  startedAt: Date;
}>();

const STALE_MS = 1000 * 60 * 60 * 2;

setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (session.startedAt.getTime() < now - STALE_MS) {
      sessions.delete(id);
    }
  }
}, 1000 * 60 * 30);

export function startFlow(req: StartLeadRequest): StartLeadResponse {
  const sessionId = crypto.randomUUID();
  const questions = questionsService.getQuestions(req.type);

  const session = {
    id: sessionId,
    type: req.type,
    answers: {},
    currentIndex: 0,
    startedAt: new Date(),
  };

  sessions.set(sessionId, session);

  return {
    session_id: sessionId,
    flow_type: req.type,
    total_questions: questions.length,
    first_question: questions[0] ?? null,
  };
}

export function answerQuestion(req: AnswerRequest): AnswerResponse {
  const session = sessions.get(req.sessionId);
  if (!session) {
    throw Object.assign(new Error("Session not found"), { statusCode: 404 });
  }

  session.answers[req.questionId] = req.value;

  const allQuestions = questionsService.getQuestions(session.type);
  const filteredQuestions = questionsService.applyBranching(allQuestions, session.answers, session.type);

  const currentQIndex = filteredQuestions.findIndex((q) => q.id === req.questionId);
  const nextIndex =
    currentQIndex >= 0
      ? questionsService.getNextQuestion(currentQIndex, filteredQuestions.length)
      : null;

  session.currentIndex = nextIndex !== null ? nextIndex : filteredQuestions.length;

  return {
    session_id: req.sessionId,
    question_id: req.questionId,
    value: req.value,
    next_question: nextIndex !== null ? filteredQuestions[nextIndex] ?? null : null,
    is_complete: nextIndex === null,
  };
}

export async function submitFlow(req: SubmitRequest): Promise<SubmitResponse> {
  const email = req.answers.email as string | undefined;
  if (!email) {
    throw Object.assign(new Error("Email is required"), { statusCode: 400 });
  }

  const existing = await leadRepo.findByEmail(email);
  if (existing) {
    return {
      lead_id: existing.id,
      score: existing.score ?? 0,
      bucket: existing.score_bucket ?? "low",
      dimensions: [],
      reasons: [],
      recommendation: "Lead already exists",
    };
  }

  const lead = await leadRepo.create({
    type: req.type,
    full_name: (req.answers.full_name as string | undefined) ?? "Unknown",
    email,
    phone: (req.answers.phone as string | undefined) ?? null,
    linkedin_url: (req.answers.linkedin as string | undefined) ?? null,
    source: "qualification",
  });

  const fileId =
    req.type === "founder"
      ? (req.answers.pitch_deck as string | undefined)
      : (req.answers.investment_thesis as string | undefined);

  if (fileId) {
    const temp = consumeTempFile(fileId);
    if (temp) {
      await documentRepo.create({
        lead_id: lead.id,
        type: req.type === "founder" ? "pitch-deck" : "investment-thesis",
        file_name: temp.originalname,
        file_size: temp.size,
        mime_type: temp.mimetype,
        storage_key: temp.storageKey,
      });
    }
  }

  if (req.type === "founder") {
    await profileRepo.createFounderProfile({
      lead_id: lead.id,
      prev_startup: req.answers.prev_startup === "yes" || null,
      industry_experience: req.answers.industry_experience
        ? Number(req.answers.industry_experience)
        : null,
      commitment: (req.answers.commitment as string | undefined) ?? null,
      startup_name: (req.answers.startup_name as string | undefined) ?? null,
      industry: (req.answers.industry as string | undefined) ?? null,
      problem_statement: (req.answers.problem_statement as string | undefined) ?? null,
      target_customer: (req.answers.target_customer as string | undefined) ?? null,
      mvp_status: (req.answers.mvp_status as string | undefined) ?? null,
      active_users: req.answers.active_users ? Number(req.answers.active_users) : null,
      monthly_revenue: req.answers.monthly_revenue ? Number(req.answers.monthly_revenue) : null,
      growth_rate: req.answers.growth_rate ? Number(req.answers.growth_rate) : null,
      team_size: req.answers.team_size ? Number(req.answers.team_size) : null,
      has_cofounder: req.answers.has_cofounder === "yes" || null,
      funding_ask: req.answers.funding_ask ? Number(req.answers.funding_ask) : null,
    });
  } else {
    await profileRepo.createInvestorProfile({
      lead_id: lead.id,
      investor_type: (req.answers.investor_type as string | undefined) ?? null,
      preferred_stage: (req.answers.preferred_stage as string | undefined) ?? null,
      sector_focus: Array.isArray(req.answers.sector_focus)
        ? (req.answers.sector_focus as string[])
        : null,
      cheque_min: req.answers.cheque_min ? Number(req.answers.cheque_min) : null,
      cheque_max: req.answers.cheque_max ? Number(req.answers.cheque_max) : null,
      deployment_timeline:
        (req.answers.deployment_timeline as string | undefined) ?? null,
      portfolio_count: req.answers.portfolio_count
        ? Number(req.answers.portfolio_count)
        : null,
      geography: (req.answers.geography as string | undefined) ?? null,
      follow_on_strategy:
        (req.answers.follow_on_strategy as string | undefined) ?? null,
      value_add: (req.answers.value_add as string | undefined) ?? null,
      decision_timeline:
        (req.answers.decision_timeline as string | undefined) ?? null,
      actively_investing:
        (req.answers.actively_investing as string | undefined) ?? null,
      looking_for_deals:
        req.answers.looking_for_deals === true ||
        req.answers.looking_for_deals === "true",
    });
  }

  const { total, dimensions } = calculateScore(req.type, req.answers);
  await scoreRepo.deleteByLeadId(lead.id);
  await scoreRepo.createMany(
    dimensions.map((d) => ({
      lead_id: lead.id,
      dimension: d.dimension,
      score: d.score,
      weight: d.weight,
      rationale: d.rationale,
    }))
  );

  const bucket = getBucket(total);
  await leadRepo.updateScore(lead.id, total, bucket);

  await activityLogsRepo.create({
    lead_id: lead.id,
    action: "lead_created",
    description: `${req.type === "founder" ? "Founder" : "Investor"} qualification completed — score ${total}`,
    metadata: { score: total },
  });

  const bucketLabel = bucket;

  if (req.sessionId) {
    sessions.delete(req.sessionId);
  }

  return {
    lead_id: lead.id,
    score: total,
    bucket: bucketLabel,
    dimensions,
    reasons: dimensions.map((d) => `${d.dimension}: ${d.score}/${d.maxScore}`),
    recommendation:
      bucketLabel === "hot"
        ? "Schedule intro call within 24 hours"
        : bucketLabel === "good"
          ? "Nurture with weekly check-ins"
          : bucketLabel === "maybe"
            ? "Revisit in 30 days"
            : "Low priority — monitor",
  };
}

export async function getLeadById(id: string): Promise<LeadResponse | null> {
  const lead = await leadRepo.findById(id);
  if (!lead) return null;

  const founderProfile = await profileRepo.findFounderProfile(id);
  const investorProfile = await profileRepo.findInvestorProfile(id);
  const scores = await scoreRepo.findByLeadId(id);
  const documents = await documentRepo.findByLeadId(id);

  const profile = (founderProfile ?? investorProfile) as Record<string, unknown> | null;

  const docResponses: DocumentResponse[] = documents.map((d) => ({
    id: d.id,
    type: d.type,
    file_name: d.file_name,
    file_size: d.file_size,
    mime_type: d.mime_type,
    storage_key: d.storage_key,
    url: `/api/v1/uploads/file/${d.storage_key}`,
    created_at: d.created_at,
  }));

  return {
    id: lead.id,
    type: lead.type,
    full_name: lead.full_name,
    email: lead.email,
    phone: lead.phone,
    linkedin_url: lead.linkedin_url,
    status: lead.status,
    score: lead.score,
    score_bucket: lead.score_bucket,
    source: lead.source,
    created_at: lead.created_at,
    updated_at: lead.updated_at,
    profile,
    scores: scores.map((s) => ({
      dimension: s.dimension,
      score: s.score,
      weight: s.weight,
      maxScore: Math.round(s.score / (s.weight || 0.01)),
      rationale: s.rationale ?? "",
    })),
    documents: docResponses,
  };
}
