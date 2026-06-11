import { useEffect, useRef } from "react";
import { X, ExternalLink, Mail, Phone, Link as LinkIcon, Calendar, Activity } from "lucide-react";
import type { LeadDetail } from "@/features/dashboard/types/dashboard";
import { useLeadDetail } from "@/features/dashboard/hooks/useLeadDetail";
import { formatDate } from "@/shared/lib/utils";

interface LeadDrawerProps {
  leadId: string | null;
  onClose: () => void;
  onViewFullProfile: (id: string) => void;
}

const bucketConfig: Record<string, { className: string; bar: string; label: string }> = {
  hot: { className: 'bg-red-50 text-red-700 border-red-200', bar: 'bg-[#dc2626]', label: '🔥 Hot Lead' },
  good: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500', label: '✅ Good Fit' },
  maybe: { className: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-400', label: '📋 Worth Reviewing' },
  low: { className: 'bg-slate-50 text-slate-500 border-slate-200', bar: 'bg-slate-300', label: '📌 Low Priority' },
};

export function LeadDrawer({ leadId, onClose, onViewFullProfile }: LeadDrawerProps) {
  const { lead, loading } = useLeadDetail(leadId ?? undefined);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (leadId) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [leadId]);

  useEffect(() => {
    if (leadId && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [leadId]);

  if (!leadId) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Lead details">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        className="absolute right-0 top-0 bottom-0 w-full max-w-[480px] bg-white border-l border-border shadow-2xl animate-slide-in-right flex flex-col outline-none"
        onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-[60px] border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            {!loading && lead && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0d1428] text-white text-[12px] font-bold">
                {(lead.full_name || '?')[0].toUpperCase()}
              </div>
            )}
            <h2 className="text-[14px] font-semibold text-[#0d1428]">
              {loading ? 'Loading…' : lead?.full_name ?? 'Lead Details'}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {lead && (
              <button
                type="button"
                onClick={() => onViewFullProfile(lead.id)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Full profile
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-[#0d1428]/[0.04] rounded animate-pulse" style={{ width: `${60 + i * 8}%` }} />
              ))}
            </div>
          ) : lead ? (
            <DrawerContent lead={lead} />
          ) : (
            <div className="p-6">
              <p className="text-sm text-muted-foreground">Lead not found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DrawerContent({ lead }: { lead: LeadDetail }) {
  const bucketCfg = lead.score_bucket ? bucketConfig[lead.score_bucket] : null;

  return (
    <div className="divide-y divide-border">
      {/* Score hero section */}
      {lead.score !== null && (
        <div className="px-6 py-5 bg-[#f7f8fa]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Qualification Score
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-[40px] font-bold text-[#0d1428] leading-none tracking-tight">
                  {lead.score}
                </span>
                <span className="text-[18px] text-muted-foreground/40 font-medium">/100</span>
              </div>
              {bucketCfg && (
                <span className={`inline-flex items-center mt-2 rounded-md border px-2.5 py-1 text-[12px] font-semibold ${bucketCfg.className}`}>
                  {bucketCfg.label}
                </span>
              )}
            </div>
            {/* Score donut */}
            <div className="relative h-20 w-20">
              <svg viewBox="0 0 36 36" className="rotate-[-90deg]" fill="none">
                <circle cx="18" cy="18" r="15.9155" stroke="#f0f0f0" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9155"
                  stroke={
                    lead.score_bucket === 'hot' ? '#dc2626' :
                    lead.score_bucket === 'good' ? '#10b981' :
                    lead.score_bucket === 'maybe' ? '#f59e0b' : '#94a3b8'
                  }
                  strokeWidth="3"
                  strokeDasharray={`${lead.score} ${100 - lead.score}`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Contact info */}
      <div className="px-6 py-5 space-y-3">
        <p className="section-label mb-3">Contact</p>
        <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={lead.email} />
        <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={lead.phone ?? '—'} />
        <InfoRow icon={<LinkIcon className="h-3.5 w-3.5" />} label="LinkedIn" value={lead.linkedin_url ?? '—'} link={lead.linkedin_url ?? undefined} />
        <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Submitted" value={formatDate(lead.created_at)} />
      </div>

      {/* Score breakdown */}
      {lead.scores.length > 0 && (
        <div className="px-6 py-5">
          <p className="section-label mb-4">Score Breakdown</p>
          <div className="space-y-3.5">
            {lead.scores.map((s) => (
              <div key={s.dimension}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium text-foreground capitalize">
                    {s.dimension.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {s.score}<span className="text-muted-foreground/40">/{s.weight}</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0d1428] transition-all duration-700"
                    style={{ width: `${s.weight > 0 ? (s.score / s.weight) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity */}
      {lead.activity_log.length > 0 && (
        <div className="px-6 py-5">
          <p className="section-label mb-4">Activity</p>
          <div className="space-y-3">
            {lead.activity_log.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start gap-2.5">
                <div className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-secondary mt-0.5">
                  <Activity className="h-2.5 w-2.5 text-muted-foreground" />
                </div>
                <div>
                  <span className="text-[12px] font-medium text-foreground capitalize">
                    {log.action.replace(/_/g, ' ')}
                  </span>
                  {log.description && (
                    <span className="text-[12px] text-muted-foreground ml-1">{log.description}</span>
                  )}
                  <p className="text-[11px] text-muted-foreground/50 mt-0.5">{formatDate(log.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon, label, value, link
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  link?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-6 w-6 flex-none items-center justify-center text-muted-foreground/50 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 leading-none mb-0.5">{label}</p>
        {link && value !== '—' ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-[#dc2626] hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          <p className="text-[13px] text-foreground truncate">{value}</p>
        )}
      </div>
    </div>
  );
}
