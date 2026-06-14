import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboardSummary";
import { TrendChart } from "@/features/dashboard/components/Analytics/TrendChart";
import { SectorChart } from "@/features/dashboard/components/Analytics/SectorChart";
import {
  Users, Target, Activity, Percent, BrainCircuit,
  ArrowRight, Zap, TrendingUp, Flame, CheckCircle2,
  AlertTriangle, ArrowUpRight, BarChart3
} from "lucide-react";

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

  const hotPercent = summary?.total_leads
    ? Math.round((summary.hot_leads / summary.total_leads) * 100)
    : 0;

  const goodPercent = summary?.total_leads
    ? Math.round((summary.good_leads / summary.total_leads) * 100)
    : 0;

  const maybePercent = summary?.total_leads
    ? Math.round((summary.maybe_leads / summary.total_leads) * 100)
    : 0;

  const lowPercent = summary?.total_leads
    ? Math.round((summary.low_leads / summary.total_leads) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#0d1428] to-[#1a2744]">
              <BrainCircuit className="h-3.5 w-3.5 text-white" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Operator Intelligence</p>
          </div>
          <h1 className="text-[28px] font-bold text-[#0d1428] tracking-tight leading-none">Firm Analytics</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Pipeline health, qualification metrics, and deal flow insights.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground/40">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0d1428] border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Row: Core Health */}
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard
              icon={<Zap className="h-4 w-4 text-emerald-500" />}
              accentColor="emerald"
              label="Pipeline Velocity"
              value={`${summary?.new_leads_this_week ?? 0}`}
              sub="New leads this week"
              badge={summary?.new_leads_this_month ? `${summary.new_leads_this_month} this month` : undefined}
            />
            <MetricCard
              icon={<Target className="h-4 w-4 text-indigo-500" />}
              accentColor="indigo"
              label="Qualified Rate"
              value={`${qualifiedRate}%`}
              sub="Hot + Good / Total"
              badge={`${summary?.hot_leads ?? 0} hot, ${summary?.good_leads ?? 0} good`}
            />
            <MetricCard
              icon={<Activity className="h-4 w-4 text-amber-500" />}
              accentColor="amber"
              label="Review Queue"
              value={`${getStatusCount('new') + getStatusCount('reviewing')}`}
              sub="Pending operator action"
              badge={`${getStatusCount('new')} new, ${getStatusCount('reviewing')} reviewing`}
            />
            <MetricCard
              icon={<Users className="h-4 w-4 text-blue-500" />}
              accentColor="blue"
              label="Total Network"
              value={`${summary?.total_leads ?? 0}`}
              sub="Founders & Investors"
              badge={summary?.avg_score !== null ? `Avg score: ${Math.round(summary?.avg_score ?? 0)}` : undefined}
            />
          </div>

          {/* Middle Row: Trend Chart + Score Distribution */}
          <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
            {/* Trend Chart */}
            <div className="card-premium overflow-hidden">
              <div className="flex justify-between items-center px-6 py-5 border-b border-border/50">
                <div>
                  <h3 className="text-[14px] font-bold text-[#0d1428] flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground/50" />
                    Inbound Volume
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Weekly lead submissions over time</p>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider">30 days</span>
              </div>
              <div className="p-6">
                <div className="h-[220px]">
                  <TrendChart data={summary?.weekly_trend ?? []} loading={loading} />
                </div>
              </div>
            </div>

            {/* Score Distribution */}
            <div className="card-premium overflow-hidden">
              <div className="px-6 py-5 border-b border-border/50">
                <h3 className="text-[14px] font-bold text-[#0d1428] flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground/50" />
                  Score Distribution
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Qualification outcomes breakdown</p>
              </div>
              <div className="p-6 space-y-5">
                <BucketBar
                  emoji="🔥"
                  label="Hot"
                  count={summary?.hot_leads ?? 0}
                  percent={hotPercent}
                  color="bg-emerald-500"
                  textColor="text-emerald-700"
                  bgColor="bg-emerald-50"
                />
                <BucketBar
                  emoji="✅"
                  label="Good"
                  count={summary?.good_leads ?? 0}
                  percent={goodPercent}
                  color="bg-blue-500"
                  textColor="text-blue-700"
                  bgColor="bg-blue-50"
                />
                <BucketBar
                  emoji="📋"
                  label="Maybe"
                  count={summary?.maybe_leads ?? 0}
                  percent={maybePercent}
                  color="bg-amber-400"
                  textColor="text-amber-700"
                  bgColor="bg-amber-50"
                />
                <BucketBar
                  emoji="📌"
                  label="Low"
                  count={summary?.low_leads ?? 0}
                  percent={lowPercent}
                  color="bg-slate-300"
                  textColor="text-slate-600"
                  bgColor="bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Bottom Row: Persona Split + Funnel */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Network Composition */}
            <div className="card-premium overflow-hidden">
              <div className="px-6 py-5 border-b border-border/50">
                <h3 className="text-[14px] font-bold text-[#0d1428] flex items-center gap-2">
                  <Percent className="h-4 w-4 text-muted-foreground/50" />
                  Network Composition
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Founder vs. Investor split</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center">
                      <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#f0f0f0" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="40"
                          fill="none"
                          stroke="#0d1428"
                          strokeWidth="8"
                          strokeDasharray={`${founderPercent * 2.51} ${251 - founderPercent * 2.51}`}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                          className="transition-all duration-700"
                        />
                      </svg>
                      <span className="absolute text-[18px] font-bold text-[#0d1428]">{founderPercent}%</span>
                    </div>
                    <p className="text-[13px] font-bold text-[#0d1428] mt-3">Founders</p>
                    <p className="text-[11px] text-muted-foreground">{summary?.total_founders} total</p>
                  </div>
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center">
                      <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#f0f0f0" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="40"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="8"
                          strokeDasharray={`${investorPercent * 2.51} ${251 - investorPercent * 2.51}`}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                          className="transition-all duration-700"
                        />
                      </svg>
                      <span className="absolute text-[18px] font-bold text-emerald-600">{investorPercent}%</span>
                    </div>
                    <p className="text-[13px] font-bold text-[#0d1428] mt-3">Investors</p>
                    <p className="text-[11px] text-muted-foreground">{summary?.total_investors} total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Deal Flow Funnel */}
            <div className="card-premium overflow-hidden">
              <div className="px-6 py-5 border-b border-border/50">
                <h3 className="text-[14px] font-bold text-[#0d1428] flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/50" />
                  Deal Flow Funnel
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Application lifecycle stages</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between gap-2">
                  {[
                    { label: 'Inbound', count: getStatusCount('new'), color: 'bg-blue-500', lightBg: 'bg-blue-50' },
                    { label: 'Review', count: getStatusCount('reviewing'), color: 'bg-amber-400', lightBg: 'bg-amber-50' },
                    { label: 'Qualified', count: getStatusCount('qualified'), color: 'bg-emerald-500', lightBg: 'bg-emerald-50' },
                    { label: 'Engaged', count: getStatusCount('contacted'), color: 'bg-indigo-500', lightBg: 'bg-indigo-50' },
                  ].map((step, idx, arr) => (
                    <div key={step.label} className="flex items-center flex-1">
                      <div className={`flex-1 ${step.lightBg} rounded-xl p-4 text-center border border-border/30 transition-all hover:shadow-sm`}>
                        <div className={`inline-flex h-2 w-2 rounded-full ${step.color} mb-2`} />
                        <p className="text-[24px] font-extrabold text-[#0d1428] tracking-tight leading-none">{step.count}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">{step.label}</p>
                      </div>
                      {idx < arr.length - 1 && (
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/20 mx-1 flex-none" />
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Conversion stats */}
                <div className="mt-5 pt-4 border-t border-border/50 grid grid-cols-3 gap-4">
                  <MiniStat label="Converted" value={getStatusCount('converted')} icon={<CheckCircle2 className="h-3 w-3 text-emerald-500" />} />
                  <MiniStat label="Rejected" value={getStatusCount('rejected')} icon={<AlertTriangle className="h-3 w-3 text-red-400" />} />
                  <MiniStat label="Conv. Rate" value={`${summary?.conversion_rate ?? 0}%`} icon={<Flame className="h-3 w-3 text-amber-500" />} />
                </div>
              </div>
            </div>
          </div>

          {/* New Row: Sector Distribution */}
          <div className="grid gap-4 lg:grid-cols-1">
            <div className="card-premium overflow-hidden">
              <div className="px-6 py-5 border-b border-border/50">
                <h3 className="text-[14px] font-bold text-[#0d1428] flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-muted-foreground/50" />
                  Venturizer Sector Heatmap
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Combined founder industry and investor focus areas</p>
              </div>
              <div className="p-6">
                <SectorChart data={summary?.sector_distribution ?? []} loading={loading} />
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  accentColor,
  label,
  value,
  sub,
  badge,
}: {
  icon: React.ReactNode;
  accentColor: string;
  label: string;
  value: string;
  sub: string;
  badge?: string;
}) {
  return (
    <div className="card-premium p-5 relative overflow-hidden group">
      {/* Subtle accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-${accentColor}-500/30 group-hover:bg-${accentColor}-500/60 transition-colors`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-${accentColor}-50 border border-${accentColor}-100 group-hover:shadow-sm transition-shadow`}>
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1.5">{label}</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] font-bold text-[#0d1428] leading-none tracking-tight">{value}</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5">{sub}</p>
        {badge && (
          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground/50 bg-secondary/50 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

function BucketBar({
  emoji,
  label,
  count,
  percent,
  color,
  textColor,
  bgColor,
}: {
  emoji: string;
  label: string;
  count: number;
  percent: number;
  color: string;
  textColor: string;
  bgColor: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">{emoji}</span>
          <span className={`text-[13px] font-bold ${textColor}`}>{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-medium text-muted-foreground tabular-nums">{count} leads</span>
          <span className={`text-[11px] font-bold ${textColor} ${bgColor} px-1.5 py-0.5 rounded`}>{percent}%</span>
        </div>
      </div>
      <div className="h-2 w-full bg-secondary/70 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${Math.max(percent, 2)}%` }}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 mb-1">
        {icon}
        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-[16px] font-bold text-[#0d1428]">{value}</p>
    </div>
  );
}
