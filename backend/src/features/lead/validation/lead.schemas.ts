import { z } from "zod";

export const startSchema = z.object({
  type: z.enum(["founder", "investor"]),
});

export const answerSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().min(1),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.null(),
  ]),
});

export const submitSchema = z.object({
  sessionId: z.string().uuid().optional(),
  type: z.enum(["founder", "investor"]),
  answers: z.record(z.string(), z.unknown()),
});

export const uploadSchema = z.object({
  leadId: z.string().uuid(),
  type: z.enum(["pitch-deck", "investment-thesis", "other"]),
});
