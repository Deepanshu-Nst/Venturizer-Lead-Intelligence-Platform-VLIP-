import { Users, Briefcase, TrendingUp, Target, ArrowUp, ArrowDown } from "lucide-react";
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
        },
        {
          title: "Avg Score",
          value: summary.avg_score !== null ? Math.round(summary.avg_score) : "—",
          subtitle: `${summary.conversion_rate}% conversion`,
          icon: TrendingUp,
          trend:
            summary.avg_score !== null && summary.avg_score >= 50
              ? "up"
              : "down",
        },
        {
          title: "Hot Leads",
          value: summary.hot_leads,
          subtitle: `${summary.good_leads} good · ${summary.maybe_leads} maybe · ${summary.low_leads} low`,
          icon: Target,
          trend: summary.hot_leads > 0 ? "up" : "neutral",
        },
      ]
    : [];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-lg border border-border bg-background p-5"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
              {card.title}
            </span>
            <card.icon className="h-4 w-4 text-muted-foreground/40" />
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {card.value}
          </div>
          <div className="flex items-center gap-1 mt-1">
            {card.trend === "up" && (
              <ArrowUp className="h-3 w-3 text-emerald-500" />
            )}
            {card.trend === "down" && (
              <ArrowDown className="h-3 w-3 text-red-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {card.subtitle}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
