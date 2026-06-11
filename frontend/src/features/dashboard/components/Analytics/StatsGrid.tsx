import type { DashboardSummary } from "@/features/dashboard/types/dashboard";

interface StatsGridProps {
  summary: DashboardSummary | null;
  loading: boolean;
}

export function StatsGrid({ summary, loading }: StatsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border border-border p-4 space-y-2 animate-pulse">
            <div className="h-3 w-20 bg-muted/60 rounded" />
            <div className="h-6 w-12 bg-muted/60 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const stats = [
    { label: "Total Leads", value: summary.total_leads },
    { label: "Conversion Rate", value: `${summary.conversion_rate}%` },
    {
      label: "Avg Score",
      value: summary.avg_score !== null ? Math.round(summary.avg_score).toString() : "—",
    },
    { label: "This Week", value: `+${summary.new_leads_this_week}` },
    { label: "Founders", value: summary.total_founders },
    { label: "Investors", value: summary.total_investors },
    { label: "Hot", value: summary.hot_leads },
    { label: "Good", value: summary.good_leads },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-border p-4"
        >
          <span className="text-xs text-muted-foreground block mb-1">
            {stat.label}
          </span>
          <span className="text-lg font-bold text-foreground tracking-tight">
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
