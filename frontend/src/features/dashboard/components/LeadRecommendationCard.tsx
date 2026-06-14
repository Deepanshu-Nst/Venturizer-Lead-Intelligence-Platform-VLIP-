import { CheckCircle2, AlertTriangle, Zap } from "lucide-react";

interface RecommendationCardProps {
  score: number | null;
  scoreBucket: string | null;
  type: "founder" | "investor";
  strengths: string[];
  concerns: string[];
}

interface BandInfo {
  emoji: string;
  label: string;
  tagClass: string;
  action: string;
  actionDetail: string;
}

function getBandInfo(score: number): BandInfo {
  if (score >= 80) {
    return {
      emoji: "🔥",
      label: "Hot",
      tagClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      action: "Immediate outreach + program",
      actionDetail: "Prioritize — reach out within 24 hours",
    };
  }
  if (score >= 60) {
    return {
      emoji: "✅",
      label: "Good",
      tagClass: "bg-blue-50 text-blue-700 border-blue-200",
      action: "Standard follow-up",
      actionDetail: "Nurture with weekly check-ins and targeted content",
    };
  }
  if (score >= 40) {
    return {
      emoji: "📋",
      label: "Maybe",
      tagClass: "bg-amber-50 text-amber-700 border-amber-200",
      action: "Request clarification",
      actionDetail: "Revisit in 30 days after additional engagement",
    };
  }
  return {
    emoji: "📌",
    label: "Low",
    tagClass: "bg-slate-50 text-slate-500 border-slate-200",
    action: "Polite rejection",
    actionDetail: "Low priority — monitor for changes in activity",
  };
}

export function LeadRecommendationCard({ score, type, strengths, concerns }: Omit<RecommendationCardProps, 'scoreBucket'> & { scoreBucket?: string | null }) {
  if (score === null) return null;

  const band = getBandInfo(score);

  // Limit to 3 each for readability
  const topStrengths = strengths.slice(0, 3);
  const topConcerns = concerns.slice(0, 3);

  return (
    <section className="rounded-xl border border-border bg-white overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-[#f7f8fa]">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            Recommendation
          </p>
          <span className="text-[10px] font-medium text-muted-foreground/40 capitalize">
            {type}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Score + band */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{band.emoji}</span>
              <span className="text-[16px] font-bold text-[#0d1428]">{band.label}</span>
            </div>
            <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-semibold ${band.tagClass}`}>
              Score: {score}/100
            </span>
          </div>
          {/* Mini score ring */}
          <div className="relative h-14 w-14 flex-none">
            <svg viewBox="0 0 36 36" className="rotate-[-90deg]" fill="none">
              <circle cx="18" cy="18" r="15.9155" stroke="#f0f0f0" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9155"
                stroke={
                  score >= 80 ? '#10b981' :
                  score >= 60 ? '#3b82f6' :
                  score >= 40 ? '#f59e0b' : '#94a3b8'
                }
                strokeWidth="3"
                strokeDasharray={`${score} ${100 - score}`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Signals */}
        {topStrengths.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3" />
              Signals
            </p>
            <ul className="space-y-1.5">
              {topStrengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-muted-foreground">
                  <span className="text-emerald-500 mt-0.5 flex-none">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Concerns */}
        {topConcerns.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" />
              Concerns
            </p>
            <ul className="space-y-1.5">
              {topConcerns.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-muted-foreground">
                  <span className="text-amber-400 mt-0.5 flex-none">•</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggested action */}
        <div className="rounded-lg bg-[#0d1428] px-4 py-3">
          <div className="flex items-start gap-2.5">
            <Zap className="h-3.5 w-3.5 text-[#dc2626] flex-none mt-0.5" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Suggested Action</p>
              <p className="text-[13px] font-semibold text-white">{band.action}</p>
              <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">{band.actionDetail}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
