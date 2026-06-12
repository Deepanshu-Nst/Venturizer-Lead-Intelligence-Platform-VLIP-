import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboardSummary";
import { TrendChart } from "@/features/dashboard/components/Analytics/TrendChart";
import { Users, Target, Activity, Percent, BrainCircuit, ArrowRight, Zap } from "lucide-react";

export function AnalyticsPage() {
  const { summary, loading } = useDashboardSummary();

  const getStatusCount = (status: string) => {
    return summary?.status_distribution.find(s => s.status === status)?.count ?? 0;
  };

  const qualifiedRate = summary?.total_leads 
    ? Math.round(((summary.hot_leads + summary.good_leads) / summary.total_leads) * 100) 
    : 0;

  const founderPercent = summary?.total_leads 
    ? Math.round((summary.total_founders / summary.total_leads) * 100) 
    : 0;

  const investorPercent = summary?.total_leads 
    ? Math.round((summary.total_investors / summary.total_leads) * 100) 
    : 0;

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <BrainCircuit className="h-4 w-4 text-[#dc2626]" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Operator Intelligence</p>
          </div>
          <h1 className="text-[28px] font-bold text-[#0d1428] tracking-tight leading-none">Firm Analytics</h1>
        </div>
        <div className="text-[12px] font-medium text-muted-foreground/50">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0d1428] border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Row: Core Health */}
          <div className="grid gap-5 md:grid-cols-4">
            <MetricCard
              icon={<Zap className="h-4 w-4 text-emerald-500" />}
              label="Pipeline Velocity"
              value={`${summary?.new_leads_this_week ?? 0}`}
              sub="New leads this week"
            />
            <MetricCard
              icon={<Target className="h-4 w-4 text-indigo-500" />}
              label="Qualified Rate"
              value={`${qualifiedRate}%`}
              sub="Scores > 70/100"
            />
            <MetricCard
              icon={<Activity className="h-4 w-4 text-amber-500" />}
              label="Review Queue"
              value={`${getStatusCount('new') + getStatusCount('reviewing')}`}
              sub="Pending operator action"
            />
            <MetricCard
              icon={<Users className="h-4 w-4 text-blue-500" />}
              label="Total Network"
              value={`${summary?.total_leads ?? 0}`}
              sub="Founders & Investors"
            />
          </div>

          {/* Middle Row: Funnel & Trends */}
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            {/* Trend Chart */}
            <div className="rounded-xl border border-border bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[14px] font-bold text-[#0d1428]">Inbound Volume (30 Days)</h3>
              </div>
              <div className="h-[240px]">
                <TrendChart data={summary?.weekly_trend ?? []} loading={loading} />
              </div>
            </div>

            {/* Persona Split */}
            <div className="rounded-xl border border-border bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] p-6 flex flex-col">
              <h3 className="text-[14px] font-bold text-[#0d1428] mb-6 flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                Network Composition
              </h3>
              <div className="flex-1 flex flex-col justify-center space-y-6">
                <div>
                  <div className="flex justify-between text-[13px] mb-2">
                    <span className="font-bold text-[#0d1428]">Founders</span>
                    <span className="text-muted-foreground font-medium">{founderPercent}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-[#0d1428]" style={{ width: `${founderPercent}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">{summary?.total_founders} total founders</p>
                </div>
                <div>
                  <div className="flex justify-between text-[13px] mb-2">
                    <span className="font-bold text-[#0d1428]">Investors</span>
                    <span className="text-muted-foreground font-medium">{investorPercent}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${investorPercent}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">{summary?.total_investors} total investors</p>
                </div>
              </div>
            </div>
          </div>

          {/* Funnel */}
          <div className="rounded-xl border border-border bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] p-6">
            <h3 className="text-[14px] font-bold text-[#0d1428] mb-6">Deal Flow Funnel</h3>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
              {[
                { label: 'Fresh Inbound', count: getStatusCount('new') },
                { label: 'Under Review', count: getStatusCount('reviewing') },
                { label: 'Qualified', count: getStatusCount('qualified') },
                { label: 'Engaged', count: getStatusCount('contacted') }
              ].map((step, idx, arr) => (
                <div key={step.label} className="flex items-center flex-1 w-full">
                  <div className="flex-1 bg-[#f7f8fa] border border-border/50 rounded-xl p-5 text-center relative overflow-hidden group hover:border-border transition-colors">
                    <p className="text-[32px] font-extrabold text-[#0d1428] tracking-tight">{step.count}</p>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{step.label}</p>
                  </div>
                  {idx < arr.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground/20 mx-3 hidden md:block flex-none" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, sub }: { icon: React.ReactNode, label: string, value: string, sub: string }) {
  return (
    <div className="rounded-xl border border-border bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] p-5 relative overflow-hidden group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/50 border border-border group-hover:bg-secondary transition-colors">
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] font-bold text-[#0d1428] leading-none tracking-tight">{value}</span>
        </div>
        <p className="text-[12px] text-muted-foreground mt-2">{sub}</p>
      </div>
    </div>
  );
}
