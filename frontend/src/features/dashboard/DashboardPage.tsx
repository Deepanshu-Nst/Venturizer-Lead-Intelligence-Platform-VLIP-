import { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { LeadFilters, LeadSummary } from "@/features/dashboard/types/dashboard";
import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboardSummary";
import { useLeads } from "@/features/dashboard/hooks/useLeads";
import { SummaryCards } from "@/features/dashboard/components/SummaryCards";
import { QualificationBreakdown } from "@/features/dashboard/components/QualificationBreakdown";
import { DashboardFilters } from "@/features/dashboard/components/DashboardFilters";
import { LeadTable } from "@/features/dashboard/components/LeadTable";
import { LeadDrawer } from "@/features/dashboard/components/LeadDrawer";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: LeadFilters = {
    type: (searchParams.get('type') as LeadFilters['type']) || undefined,
    status: (searchParams.get('status') as LeadFilters['status']) || undefined,
    bucket: (searchParams.get('bucket') as LeadFilters['bucket']) || undefined,
    search: searchParams.get('search') || undefined,
    sortBy: (searchParams.get('sort_by') as LeadFilters['sortBy']) || 'created_at',
    sortOrder: (searchParams.get('sort_order') as LeadFilters['sortOrder']) || 'desc',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    perPage: 20,
  };

  const { summary, loading: summaryLoading } = useDashboardSummary();
  const { leads, loading: leadsLoading, error: leadsError, refetch } = useLeads(filters);
  const [drawerLeadId, setDrawerLeadId] = useState<string | null>(null);

  const updateFilters = useCallback(
    (newFilters: LeadFilters) => {
      const params = new URLSearchParams();
      if (newFilters.type) params.set('type', newFilters.type);
      if (newFilters.status) params.set('status', newFilters.status);
      if (newFilters.bucket) params.set('bucket', newFilters.bucket);
      if (newFilters.search) params.set('search', newFilters.search);
      if (newFilters.sortBy && newFilters.sortBy !== 'created_at') params.set('sort_by', newFilters.sortBy);
      if (newFilters.sortOrder && newFilters.sortOrder !== 'desc') params.set('sort_order', newFilters.sortOrder);
      if (newFilters.page && newFilters.page > 1) params.set('page', String(newFilters.page));
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  const handleSort = useCallback(
    (field: NonNullable<LeadFilters['sortBy']>) => {
      updateFilters({
        ...filters,
        sortBy: field,
        sortOrder: filters.sortBy === field && filters.sortOrder === 'desc' ? 'asc' : 'desc',
      });
    },
    [filters, updateFilters]
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#0d1428] tracking-tight">Overview</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Lead qualification intelligence</p>
        </div>
        <div className="text-[11px] text-muted-foreground/40 font-mono">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Stats */}
      <SummaryCards summary={summary} loading={summaryLoading} />

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Lead table column */}
        <div className="min-w-0 space-y-4">
          <DashboardFilters filters={filters} onChange={updateFilters} />

          {leadsError && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3" role="alert">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-none" />
              <p className="text-[13px] text-red-700 flex-1">{leadsError}</p>
              <button
                type="button"
                onClick={refetch}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-red-600 hover:text-red-800 transition-colors"
              >
                <RefreshCcw className="h-3 w-3" />
                Retry
              </button>
            </div>
          )}

          <LeadTable
            leads={leads?.data ?? []}
            loading={leadsLoading}
            total={leads?.total ?? 0}
            page={leads?.page ?? 1}
            totalPages={leads?.totalPages ?? 0}
            perPage={leads?.perPage ?? 20}
            filters={filters}
            onSort={handleSort}
            onPageChange={(page) => updateFilters({ ...filters, page })}
            onSelect={(lead: LeadSummary) => setDrawerLeadId(lead.id)}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <QualificationBreakdown
            distribution={summary?.bucket_distribution ?? []}
            loading={summaryLoading}
          />

          {/* Quick actions */}
          <div className="card-premium p-5 space-y-3">
            <p className="section-label">Quick Actions</p>
            <button
              type="button"
              onClick={() => navigate('/dashboard/analytics')}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors group"
            >
              View Analytics
              <span className="text-muted-foreground/40 group-hover:text-foreground transition-colors">→</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors group"
            >
              Back to site
              <span className="text-muted-foreground/40 group-hover:text-foreground transition-colors">→</span>
            </button>
          </div>
        </div>
      </div>

      <LeadDrawer
        leadId={drawerLeadId}
        onClose={() => setDrawerLeadId(null)}
        onViewFullProfile={(id) => { setDrawerLeadId(null); navigate(`/dashboard/leads/${id}`); }}
      />
    </div>
  );
}
