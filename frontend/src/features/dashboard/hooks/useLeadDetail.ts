import { useState, useEffect, useCallback } from "react";
import type { LeadDetail } from "@/features/dashboard/types/dashboard";
import { api } from "@/features/dashboard/services/api";

interface UseLeadDetailResult {
  lead: LeadDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLeadDetail(id: string | undefined): UseLeadDetailResult {
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<LeadDetail>(`/dashboard/leads/${id}`);
      if (res.error) {
        setError(res.error.message);
      } else {
        setLead(res.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lead");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Poll every 2 seconds if ai_evaluation is null
  useEffect(() => {
    if (!lead || lead.ai_evaluation) return;
    
    const interval = setInterval(() => {
      fetch();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [lead, fetch]);

  return { lead, loading, error, refetch: fetch };
}
