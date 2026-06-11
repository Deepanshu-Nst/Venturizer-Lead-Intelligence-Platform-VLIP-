import { describe, it, expect } from "vitest";
import { startSchema, answerSchema, submitSchema, uploadSchema } from "../validation/lead.schemas.js";
import { getQuestions, applyBranching, getNextQuestion, getBranchingRules } from "../services/questions.service.js";

// ---------------------------------------------------------------------------
// Validation Schema Tests
// ---------------------------------------------------------------------------

describe("startSchema", () => {
  it("accepts valid start request", () => {
    const result = startSchema.safeParse({ type: "founder" });
    expect(result.success).toBe(true);
  });

  it("accepts investor type", () => {
    const result = startSchema.safeParse({ type: "investor" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid type", () => {
    const result = startSchema.safeParse({ type: "bank" });
    expect(result.success).toBe(false);
  });

  it("rejects empty body", () => {
    const result = startSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("answerSchema", () => {
  it("accepts valid answer with string value", () => {
    const result = answerSchema.safeParse({
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
      questionId: "full_name",
      value: "Jane Doe",
    });
    expect(result.success).toBe(true);
  });

  it("accepts answer with number value", () => {
    const result = answerSchema.safeParse({
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
      questionId: "active_users",
      value: 150,
    });
    expect(result.success).toBe(true);
  });

  it("accepts answer with boolean value", () => {
    const result = answerSchema.safeParse({
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
      questionId: "looking_for_deals",
      value: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts answer with array value", () => {
    const result = answerSchema.safeParse({
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
      questionId: "sector_focus",
      value: ["fintech", "saas"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid sessionId", () => {
    const result = answerSchema.safeParse({
      sessionId: "not-a-uuid",
      questionId: "full_name",
      value: "Jane",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty questionId", () => {
    const result = answerSchema.safeParse({
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
      questionId: "",
      value: "Jane",
    });
    expect(result.success).toBe(false);
  });
});

describe("submitSchema", () => {
  it("accepts valid submit request", () => {
    const result = submitSchema.safeParse({
      type: "founder",
      answers: { email: "jane@example.com", full_name: "Jane Doe" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts with sessionId", () => {
    const result = submitSchema.safeParse({
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
      type: "investor",
      answers: { email: "john@example.com" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid type", () => {
    const result = submitSchema.safeParse({
      type: "other",
      answers: {},
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing answers", () => {
    const result = submitSchema.safeParse({ type: "founder" });
    expect(result.success).toBe(false);
  });
});

describe("uploadSchema", () => {
  it("accepts valid upload request", () => {
    const result = uploadSchema.safeParse({
      leadId: "550e8400-e29b-41d4-a716-446655440000",
      type: "pitch-deck",
    });
    expect(result.success).toBe(true);
  });

  it("accepts investment-thesis type", () => {
    const result = uploadSchema.safeParse({
      leadId: "550e8400-e29b-41d4-a716-446655440000",
      type: "investment-thesis",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid document type", () => {
    const result = uploadSchema.safeParse({
      leadId: "550e8400-e29b-41d4-a716-446655440000",
      type: "resume",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing leadId", () => {
    const result = uploadSchema.safeParse({ type: "other" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Questions Service Tests
// ---------------------------------------------------------------------------

describe("getQuestions", () => {
  it("returns founder questions for founder type", () => {
    const questions = getQuestions("founder");
    expect(questions.length).toBe(18);
    expect(questions[0].id).toBe("full_name");
    expect(questions[questions.length - 1].id).toBe("funding_ask");
  });

  it("returns investor questions for investor type", () => {
    const questions = getQuestions("investor");
    expect(questions.length).toBe(17);
    expect(questions[0].id).toBe("full_name");
    expect(questions[questions.length - 1].id).toBe("looking_for_deals");
  });

  it("returns empty array for unknown type", () => {
    const questions = getQuestions("unknown");
    expect(questions).toEqual([]);
  });
});

describe("getBranchingRules", () => {
  it("returns empty rules for founder", () => {
    const rules = getBranchingRules("founder");
    expect(rules).toEqual([]);
  });

  it("returns investor branching rules", () => {
    const rules = getBranchingRules("investor");
    expect(rules.length).toBe(1);
    expect(rules[0].questionId).toBe("actively_investing");
  });
});

describe("applyBranching", () => {
  const allQuestions = getQuestions("investor");

  it("does not remove questions when answer is not given", () => {
    const filtered = applyBranching(allQuestions, {}, "investor");
    expect(filtered.length).toBe(allQuestions.length);
  });

  it("removes looking_for_deals when actively_investing is 'not-yet'", () => {
    const filtered = applyBranching(allQuestions, { actively_investing: "not-yet" }, "investor");
    expect(filtered.find((q) => q.id === "looking_for_deals")).toBeUndefined();
    expect(filtered.length).toBe(allQuestions.length - 1);
  });

  it("removes looking_for_deals when actively_investing is 'paused'", () => {
    const filtered = applyBranching(allQuestions, { actively_investing: "paused" }, "investor");
    expect(filtered.find((q) => q.id === "looking_for_deals")).toBeUndefined();
    expect(filtered.length).toBe(allQuestions.length - 1);
  });

  it("keeps looking_for_deals when actively_investing is 'yes'", () => {
    const filtered = applyBranching(allQuestions, { actively_investing: "yes" }, "investor");
    expect(filtered.find((q) => q.id === "looking_for_deals")).toBeDefined();
    expect(filtered.length).toBe(allQuestions.length);
  });

  it("does not apply branching for founder type", () => {
    const founderQuestions = getQuestions("founder");
    const filtered = applyBranching(founderQuestions, {}, "founder");
    expect(filtered.length).toBe(founderQuestions.length);
  });
});

describe("getNextQuestion", () => {
  it("returns next index", () => {
    expect(getNextQuestion(0, 10)).toBe(1);
  });

  it("returns null when at last question", () => {
    expect(getNextQuestion(9, 10)).toBeNull();
  });

  it("returns null when current index equals total", () => {
    expect(getNextQuestion(10, 10)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Question Structure Tests
// ---------------------------------------------------------------------------

describe("founder questions", () => {
  const questions = getQuestions("founder");

  it("includes 18 founder questions", () => {
    expect(questions.length).toBe(18);
  });

  it("ends with funding_ask question", () => {
    expect(questions[questions.length - 1].id).toBe("funding_ask");
  });
});

describe("investor questions", () => {
  const questions = getQuestions("investor");

  it("includes sector_focus as multiselect", () => {
    const sector = questions.find((q) => q.id === "sector_focus");
    expect(sector).toBeDefined();
    expect(sector?.type).toBe("multiselect");
  });

  it("includes boolean type for looking_for_deals", () => {
    const deals = questions.find((q) => q.id === "looking_for_deals");
    expect(deals).toBeDefined();
    expect(deals?.type).toBe("boolean");
  });
});
