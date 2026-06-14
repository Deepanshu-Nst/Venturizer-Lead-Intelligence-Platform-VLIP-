import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { WeeklyTrend } from "@/features/dashboard/types/dashboard";

interface TrendChartProps {
  data: WeeklyTrend[];
  loading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border shadow-lg rounded-lg p-3 space-y-1">
        <p className="text-xs font-semibold text-slate-500 mb-1">Week of {label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <p className="text-sm font-medium text-slate-900">
            {payload[0].value} <span className="font-normal text-slate-500">Inbound Leads</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

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
          Inbound Volume
        </h3>
        <p className="text-xs text-muted-foreground">
          No trend data available yet.
        </p>
      </div>
    );
  }

  const chartData = data.map((d) => {
    // Better date formatting (e.g. "Jun 14")
    const date = new Date(d.week);
    const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return {
      week: label,
      count: d.count,
    };
  });

  return (
    <div className="rounded-lg border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Inbound Volume
      </h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(0 0% 92%)" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: "hsl(0 0% 45%)" }}
              axisLine={{ stroke: "hsl(0 0% 90%)" }}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(0 0% 45%)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(0 0% 80%)", strokeWidth: 1, strokeDasharray: "4 4" }} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCount)"
              activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
