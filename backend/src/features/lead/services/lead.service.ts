import type { StartLeadRequest, StartLeadResponse } from "../dto/start.dto.js";
import type { AnswerRequest, AnswerResponse } from "../dto/answer.dto.js";
import type { SubmitRequest, SubmitResponse } from "../dto/submit.dto.js";
import type { LeadResponse, DocumentResponse } from "../dto/lead.dto.js";
import * as questionsService from "./questions.service.js";
import * as leadRepo from "../repositories/lead.repository.js";
import * as profileRepo from "../repositories/profile.repository.js";
import * as scoreRepo from "../repositories/score.repository.js";
import * as documentRepo from "../repositories/document.repository.js";
import { calculateScore, getBucket } from "../../scoring/scoring.service.js";
import { consumeTempFile } from "../../uploads/temp-store.js";
import { withTransaction, query } from "../../../shared/db/pool.js";

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

  const { total, dimensions } = calculateScore(req.type, req.answers);
  const bucket = getBucket(total);
  const bucketLabel = bucket;

  const lead = await withTransaction(async (client) => {
    let l = existing;
    
    if (!l) {
      l = await leadRepo.create({
        type: req.type,
        full_name: (req.answers.full_name as string | undefined) ?? "Unknown",
        email,
        phone: (req.answers.phone as string | undefined) ?? null,
        linkedin_url: (req.answers.linkedin as string | undefined) ?? null,
        source: "qualification",
      }, client);
    } else {
      // Update basic info for existing lead
      await query(
        `UPDATE leads SET 
          full_name = COALESCE($1, full_name),
          phone = COALESCE($2, phone),
          linkedin_url = COALESCE($3, linkedin_url),
          updated_at = NOW()
         WHERE id = $4`,
        [
          (req.answers.full_name as string | undefined) ?? null,
          (req.answers.phone as string | undefined) ?? null,
          (req.answers.linkedin as string | undefined) ?? null,
          l.id
        ],
        client
      );
      
      // Clear out old profiles to insert fresh ones
      await query(`DELETE FROM founder_profiles WHERE lead_id = $1`, [l.id], client);
      await query(`DELETE FROM investor_profiles WHERE lead_id = $1`, [l.id], client);
    }

    const fileId =
      req.type === "founder"
        ? (req.answers.pitch_deck as string | undefined)
        : (req.answers.investment_thesis as string | undefined);

    if (fileId) {
      const temp = consumeTempFile(fileId);
      if (temp) {
        await query(
          `INSERT INTO documents (lead_id, type, file_name, file_size, mime_type, storage_key)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            l.id,
            req.type === "founder" ? "pitch-deck" : "investment-thesis",
            temp.originalname,
            temp.size,
            temp.mimetype,
            temp.storageKey,
          ],
          client
        );
      }
    }

    if (req.type === "founder") {
      await query(
        `INSERT INTO founder_profiles (
          lead_id, prev_startup, industry_experience, commitment,
          startup_name, industry, problem_statement, target_customer,
          mvp_status, active_users, monthly_revenue, growth_rate,
          team_size, has_cofounder, funding_ask
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          l.id,
          req.answers.prev_startup === "yes" || null,
          req.answers.industry_experience ? Math.round(Number(req.answers.industry_experience)) : null,
          (req.answers.commitment as string | undefined) ?? null,
          (req.answers.startup_name as string | undefined) ?? null,
          (req.answers.industry as string | undefined) ?? null,
          (req.answers.problem_statement as string | undefined) ?? null,
          (req.answers.target_customer as string | undefined) ?? null,
          (req.answers.mvp_status as string | undefined) ?? null,
          req.answers.active_users ? Math.round(Number(req.answers.active_users)) : null,
          req.answers.monthly_revenue ? Number(req.answers.monthly_revenue) : null,
          req.answers.growth_rate ? Number(req.answers.growth_rate) : null,
          req.answers.team_size ? Math.round(Number(req.answers.team_size)) : null,
          req.answers.has_cofounder === "yes" || null,
          req.answers.funding_ask ? Number(req.answers.funding_ask) : null,
        ],
        client
      );
    } else {
      await query(
        `INSERT INTO investor_profiles (
          lead_id, investor_type, preferred_stage, sector_focus,
          cheque_min, cheque_max, deployment_timeline, portfolio_count,
          geography, follow_on_strategy, value_add, decision_timeline,
          actively_investing, looking_for_deals
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          l.id,
          (req.answers.investor_type as string | undefined) ?? null,
          (req.answers.preferred_stage as string | undefined) ?? null,
          Array.isArray(req.answers.sector_focus)
            ? JSON.stringify(req.answers.sector_focus)
            : null,
          req.answers.cheque_min ? Number(req.answers.cheque_min) : null,
          req.answers.cheque_max ? Number(req.answers.cheque_max) : null,
          (req.answers.deployment_timeline as string | undefined) ?? null,
          req.answers.portfolio_count ? Math.round(Number(req.answers.portfolio_count)) : null,
          (req.answers.geography as string | undefined) ?? null,
          (req.answers.follow_on_strategy as string | undefined) ?? null,
          (req.answers.value_add as string | undefined) ?? null,
          (req.answers.decision_timeline as string | undefined) ?? null,
          (req.answers.actively_investing as string | undefined) ?? null,
          req.answers.looking_for_deals === true ||
            req.answers.looking_for_deals === "true",
        ],
        client
      );
    }

    await scoreRepo.deleteByLeadId(l.id, client);
    await scoreRepo.createMany(
      dimensions.map((d) => ({
        lead_id: l.id,
        dimension: d.dimension,
        score: d.score,
        weight: d.weight,
        rationale: d.rationale,
      })),
      client
    );

    await query(
      `UPDATE leads SET score = $1, score_bucket = $2, updated_at = NOW() WHERE id = $3`,
      [total, bucket, l.id],
      client
    );

    const actionText = existing ? "lead_updated" : "lead_created";
    const descText = existing 
      ? `Repeat submission for ${req.type === "founder" ? "Founder" : "Investor"} — new score ${total}`
      : `${req.type === "founder" ? "Founder" : "Investor"} qualification completed — score ${total}`;

    await query(
      `INSERT INTO activity_logs (lead_id, action, description, metadata)
       VALUES ($1, $2, $3, $4)`,
      [
        l.id,
        actionText,
        descText,
        JSON.stringify({ score: total, is_repeat: !!existing }),
      ],
      client
    );

    return l;
  });

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

  const { rows: activityLogs } = await query(
    `SELECT id, action, description, user_id, metadata, created_at 
     FROM activity_logs 
     WHERE lead_id = $1 
     ORDER BY created_at DESC`,
    [lead.id]
  );

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
    activity_log: activityLogs.map(a => ({
      id: a.id,
      action: a.action,
      description: a.description,
      user_id: a.user_id,
      metadata: typeof a.metadata === 'string' ? JSON.parse(a.metadata) : a.metadata,
      created_at: a.created_at,
    })),
  };
}
