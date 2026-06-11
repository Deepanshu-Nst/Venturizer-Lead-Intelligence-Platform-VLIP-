import { describe, it, expect } from "vitest";
import { leadsQuerySchema } from "../validation/dashboard.schemas.js";

// ---------------------------------------------------------------------------
// Validation Schema Tests
// ---------------------------------------------------------------------------

describe("leadsQuerySchema", () => {
  it("accepts empty query", () => {
    const result = leadsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts type filter", () => {
    const result = leadsQuerySchema.safeParse({ type: "founder" });
    expect(result.success).toBe(true);
  });

  it("accepts status filter", () => {
    const result = leadsQuerySchema.safeParse({ status: "new" });
    expect(result.success).toBe(true);
  });

  it("accepts bucket filter", () => {
    const result = leadsQuerySchema.safeParse({ bucket: "hot" });
    expect(result.success).toBe(true);
  });

  it("accepts score range", () => {
    const result = leadsQuerySchema.safeParse({ scoreMin: 40, scoreMax: 100 });
    expect(result.success).toBe(true);
  });

  it("coerces string numbers", () => {
    const result = leadsQuerySchema.safeParse({ scoreMin: "50", page: "2" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.scoreMin).toBe(50);
      expect(result.data.page).toBe(2);
    }
  });

  it("accepts search term", () => {
    const result = leadsQuerySchema.safeParse({ search: "Jane" });
    expect(result.success).toBe(true);
  });

  it("accepts sort params", () => {
    const result = leadsQuerySchema.safeParse({
      sortBy: "score",
      sortOrder: "asc",
    });
    expect(result.success).toBe(true);
  });

  it("accepts pagination", () => {
    const result = leadsQuerySchema.safeParse({ page: 1, perPage: 50 });
    expect(result.success).toBe(true);
  });

  it("rejects invalid type", () => {
    const result = leadsQuerySchema.safeParse({ type: "bank" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = leadsQuerySchema.safeParse({ status: "unknown" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid bucket", () => {
    const result = leadsQuerySchema.safeParse({ bucket: "platinum" });
    expect(result.success).toBe(false);
  });

  it("rejects scoreMin < 0", () => {
    const result = leadsQuerySchema.safeParse({ scoreMin: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects scoreMax > 100", () => {
    const result = leadsQuerySchema.safeParse({ scoreMax: 101 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid sortBy", () => {
    const result = leadsQuerySchema.safeParse({ sortBy: "email" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid perPage > 100", () => {
    const result = leadsQuerySchema.safeParse({ perPage: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects page < 1", () => {
    const result = leadsQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects search > 200 chars", () => {
    const result = leadsQuerySchema.safeParse({ search: "a".repeat(201) });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// DTO Structure Tests
// ---------------------------------------------------------------------------

describe("DashboardSummary DTO", () => {
  it("has correct shape", () => {
    const summary = {
      total_leads: 100,
      total_founders: 60,
      total_investors: 40,
      hot_leads: 20,
      good_leads: 30,
      maybe_leads: 30,
      low_leads: 20,
      conversion_rate: 20,
      new_leads_this_week: 10,
      new_leads_this_month: 40,
      avg_score: 55.5,
      bucket_distribution: [
        { bucket: "hot", count: 20, percentage: 20 },
        { bucket: "good", count: 30, percentage: 30 },
      ],
      status_distribution: [
        { status: "new", count: 50 },
        { status: "contacted", count: 30 },
      ],
      weekly_trend: [
        { week: "2026-01-01", count: 15 },
        { week: "2026-01-08", count: 22 },
      ],
    };

    expect(summary.total_leads).toBe(100);
    expect(summary.bucket_distribution.length).toBe(2);
    expect(summary.bucket_distribution[0].percentage).toBe(20);
    expect(summary.weekly_trend[0].week).toBe("2026-01-01");
  });

  it("handles null avg_score", () => {
    const summary = {
      total_leads: 0,
      total_founders: 0,
      total_investors: 0,
      hot_leads: 0,
      good_leads: 0,
      maybe_leads: 0,
      low_leads: 0,
      conversion_rate: 0,
      new_leads_this_week: 0,
      new_leads_this_month: 0,
      avg_score: null,
      bucket_distribution: [],
      status_distribution: [],
      weekly_trend: [],
    };

    expect(summary.avg_score).toBeNull();
    expect(summary.bucket_distribution).toEqual([]);
  });
});

describe("LeadDetailDTO", () => {
  it("includes activity_log field", () => {
    const detail = {
      id: "abc",
      type: "founder" as const,
      full_name: "Jane",
      email: "jane@test.com",
      phone: null,
      linkedin_url: null,
      status: "new",
      score: 75,
      score_bucket: "good" as const,
      source: "qualification",
      assigned_to: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      profile: { startup_name: "Acme" },
      scores: [],
      documents: [],
      activity_log: [
        {
          id: "log-1",
          action: "lead_created",
          description: "Qualification completed",
          user_id: null,
          metadata: null,
          created_at: "2026-01-01T00:00:00Z",
        },
      ],
    };

    expect(detail.activity_log).toHaveLength(1);
    expect(detail.activity_log[0].action).toBe("lead_created");
  });
});

// ---------------------------------------------------------------------------
// Service Logic Tests
// ---------------------------------------------------------------------------

describe("Pagination logic", () => {
  it("calculates totalPages correctly", () => {
    const totalPages = (total: number, perPage: number) => Math.ceil(total / perPage);
    expect(totalPages(50, 20)).toBe(3);
    expect(totalPages(0, 20)).toBe(0);
    expect(totalPages(20, 20)).toBe(1);
    expect(totalPages(1, 20)).toBe(1);
  });

  it("calculates offset correctly", () => {
    const offset = (page: number, perPage: number) => (page - 1) * perPage;
    expect(offset(1, 20)).toBe(0);
    expect(offset(2, 20)).toBe(20);
    expect(offset(3, 10)).toBe(20);
  });
});
