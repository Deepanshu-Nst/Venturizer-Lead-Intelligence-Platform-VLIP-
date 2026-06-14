export interface BucketDistribution {
  bucket: string;
  count: number;
  percentage: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface WeeklyTrend {
  week: string;
  count: number;
}

export interface DashboardSummary {
  total_leads: number;
  total_founders: number;
  total_investors: number;
  hot_leads: number;
  good_leads: number;
  maybe_leads: number;
  low_leads: number;
  conversion_rate: number;
  new_leads_this_week: number;
  new_leads_this_month: number;
  avg_score: number | null;
  bucket_distribution: BucketDistribution[];
  status_distribution: StatusDistribution[];
  weekly_trend: WeeklyTrend[];
  sector_distribution: { sector: string; count: number }[];
}
