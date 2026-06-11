import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { BucketDistribution } from "@/features/dashboard/types/dashboard";

interface BucketChartProps {
  data: BucketDistribution[];
  loading: boolean;
}

const barColors: Record<string, string> = {
  hot: "#ef4444",
  good: "#10b981",
  maybe: "#f59e0b",
  low: "#94a3b8",
  unscored: "#cbd5e1",
};

const barLabels: Record<string, string> = {
  hot: "Hot",
  good: "Good",
  maybe: "Maybe",
  low: "Low",
  unscored: "Unscored",
};

export function BucketChart({ data, loading }: BucketChartProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border p-5 space-y-4">
        <div className="h-4 w-32 bg-muted/60 rounded animate-pulse" />
        <div className="h-48 bg-muted/20 rounded animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">
          Bucket Distribution
        </h3>
        <p className="text-xs text-muted-foreground">
          No bucket data available yet.
        </p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: barLabels[d.bucket] ?? d.bucket,
    count: d.count,
    fill: barColors[d.bucket] ?? "#cbd5e1",
  }));

  return (
    <div className="rounded-lg border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Qualification Breakdown
      </h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "hsl(0 0% 45%)" }}
              axisLine={{ stroke: "hsl(0 0% 90%)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(0 0% 45%)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 6,
                border: "1px solid hsl(0 0% 90%)",
                background: "hsl(0 0% 100%)",
              }}
            />
            <Bar
              dataKey="count"
              radius={[3, 3, 0, 0]}
              barSize={40}
            >
              {chartData.map((entry, index) => (
                <rect key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
