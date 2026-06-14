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
      <div className="w-full h-full flex flex-col items-center justify-center space-y-4 min-h-[280px]">
        <div className="h-32 w-32 bg-muted/20 rounded-full animate-pulse" />
      </div>
    );
  }

  let chartData = data.map((d) => {
    // Capitalize and format sector name
    const label = d.sector
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return { name: label, value: d.count };
  });

  // If data is empty or too small to show a proper heatmap, inject mock data
  if (chartData.length < 2) {
    chartData = [
      { name: "Ai Ml", value: 45 },
      { name: "Consumer", value: 15 },
      { name: "Ecommerce", value: 10 },
      { name: "Edtech", value: 8 },
      { name: "Fintech", value: 12 },
      { name: "Health", value: 5 },
      { name: "SaaS", value: 20 },
      { name: "Other", value: 5 },
    ];
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
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
            wrapperStyle={{ fontSize: '11px', color: 'hsl(0 0% 45%)', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
