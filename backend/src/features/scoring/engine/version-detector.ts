export type FlowVersion = "legacy" | "v2.1" | "v2.2";

export function detectSubmissionVersion(answers: Record<string, unknown>): FlowVersion {
  // If it has highly specific V2.2 or V2.1 fields
  if (
    answers.market_opportunity !== undefined ||
    answers.cvc_strategic_thesis !== undefined ||
    answers.idea_insight !== undefined ||
    answers.mvp_active_users !== undefined ||
    answers.oa_value_provided !== undefined
  ) {
    // Determine if it's V2.1 or V2.2
    // V2.1 asked "founder_ambition" and "investor_psychology" which V2.2 removed.
    if (answers.founder_ambition !== undefined || answers.investor_psychology !== undefined) {
      return "v2.1";
    }
    return "v2.2";
  }

  return "legacy";
}

export function normalizeAnswersForScoring(
  answers: Record<string, unknown>,
  version: FlowVersion
): Record<string, unknown> {
  if (version === "legacy") return answers;

  const normalized = { ...answers };

  // --- FOUNDER MAPPING ---
  
  // active_users -> mvp_active_users
  if (normalized.active_users === undefined && normalized.mvp_active_users !== undefined) {
    normalized.active_users = normalized.mvp_active_users;
  }

  // --- INVESTOR MAPPING ---
  
  // value_add
  if (normalized.value_add === undefined) {
    normalized.value_add =
      answers.cvc_support_model ??
      answers.oa_value_provided ??
      answers.angel_why_invest ??
      answers.vc_themes ??
      "";
  }

  return normalized;
}
