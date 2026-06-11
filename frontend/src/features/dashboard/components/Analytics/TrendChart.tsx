import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { WeeklyTrend } from "@/features/dashboard/types/dashboard";

interface TrendChartProps {
  data: WeeklyTrend[];
  loading: boolean;
}

export function TrendChart({ data, loading }: TrendChartProps) {
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
          Weekly Trend
        </h3>
        <p className="text-xs text-muted-foreground">
          No trend data available yet.
        </p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    week: d.week.slice(5),
    count: d.count,
  }));

  return (
    <div className="rounded-lg border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Weekly Lead Volume
      </h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
            <XAxis
              dataKey="week"
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
            <Line
              type="monotone"
              dataKey="count"
              stroke="hsl(0 0% 4%)"
              strokeWidth={2}
              dot={{ fill: "hsl(0 0% 4%)", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
