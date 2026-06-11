import type { BucketDistribution as BucketDist } from "@/features/dashboard/types/dashboard";

const bucketColors: Record<string, string> = {
  hot: "bg-red-500",
  good: "bg-emerald-500",
  maybe: "bg-amber-500",
  low: "bg-slate-400",
  unscored: "bg-muted-foreground/20",
};

const bucketLabels: Record<string, string> = {
  hot: "Hot",
  good: "Good",
  maybe: "Maybe",
  low: "Low",
  unscored: "Unscored",
};

interface QualificationBreakdownProps {
  distribution: BucketDist[];
  loading: boolean;
}

export function QualificationBreakdown({
  distribution,
  loading,
}: QualificationBreakdownProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border p-5 space-y-4">
        <div className="h-4 w-32 bg-muted/60 rounded animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-muted/60 rounded animate-pulse" />
                <div className="h-3 w-12 bg-muted/60 rounded animate-pulse" />
              </div>
              <div className="h-2 bg-muted/60 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (distribution.length === 0) {
    return (
      <div className="rounded-lg border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">
          Qualification Breakdown
        </h3>
        <p className="text-xs text-muted-foreground">
          No qualification data yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Qualification Breakdown
      </h3>
      <div className="space-y-3">
        {distribution.map((d) => (
          <div key={d.bucket}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-foreground">
                {bucketLabels[d.bucket] ?? d.bucket}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {d.count} ({d.percentage}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  bucketColors[d.bucket] ?? "bg-muted-foreground/20"
                }`}
                style={{ width: `${d.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
