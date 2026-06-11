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

export function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: LeadFilters = {
    type: (searchParams.get("type") as LeadFilters["type"]) || undefined,
    status: (searchParams.get("status") as LeadFilters["status"]) || undefined,
    bucket: (searchParams.get("bucket") as LeadFilters["bucket"]) || undefined,
    search: searchParams.get("search") || undefined,
    sortBy: (searchParams.get("sort_by") as LeadFilters["sortBy"]) || "created_at",
    sortOrder: (searchParams.get("sort_order") as LeadFilters["sortOrder"]) || "desc",
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    perPage: 20,
  };

  const { summary, loading: summaryLoading } = useDashboardSummary();
  const { leads, loading: leadsLoading, error: leadsError, refetch } = useLeads(filters);
  const [drawerLeadId, setDrawerLeadId] = useState<string | null>(null);

  const updateFilters = useCallback(
    (newFilters: LeadFilters) => {
      const params = new URLSearchParams();
      if (newFilters.type) params.set("type", newFilters.type);
      if (newFilters.status) params.set("status", newFilters.status);
      if (newFilters.bucket) params.set("bucket", newFilters.bucket);
      if (newFilters.search) params.set("search", newFilters.search);
      if (newFilters.sortBy && newFilters.sortBy !== "created_at")
        params.set("sort_by", newFilters.sortBy);
      if (newFilters.sortOrder && newFilters.sortOrder !== "desc")
        params.set("sort_order", newFilters.sortOrder);
      if (newFilters.page && newFilters.page > 1) params.set("page", String(newFilters.page));
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  const handleSort = useCallback(
    (field: NonNullable<LeadFilters["sortBy"]>) => {
      const isSameField = filters.sortBy === field;
      updateFilters({
        ...filters,
        sortBy: field,
        sortOrder: isSameField && filters.sortOrder === "desc" ? "asc" : "desc",
      });
    },
    [filters, updateFilters]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateFilters({ ...filters, page });
    },
    [filters, updateFilters]
  );

  const handleSelectLead = useCallback(
    (lead: LeadSummary) => {
      setDrawerLeadId(lead.id);
    },
    []
  );

  const handleViewFullProfile = useCallback(
    (id: string) => {
      setDrawerLeadId(null);
      navigate(`/dashboard/leads/${id}`);
    },
    [navigate]
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">
          Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Lead qualification summary
        </p>
      </div>

      <SummaryCards summary={summary} loading={summaryLoading} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <DashboardFilters filters={filters} onChange={updateFilters} />

          {leadsError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4" role="alert">
              <div className="flex items-center justify-between">
                <p className="text-sm text-destructive">{leadsError}</p>
                <button
                  type="button"
                  onClick={refetch}
                  className="text-xs text-destructive hover:text-destructive/80 underline underline-offset-2 transition-colors"
                >
                  Retry
                </button>
              </div>
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
            onPageChange={handlePageChange}
            onSelect={handleSelectLead}
          />
        </div>

        <div className="space-y-6">
          <QualificationBreakdown
            distribution={summary?.bucket_distribution ?? []}
            loading={summaryLoading}
          />
        </div>
      </div>

      <LeadDrawer
        leadId={drawerLeadId}
        onClose={() => setDrawerLeadId(null)}
        onViewFullProfile={handleViewFullProfile}
      />
    </div>
  );
}
