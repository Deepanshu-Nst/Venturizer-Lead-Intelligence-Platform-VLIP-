import { useState, useEffect, useCallback, useRef } from "react";
import type { LeadFilters, LeadSummary, PaginatedLeads } from "@/features/dashboard/types/dashboard";
import { api } from "@/features/dashboard/services/api";

interface UseLeadsResult {
  leads: PaginatedLeads | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLeads(filters: LeadFilters): UseLeadsResult {
  const [leads, setLeads] = useState<PaginatedLeads | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetch = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.set("type", filters.type);
      if (filters.status) params.set("status", filters.status);
      if (filters.bucket) params.set("bucket", filters.bucket);
      if (filters.search) params.set("search", filters.search);
      if (filters.dateFrom) params.set("date_from", filters.dateFrom);
      if (filters.dateTo) params.set("date_to", filters.dateTo);
      if (filters.sortBy) params.set("sort_by", filters.sortBy);
      if (filters.sortOrder) params.set("sort_order", filters.sortOrder);
      if (filters.page) params.set("page", String(filters.page));
      if (filters.perPage) params.set("per_page", String(filters.perPage));
      const qs = params.toString();

      const res = await api.get<LeadSummary[]>(
        `/dashboard/leads${qs ? `?${qs}` : ""}`
      );
      if (controller.signal.aborted) return;
      if (res.error) {
        setError(res.error.message);
      } else {
        const meta = res.meta as
          | { total: number; page: number; per_page: number; total_pages: number }
          | undefined;
        setLeads({
          data: res.data ?? [],
          total: meta?.total ?? 0,
          page: meta?.page ?? 1,
          perPage: meta?.per_page ?? 20,
          totalPages: meta?.total_pages ?? 0,
        });
      }
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : "Failed to load leads");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [
    filters.type,
    filters.status,
    filters.bucket,
    filters.search,
    filters.dateFrom,
    filters.dateTo,
    filters.sortBy,
    filters.sortOrder,
    filters.page,
    filters.perPage,
  ]);

  useEffect(() => {
    fetch();
    return () => abortRef.current?.abort();
  }, [fetch]);

  return { leads, loading, error, refetch: fetch };
}
