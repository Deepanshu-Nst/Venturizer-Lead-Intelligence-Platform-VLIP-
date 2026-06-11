import { useEffect, useRef } from "react";
import { X, ExternalLink } from "lucide-react";
import type { LeadDetail } from "@/features/dashboard/types/dashboard";
import { useLeadDetail } from "@/features/dashboard/hooks/useLeadDetail";
import { formatDate } from "@/shared/lib/utils";

interface LeadDrawerProps {
  leadId: string | null;
  onClose: () => void;
  onViewFullProfile: (id: string) => void;
}

const bucketColors: Record<string, string> = {
  hot: "text-red-600 bg-red-50 border-red-200",
  good: "text-emerald-600 bg-emerald-50 border-emerald-200",
  maybe: "text-amber-600 bg-amber-50 border-amber-200",
  low: "text-slate-500 bg-slate-50 border-slate-200",
};

export function LeadDrawer({ leadId, onClose, onViewFullProfile }: LeadDrawerProps) {
  const { lead, loading } = useLeadDetail(leadId ?? undefined);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (leadId) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [leadId]);

  useEffect(() => {
    if (leadId && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [leadId]);

  if (!leadId) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Lead details">
      <div
        className="absolute inset-0 bg-foreground/10 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        tabIndex={-1}
        className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-background border-l border-border shadow-2xl animate-slide-in-right flex flex-col outline-none"
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-border shrink-0">
          <h2 className="text-sm font-semibold text-foreground">
            {loading ? "Loading…" : lead?.full_name ?? "Lead Details"}
          </h2>
          <div className="flex items-center gap-2">
            {lead && (
              <button
                type="button"
                onClick={() => onViewFullProfile(lead.id)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Full profile
              </button>
            )}
            <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Close drawer"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-muted/60 rounded animate-pulse" />
              ))}
            </div>
          ) : lead ? (
            <>
              <QuickInfo lead={lead} />

              {lead.scores.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Score Breakdown
                  </h3>
                  <div className="space-y-2">
                    {lead.scores.map((s) => (
                      <div key={s.dimension}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs text-foreground capitalize">
                            {s.dimension.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {s.score}/{s.weight}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-foreground/60 transition-all"
                            style={{
                              width: `${s.weight > 0 ? (s.score / s.weight) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {lead.activity_log.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Recent Activity
                  </h3>
                  <div className="space-y-2">
                    {lead.activity_log.slice(0, 5).map((log) => (
                      <div key={log.id} className="text-xs text-muted-foreground">
                        <span className="text-foreground font-medium capitalize">
                          {log.action.replace(/_/g, " ")}
                        </span>
                        <span className="ml-1">{log.description}</span>
                        <span className="block text-xs text-muted-foreground/50 mt-0.5">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Lead not found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickInfo({ lead }: { lead: LeadDetail }) {
  const bucketClass = lead.score_bucket
    ? bucketColors[lead.score_bucket] ?? ""
    : "";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span
          className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${
            lead.type === "founder"
              ? "bg-foreground/5 text-foreground border-foreground/10"
              : "bg-foreground/5 text-foreground border-foreground/10"
          }`}
        >
          {lead.type}
        </span>
        {lead.score_bucket && (
          <span
            className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${bucketClass}`}
          >
            {lead.score_bucket}
          </span>
        )}
        <span className="text-xs text-muted-foreground capitalize">
          {lead.status}
        </span>
      </div>

      <div className="text-sm space-y-1.5">
        <InfoRow label="Email" value={lead.email} />
        <InfoRow label="Phone" value={lead.phone ?? "—"} />
        <InfoRow label="LinkedIn" value={lead.linkedin_url ?? "—"} />
        <InfoRow label="Score" value={lead.score !== null ? String(lead.score) : "—"} />
        <InfoRow label="Source" value={lead.source} />
        <InfoRow label="Created" value={formatDate(lead.created_at)} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground/60 min-w-[72px]">{label}</span>
      <span className="text-foreground truncate">{value}</span>
    </div>
  );
}
