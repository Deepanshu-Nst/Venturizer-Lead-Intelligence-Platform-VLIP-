import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Linkedin, Calendar, Shield, CheckCircle, AlertTriangle, Lightbulb, FileText, Activity } from "lucide-react";
import { useLeadDetail } from "@/features/dashboard/hooks/useLeadDetail";
import { generateQualificationSummary } from "@/features/dashboard/lib/qualificationReasoning";
import { formatDate } from "@/shared/lib/utils";
import { PdfViewer } from "@/features/dashboard/components/PdfViewer";
import { DetailSkeleton } from "@/features/dashboard/components/LoadingSkeleton";
import type { LeadDetail } from "@/features/dashboard/types/dashboard";
import { useMemo, useState } from "react";

const bucketStyles: Record<string, string> = {
  hot: "text-red-600 bg-red-50 border-red-200",
  good: "text-emerald-600 bg-emerald-50 border-emerald-200",
  maybe: "text-amber-600 bg-amber-50 border-amber-200",
  low: "text-slate-500 bg-slate-50 border-slate-200",
};

const statusOptions = ["new", "reviewing", "qualified", "contacted", "rejected", "converted"];

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lead, loading, error, refetch } = useLeadDetail(id);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const qualification = useMemo(
    () => (lead ? generateQualificationSummary(lead) : null),
    [lead]
  );

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return;
    setStatusUpdating(true);
    try {
      const apiKey = import.meta.env.VITE_API_KEY as string | undefined;
      const res = await fetch(`/api/v1/dashboard/leads/${lead.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-api-key": apiKey } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        console.error("[LeadDetailPage] status update failed:", res.status, await res.text().catch(() => ""));
      }
      refetch();
    } catch (err) {
      console.error("[LeadDetailPage] status update error:", err);
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) return <DetailSkeleton />;

  if (error) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center" role="alert">
          <p className="text-sm text-destructive font-medium mb-2">{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="text-xs text-destructive hover:text-destructive/80 underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="rounded-lg border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">Lead not found.</p>
        </div>
      </div>
    );
  }

  const bucketClass = lead.score_bucket
    ? bucketStyles[lead.score_bucket] ?? ""
    : "";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 flex-wrap">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              {lead.full_name}
            </h1>
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
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{lead.id}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ProfileSection lead={lead} />

          {qualification && (
            <>
              {(qualification.strengths.length > 0 ||
                qualification.concerns.length > 0) && (
                <QualificationSection qualification={qualification} />
              )}
            </>
          )}

          <AnswersSection lead={lead} />

          <ActivitySection lead={lead} />
        </div>

        <div className="space-y-6">
          <StatusSection
            lead={lead}
            onStatusChange={handleStatusChange}
            updating={statusUpdating}
          />

          <ScoreSection lead={lead} qualification={qualification} />

          <DocumentsSection lead={lead} />

          <NotesSection />
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ lead }: { lead: LeadDetail }) {
  const profile = lead.profile as Record<string, unknown> | null;
  return (
    <section className="rounded-lg border border-border p-5">
      <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Shield className="h-4 w-4 text-muted-foreground/60" />
        Profile
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileField icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={lead.email} />
        <ProfileField icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={lead.phone ?? "—"} />
        <ProfileField
          icon={<Linkedin className="h-3.5 w-3.5" />}
          label="LinkedIn"
          value={lead.linkedin_url ?? "—"}
          href={lead.linkedin_url ?? undefined}
        />
        <ProfileField icon={<Calendar className="h-3.5 w-3.5" />} label="Created" value={formatDate(lead.created_at)} />
        <ProfileField icon={<Calendar className="h-3.5 w-3.5" />} label="Updated" value={formatDate(lead.updated_at)} />
        <ProfileField icon={<FileText className="h-3.5 w-3.5" />} label="Source" value={lead.source} />
      </div>
      {profile && Object.keys(profile).length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {lead.type === "founder" ? "Startup Details" : "Investment Profile"}
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            {Object.entries(profile).map(([key, value]) => {
              if (value === null || value === undefined || key === "id" || key === "lead_id") return null;
              const display =
                typeof value === "boolean"
                  ? value
                    ? "Yes"
                    : "No"
                  : Array.isArray(value)
                    ? value.join(", ")
                    : String(value);
              return (
                <div key={key}>
                  <span className="text-xs text-muted-foreground capitalize block">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span className="text-foreground">{display}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function ProfileField({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <span className="mt-0.5 text-muted-foreground/60 shrink-0">{icon}</span>
      <div className="min-w-0">
        <span className="text-xs text-muted-foreground block">{label}</span>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-foreground hover:text-accent transition-colors truncate block"
          >
            {value}
          </a>
        ) : (
          <span className="text-sm text-foreground truncate block">{value}</span>
        )}
      </div>
    </div>
  );
}

function QualificationSection({
  qualification,
}: {
  qualification: { strengths: string[]; concerns: string[]; explanation: string; recommendation: string };
}) {
  return (
    <section className="rounded-lg border border-border p-5 space-y-4">
      <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-muted-foreground/60" />
        Qualification Summary
      </h2>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {qualification.explanation}
      </p>

      {qualification.strengths.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 mb-2">
            <CheckCircle className="h-3.5 w-3.5" />
            Strengths
          </h3>
          <ul className="space-y-1">
            {qualification.strengths.map((s, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">&bull;</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {qualification.concerns.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-amber-600 flex items-center gap-1.5 mb-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            Concerns
          </h3>
          <ul className="space-y-1">
            {qualification.concerns.map((c, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">&bull;</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-2 border-t border-border">
        <h3 className="text-xs font-semibold text-foreground mb-1">Recommendation</h3>
        <p className="text-sm text-foreground">{qualification.recommendation}</p>
      </div>
    </section>
  );
}

function AnswersSection({ lead }: { lead: LeadDetail }) {
  const profile = lead.profile as Record<string, unknown> | null;
  if (!profile || Object.keys(profile).length === 0) {
    return (
      <section className="rounded-lg border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground/60" />
          Qualification Answers
        </h2>
        <p className="text-xs text-muted-foreground mt-2">No answer data available.</p>
      </section>
    );
  }

  const stageLabels: Record<string, string> = {
    personal: "Personal Info",
    background: "Background",
    startup: "Startup",
    product: "Product",
    traction: "Traction",
    team: "Team",
    fundraising: "Fundraising",
    profile: "Profile",
    strategy: "Strategy",
    timeline: "Timeline",
  };

  const questions: Record<string, { question: string; stage: string }> =
    lead.type === "founder"
      ? {
          prev_startup: { question: "Have you started a company before?", stage: "background" },
          industry_experience: { question: "Years of industry experience", stage: "background" },
          commitment: { question: "Full-time or part-time?", stage: "background" },
          startup_name: { question: "Startup name", stage: "startup" },
          industry: { question: "Industry", stage: "startup" },
          problem_statement: { question: "What problem are you solving?", stage: "startup" },
          target_customer: { question: "Target customer", stage: "startup" },
          mvp_status: { question: "MVP status", stage: "product" },
          active_users: { question: "Active users", stage: "traction" },
          monthly_revenue: { question: "Monthly revenue", stage: "traction" },
          growth_rate: { question: "Growth rate", stage: "traction" },
          team_size: { question: "Team size", stage: "team" },
          has_cofounder: { question: "Has co-founder?", stage: "team" },
          funding_ask: { question: "Funding ask", stage: "fundraising" },
        }
      : {
          investor_type: { question: "Investor type", stage: "profile" },
          preferred_stage: { question: "Preferred stage", stage: "profile" },
          sector_focus: { question: "Sector focus", stage: "profile" },
          cheque_min: { question: "Minimum cheque", stage: "profile" },
          cheque_max: { question: "Maximum cheque", stage: "profile" },
          deployment_timeline: { question: "Deployment timeline", stage: "strategy" },
          portfolio_count: { question: "Portfolio count", stage: "strategy" },
          geography: { question: "Preferred geography", stage: "strategy" },
          follow_on_strategy: { question: "Follow-on strategy", stage: "strategy" },
          value_add: { question: "Value add", stage: "strategy" },
          decision_timeline: { question: "Decision timeline", stage: "timeline" },
          actively_investing: { question: "Actively investing?", stage: "timeline" },
          looking_for_deals: { question: "Looking for deals?", stage: "timeline" },
        };

  const grouped: Record<string, { key: string; value: string }[]> = {};
  for (const [key, value] of Object.entries(profile)) {
    const info = questions[key];
    if (!info) continue;
    const stage = info.stage;
    if (!grouped[stage]) grouped[stage] = [];
    const display =
      typeof value === "boolean"
        ? value
          ? "Yes"
          : "No"
        : Array.isArray(value)
          ? value.join(", ")
          : String(value ?? "");
    grouped[stage].push({ key: info.question, value: display });
  }

  const stageOrder = ["personal", "background", "startup", "product", "traction", "team", "fundraising", "profile", "strategy", "timeline"];

  return (
    <section className="rounded-lg border border-border p-5">
      <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground/60" />
        Qualification Answers
      </h2>
      <div className="space-y-5">
        {stageOrder
          .filter((s) => grouped[s])
          .map((stage) => (
            <div key={stage}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {stageLabels[stage] ?? stage}
              </h3>
              <div className="space-y-2">
                {grouped[stage].map((item) => (
                  <div key={item.key} className="text-sm">
                    <span className="text-muted-foreground/70 block text-xs">
                      {item.key}
                    </span>
                    <span className="text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}

function ScoreSection({
  lead,
  qualification,
}: {
  lead: LeadDetail;
  qualification: { strengths: string[]; concerns: string[]; explanation: string; recommendation: string } | null;
}) {
  return (
    <section className="rounded-lg border border-border p-5">
      <h2 className="text-sm font-semibold text-foreground mb-4">Score</h2>

      {lead.score !== null && (
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-foreground tracking-tight">
            {lead.score}
            <span className="text-base font-normal text-muted-foreground">/100</span>
          </div>
          {lead.score_bucket && (
            <span className="text-xs text-muted-foreground capitalize mt-1 block">
              {lead.score_bucket}
            </span>
          )}
        </div>
      )}

      {lead.scores.length > 0 && (
        <div className="space-y-3">
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
                  className={`h-full rounded-full transition-all ${
                    s.score >= s.weight * 0.6
                      ? "bg-emerald-500"
                      : s.score >= s.weight * 0.4
                        ? "bg-amber-500"
                        : "bg-slate-400"
                  }`}
                  style={{ width: `${s.weight > 0 ? (s.score / s.weight) * 100 : 0}%` }}
                />
              </div>
              {s.rationale && (
                <p className="text-xs text-muted-foreground/60 mt-0.5">{s.rationale}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {qualification && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-foreground leading-relaxed">
            {qualification.recommendation}
          </p>
        </div>
      )}
    </section>
  );
}

function StatusSection({
  lead,
  onStatusChange,
  updating,
}: {
  lead: LeadDetail;
  onStatusChange: (status: string) => void;
  updating: boolean;
}) {
  return (
    <section className="rounded-lg border border-border p-5">
      <h2 className="text-sm font-semibold text-foreground mb-3">Status</h2>
      <div className="flex flex-wrap gap-1.5">
        {statusOptions.map((opt) => {
          const isActive = lead.status === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onStatusChange(opt)}
              disabled={isActive || updating}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                isActive
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
              } disabled:opacity-60 disabled:cursor-default`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DocumentsSection({ lead }: { lead: LeadDetail }) {
  if (lead.documents.length === 0) {
    return (
      <section className="rounded-lg border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground mb-1">Documents</h2>
        <p className="text-xs text-muted-foreground">No documents uploaded.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border p-5">
      <h2 className="text-sm font-semibold text-foreground mb-3">Documents</h2>
      <div className="space-y-2">
        {lead.documents.map((doc) => (
          <PdfViewer
            key={doc.id}
            url={doc.url}
            fileName={doc.file_name}
            fileSize={doc.file_size}
          />
        ))}
      </div>
    </section>
  );
}

function ActivitySection({ lead }: { lead: LeadDetail }) {
  if (lead.activity_log.length === 0) {
    return (
      <section className="rounded-lg border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground/60" />
          Activity
        </h2>
        <p className="text-xs text-muted-foreground mt-2">No activity recorded.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border p-5">
      <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-muted-foreground/60" />
        Activity
      </h2>
      <div className="space-y-3">
        {lead.activity_log.map((log) => (
          <div key={log.id} className="relative pl-4 border-l-2 border-border">
            <div className="text-xs text-foreground font-medium capitalize">
              {log.action.replace(/_/g, " ")}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {log.description}
            </div>
            <div className="text-xs text-muted-foreground/50 mt-0.5">
              {formatDate(log.created_at)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function NotesSection() {
  return (
    <section className="rounded-lg border border-border p-5">
      <h2 className="text-sm font-semibold text-foreground mb-1">Notes</h2>
      <p className="text-xs text-muted-foreground mb-3">
        Internal notes and team comments.
      </p>
      <textarea
        placeholder="Add a note…"
        rows={3}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-shadow resize-none"
      />
    </section>
  );
}
