import { z } from "zod";

export const startSchema = z.object({
  type: z.enum(["founder", "investor"]),
});

export const answerSchema = z.object({
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()]),
});

export const completeSchema = z.object({
  sessionId: z.string().min(1),
  type: z.enum(["founder", "investor"]),
  answers: z.record(z.unknown()),
});

export type StartBody = z.infer<typeof startSchema>;
export type AnswerBody = z.infer<typeof answerSchema>;
export type CompleteBody = z.infer<typeof completeSchema>;
