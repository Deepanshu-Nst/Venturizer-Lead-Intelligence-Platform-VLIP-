import * as dashboardRepo from "../repositories/dashboard.repository.js";
import * as leadsRepo from "../../../shared/db/repositories/leads.repository.js";
import type { DashboardSummary } from "../dto/summary.dto.js";

export async function getSummary(): Promise<DashboardSummary> {
  const stats = await leadsRepo.getDashboardStats();
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [newThisWeek, newThisMonth, avgScore, bucketDist, statusDist, weeklyTrend] =
    await Promise.all([
      dashboardRepo.getCountSince(oneWeekAgo),
      dashboardRepo.getCountSince(oneMonthAgo),
      dashboardRepo.getAvgScore(),
      dashboardRepo.getBucketDistribution(),
      dashboardRepo.getStatusDistribution(),
      dashboardRepo.getWeeklyTrend(),
    ]);

  return {
    total_leads: stats.total_leads,
    total_founders: stats.total_founders,
    total_investors: stats.total_investors,
    hot_leads: stats.hot_leads,
    good_leads: stats.good_leads,
    maybe_leads: stats.maybe_leads,
    low_leads: stats.low_leads,
    conversion_rate: stats.conversion_rate,
    new_leads_this_week: newThisWeek,
    new_leads_this_month: newThisMonth,
    avg_score: avgScore,
    bucket_distribution: bucketDist,
    status_distribution: statusDist,
    weekly_trend: weeklyTrend,
  };
}
