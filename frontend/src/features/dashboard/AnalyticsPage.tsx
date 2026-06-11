import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboardSummary";
import { TrendChart } from "@/features/dashboard/components/Analytics/TrendChart";
import { BucketChart } from "@/features/dashboard/components/Analytics/BucketChart";
import { StatsGrid } from "@/features/dashboard/components/Analytics/StatsGrid";

export function AnalyticsPage() {
  const { summary, loading } = useDashboardSummary();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Lead qualification metrics and trends
        </p>
      </div>

      <StatsGrid summary={summary} loading={loading} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TrendChart data={summary?.weekly_trend ?? []} loading={loading} />
        <BucketChart
          data={summary?.bucket_distribution ?? []}
          loading={loading}
        />
      </div>
    </div>
  );
}
