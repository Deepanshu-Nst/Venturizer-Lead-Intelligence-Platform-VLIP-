import { useEffect, useRef, useState } from "react";
import { X, ExternalLink, Mail, Link as LinkIcon, Activity, CheckCircle, AlertTriangle, FileText, Lightbulb } from "lucide-react";
import type { LeadDetail } from "@/features/dashboard/types/dashboard";
import { useLeadDetail } from "@/features/dashboard/hooks/useLeadDetail";
import { formatDate } from "@/shared/lib/utils";
import { PdfViewer } from "@/features/dashboard/components/PdfViewer";
import { api } from "@/features/dashboard/services/api";

interface LeadDrawerProps {
  leadId: string | null;
  onClose: () => void;
  onViewFullProfile: (id: string) => void;
}

const bucketConfig: Record<string, { className: string; bar: string; label: string; action: string }> = {
  hot: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500', label: '🔥 Hot', action: 'Immediate outreach + program' },
  good: { className: 'bg-blue-50 text-blue-700 border-blue-200', bar: 'bg-blue-500', label: '✅ Good', action: 'Standard follow-up' },
  maybe: { className: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-400', label: '📋 Maybe', action: 'Request clarification' },
  low: { className: 'bg-slate-50 text-slate-500 border-slate-200', bar: 'bg-slate-300', label: '📌 Low', action: 'Polite rejection' },
};

export function LeadDrawer({ leadId, onClose, onViewFullProfile }: LeadDrawerProps) {
  const { lead, loading, refetch } = useLeadDetail(leadId ?? undefined);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (leadId) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [leadId]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (leadId) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [leadId, onClose]);

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return;
    setStatusUpdating(true);
    try {
      await api.patch(`/dashboard/leads/${lead.id}/status`, { status: newStatus });
      await refetch();
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={['fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300', leadId ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'].join(' ')}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        className={['fixed z-50 flex flex-col bg-background shadow-2xl transition-transform duration-300 ease-out', 'bottom-0 left-0 right-0 w-full mx-auto max-w-[800px] h-[85vh] rounded-t-2xl border border-border overflow-hidden', leadId ? 'translate-y-0' : 'translate-y-full'].join(' ')}
      >
        {/* Header */}
        <div className="flex-none flex flex-col px-6 py-5 border-b border-border bg-[#f7f8fa]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2 py-1 bg-white border border-border rounded-md">
                {lead?.type === 'founder' ? '🚀 Founder' : '📈 Investor'}
              </span>
              <span className="text-[12px] font-medium text-muted-foreground">
                {formatDate(lead?.created_at || new Date().toISOString())}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {lead && (
                <button
                  type="button"
                  onClick={() => onViewFullProfile(lead.id)}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  Expand
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {lead && (
            <div className="mt-4 flex items-end justify-between">
              <div>
                <h2 className="text-[24px] font-bold text-foreground leading-tight">{lead.full_name}</h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[14px] text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {lead.email}
                  </span>
                  {lead.linkedin_url && (
                    <a href={lead.linkedin_url} target="_blank" rel="noreferrer" className="text-[14px] text-blue-600 hover:underline flex items-center gap-1">
                      <LinkIcon className="h-3.5 w-3.5" /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-[32px] font-bold text-foreground leading-none">{lead.score}</span>
                  <span className="text-[14px] text-muted-foreground font-medium">/100</span>
                </div>
                {lead.score_bucket && bucketConfig[lead.score_bucket] && (
                  <span className={`inline-block mt-1.5 px-2 py-0.5 text-[11px] font-bold rounded-full ${bucketConfig[lead.score_bucket].className}`}>
                    {bucketConfig[lead.score_bucket].label}
                  </span>
                )}
              </div>
            </div>
          )}
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
            <DrawerContent lead={lead} onStatusChange={handleStatusChange} statusUpdating={statusUpdating} />
          ) : (
            <div className="p-6">
              <p className="text-sm text-muted-foreground">Lead not found.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function DrawerContent({
  lead,
  onStatusChange,
  statusUpdating,
}: {
  lead: LeadDetail;
  onStatusChange: (status: string) => void;
  statusUpdating: boolean;
}) {
  const bucketCfg = lead.score_bucket ? bucketConfig[lead.score_bucket] : null;
  const quickStatuses = ['new', 'reviewing', 'qualified', 'contacted', 'rejected', 'converted'];
  
  const [activeTab, setActiveTab] = useState<'answers' | 'documents' | 'activity'>('answers');

  const doc = lead.documents?.[0];

  return (
    <div className="flex flex-col min-h-full">
      {/* Action Bar */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Status</p>
          {statusUpdating && <span className="text-[10px] text-muted-foreground animate-pulse">Updating...</span>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickStatuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onStatusChange(s)}
              disabled={statusUpdating || lead.status === s}
              className={`rounded-md border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                lead.status === s
                  ? 'bg-[#0d1428] text-white border-[#0d1428]'
                  : 'bg-white text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground'
              } disabled:opacity-50`}
            >
              {s}
            </button>
          ))}
        </div>
        
        {/* Next Action Suggestion */}
        {bucketCfg && (
          <div className="mt-4 rounded-lg border border-[#0d1428]/10 bg-[#0d1428]/[0.02] p-3 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-none" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Recommended Action</p>
              <p className="text-[13px] font-semibold text-foreground">{bucketCfg.action}</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Venture Analyst */}
      <div className="px-6 py-5 border-b border-border space-y-4 bg-slate-50">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            AI Venture Analyst
          </p>
          {!lead.ai_evaluation && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
              REVIEW PENDING...
            </span>
          )}
        </div>
        
        {lead.ai_evaluation ? (
          lead.ai_evaluation.skipped ? (
            <div className="space-y-3 bg-amber-50 border border-amber-200/50 rounded-lg p-4">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-500 flex-none mt-0.5" />
                <p className="text-[13px] text-amber-800 leading-relaxed font-medium">
                  {lead.ai_evaluation.summary}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {lead.ai_evaluation.summary && (
                <p className="text-[13px] text-slate-700 leading-relaxed italic border-l-2 border-blue-500 pl-3">
                  "{lead.ai_evaluation.summary}"
                </p>
              )}
              
              <div className="space-y-3">
                {(lead.ai_evaluation.key_signals?.length > 0 || lead.ai_evaluation.strengths?.length > 0) && (
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-none" />
                    <div>
                      <span className="text-[12px] font-bold text-foreground block mb-1">Score Impact</span>
                      <ul className="space-y-1">
                        {(lead.ai_evaluation.key_signals || lead.ai_evaluation.strengths).slice(0, 3).map((s: string, i: number) => (
                          <li key={i} className="text-[13px] text-emerald-700 leading-relaxed">+ {s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                {lead.ai_evaluation.risks?.length > 0 && (
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-none" />
                    <div>
                      <span className="text-[12px] font-bold text-foreground block mb-1">Risks</span>
                      <ul className="space-y-1">
                        {lead.ai_evaluation.risks.slice(0, 2).map((c: string, i: number) => (
                          <li key={i} className="text-[13px] text-amber-700 leading-relaxed">- {c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="space-y-3 py-2 opacity-60">
            <div className="h-3 bg-slate-200 rounded animate-pulse w-full"></div>
            <div className="h-3 bg-slate-200 rounded animate-pulse w-5/6"></div>
            <div className="h-3 bg-slate-200 rounded animate-pulse w-4/6"></div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border px-4">
        {[
          { id: 'answers', label: 'Answers' },
          { id: 'documents', label: 'Documents' },
          { id: 'activity', label: 'Activity Log' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-[12px] font-bold transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-[#0d1428] text-[#0d1428]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="p-6 flex-1 bg-white">
        {activeTab === 'answers' && (
          <div className="space-y-5">
            {Object.entries(lead.profile || {}).map(([key, value]) => {
              if (key === 'pitch_deck' || key === 'thesis_doc') return null;
              if (key === 'name' || key === 'email') return null;
              return (
                <div key={key}>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-[13px] text-foreground font-medium leading-relaxed">
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            {doc ? (
              <PdfViewer url={doc.url} fileName={doc.file_name} fileSize={doc.file_size} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                  <FileText className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <p className="text-[13px] font-medium text-foreground">No documents attached</p>
                <p className="text-[12px] text-muted-foreground mt-1">This lead did not upload a PDF.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            {lead.activity_log.length > 0 ? (
              lead.activity_log.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-secondary mt-0.5">
                    <Activity className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground capitalize">
                      {log.action.replace(/_/g, ' ')}
                    </p>
                    {log.description && (
                      <p className="text-[12px] text-muted-foreground mt-0.5">{log.description}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground/50 mt-1">{formatDate(log.created_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[13px] text-muted-foreground">No recent activity.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
