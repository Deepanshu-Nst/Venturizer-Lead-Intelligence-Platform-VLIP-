import { Users, Briefcase, TrendingUp, Target, ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { DashboardSummary } from "@/features/dashboard/types/dashboard";
import { StatCardSkeleton } from "./LoadingSkeleton";

interface SummaryCardsProps {
  summary: DashboardSummary | null;
  loading: boolean;
}

interface CardData {
  title: string;
  value: string | number;
  subtitle: string;
  icon: typeof Users;
  trend?: "up" | "down" | "neutral";
  accentColor?: string;
}

export function SummaryCards({ summary, loading }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const cards: CardData[] = summary
    ? [
        {
          title: "Total Leads",
          value: summary.total_leads,
          subtitle: `${summary.new_leads_this_week} new this week`,
          icon: Users,
          trend: summary.new_leads_this_week > 0 ? "up" : "neutral",
        },
        {
          title: "Founders",
          value: summary.total_founders,
          subtitle: `${summary.total_investors} investors`,
          icon: Briefcase,
          trend: "neutral",
        },
        {
          title: "Avg. Score",
          value: summary.avg_score !== null ? Math.round(summary.avg_score) : "—",
          subtitle: `${summary.conversion_rate}% conversion rate`,
          icon: TrendingUp,
          trend:
            summary.avg_score !== null && summary.avg_score >= 60
              ? "up"
              : summary.avg_score !== null && summary.avg_score < 40
              ? "down"
              : "neutral",
        },
        {
          title: "Hot Leads",
          value: summary.hot_leads,
          subtitle: `${summary.good_leads} good · ${summary.maybe_leads} maybe`,
          icon: Target,
          trend: summary.hot_leads > 0 ? "up" : "neutral",
          accentColor: "text-[#dc2626]",
        },
      ]
    : [];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.title} className="stat-card">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {card.title}
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
              <card.icon className={`h-4 w-4 ${card.accentColor ?? 'text-muted-foreground'}`} />
            </div>
          </div>

          <div className="mt-3 text-[28px] font-bold text-[#0d1428] tracking-tight leading-none">
            {card.value}
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            {card.trend === "up" && <ArrowUp className="h-3 w-3 text-emerald-500 flex-none" />}
            {card.trend === "down" && <ArrowDown className="h-3 w-3 text-[#dc2626] flex-none" />}
            {card.trend === "neutral" && <Minus className="h-3 w-3 text-muted-foreground/40 flex-none" />}
            <span className="text-[12px] text-muted-foreground">{card.subtitle}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
