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
}).superRefine((data, ctx) => {
  const intFields = ["industry_experience", "active_users", "team_size", "portfolio_count"];
  const decimalFields = ["monthly_revenue", "growth_rate", "funding_ask", "cheque_min", "cheque_max"];
  
  for (const field of [...intFields, ...decimalFields]) {
    const val = data.answers[field];
    if (val !== undefined && val !== null && val !== "") {
      const num = Number(val);
      if (isNaN(num)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Field ${field} must be a valid numeric value`,
          path: ["answers", field],
        });
      }
    }
  }
});

export const uploadSchema = z.object({
  leadId: z.string().uuid(),
  type: z.enum(["pitch-deck", "investment-thesis", "other"]),
});
