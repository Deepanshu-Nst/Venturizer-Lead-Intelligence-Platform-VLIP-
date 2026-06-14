import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface SectorChartProps {
  data: { sector: string; count: number }[];
  loading: boolean;
}

const COLORS = [
  "#10b981", // emerald-500
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#f59e0b", // amber-500
  "#ec4899", // pink-500
  "#64748b", // slate-500
  "#14b8a6", // teal-500
  "#f43f5e", // rose-500
  "#84cc16", // lime-500
];

export function SectorChart({ data, loading }: SectorChartProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border p-5 space-y-4">
        <div className="h-4 w-32 bg-muted/60 rounded animate-pulse" />
        <div className="h-48 bg-muted/20 rounded animate-pulse flex items-center justify-center rounded-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">
          Sector Distribution
        </h3>
        <p className="text-xs text-muted-foreground">
          No sector data available yet.
        </p>
      </div>
    );
  }

  // Format data labels
  const chartData = data.map((d) => {
    // Capitalize and format sector name
    const label = d.sector
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return { name: label, value: d.count };
  });

  return (
    <div className="rounded-lg border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Sector Heatmap
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid hsl(0 0% 90%)",
                background: "hsl(0 0% 100%)",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              itemStyle={{ color: "hsl(0 0% 10%)", fontWeight: 500 }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', color: 'hsl(0 0% 45%)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
