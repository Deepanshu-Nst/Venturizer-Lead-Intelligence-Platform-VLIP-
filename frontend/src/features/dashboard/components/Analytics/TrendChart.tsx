import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { WeeklyTrend } from "@/features/dashboard/types/dashboard";

interface TrendChartProps {
  data: WeeklyTrend[];
  loading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border shadow-lg rounded-lg p-3 space-y-1">
        <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
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
      <div className="w-full h-full flex items-center justify-center">
        <div className="h-4 w-32 bg-muted/60 rounded animate-pulse" />
      </div>
    );
  }

  // Generate the last 30 days ending with the current day
  const NUM_DAYS = 30;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const lastDays = [];
  for (let i = NUM_DAYS - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    lastDays.push(d);
  }

  const chartData = lastDays.map(dayDate => {
    // Find matching day in data (timezone safe comparison)
    const match = data?.find(d => {
      // Create date from YYYY-MM-DD
      const [year, month, day] = d.week.split('-');
      const dDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      dDate.setHours(0, 0, 0, 0);
      return dDate.getTime() === dayDate.getTime();
    });

    return {
      week: dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: match ? Number(match.count) : 0,
    };
  });

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(0 0% 92%)" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: "hsl(0 0% 45%)" }}
            axisLine={{ stroke: "hsl(0 0% 90%)" }}
            tickLine={false}
            dy={10}
          />
          <YAxis
            domain={[0, 'auto']}
            tick={{ fontSize: 11, fill: "hsl(0 0% 45%)" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(0 0% 80%)", strokeWidth: 1, strokeDasharray: "4 4" }} />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 0, fill: "#10b981" }}
            activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
