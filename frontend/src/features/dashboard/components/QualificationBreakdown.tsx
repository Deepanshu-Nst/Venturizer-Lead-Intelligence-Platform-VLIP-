import type { BucketDistribution as BucketDist } from "@/features/dashboard/types/dashboard";

const bucketConfig: Record<string, { bar: string; bg: string; text: string; border: string; label: string }> = {
  hot: { bar: 'bg-[#dc2626]', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Hot' },
  good: { bar: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Good' },
  maybe: { bar: 'bg-amber-400', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Maybe' },
  low: { bar: 'bg-slate-300', bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', label: 'Low' },
  unscored: { bar: 'bg-muted-foreground/20', bg: 'bg-secondary', text: 'text-muted-foreground', border: 'border-border', label: 'Unscored' },
};

interface QualificationBreakdownProps {
  distribution: BucketDist[];
  loading: boolean;
}

export function QualificationBreakdown({ distribution, loading }: QualificationBreakdownProps) {
  if (loading) {
    return (
      <div className="card-premium p-5 space-y-4">
        <div className="h-4 w-36 bg-muted/60 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <div className="h-3 w-14 bg-muted/60 rounded animate-pulse" />
                <div className="h-3 w-10 bg-muted/60 rounded animate-pulse" />
              </div>
              <div className="h-2 bg-muted/60 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (distribution.length === 0) {
    return (
      <div className="card-premium p-5">
        <h3 className="text-[13px] font-semibold text-foreground mb-2">Qualification Breakdown</h3>
        <p className="text-[12px] text-muted-foreground">No data yet. Complete qualifications to see the score distribution.</p>
      </div>
    );
  }

  const total = distribution.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="card-premium p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[13px] font-semibold text-[#0d1428]">Score Distribution</h3>
        <span className="text-[11px] text-muted-foreground">{total} total</span>
      </div>

      <div className="space-y-4">
        {distribution.map((d) => {
          const cfg = bucketConfig[d.bucket] ?? bucketConfig.unscored!;
          return (
            <div key={d.bucket}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    {cfg.label}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground tabular-nums font-medium">
                  {d.count} <span className="text-muted-foreground/50">({d.percentage}%)</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
                  style={{ width: `${d.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
