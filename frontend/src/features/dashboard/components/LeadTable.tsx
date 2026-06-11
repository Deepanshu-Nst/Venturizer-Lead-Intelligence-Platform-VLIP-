import type { LeadSummary, LeadFilters } from "@/features/dashboard/types/dashboard";
import { formatDate } from "@/shared/lib/utils";
import { TableSkeleton } from "./LoadingSkeleton";
import { EmptyState } from "./EmptyState";
import { Pagination } from "./Pagination";
import { Users, ArrowUpDown } from "lucide-react";

interface LeadTableProps {
  leads: LeadSummary[];
  loading: boolean;
  total: number;
  page: number;
  totalPages: number;
  perPage: number;
  filters: LeadFilters;
  onSort: (field: NonNullable<LeadFilters["sortBy"]>) => void;
  onPageChange: (page: number) => void;
  onSelect: (lead: LeadSummary) => void;
}

const bucketStyles: Record<string, string> = {
  hot: "bg-red-50 text-red-700 border-red-200",
  good: "bg-emerald-50 text-emerald-700 border-emerald-200",
  maybe: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-50 text-slate-500 border-slate-200",
};

const typeStyles: Record<string, string> = {
  founder: "bg-foreground/5 text-foreground border-foreground/10",
  investor: "bg-foreground/5 text-foreground border-foreground/10",
};

export function LeadTable({
  leads,
  loading,
  total,
  page,
  totalPages,
  perPage,
  filters,
  onSort,
  onPageChange,
  onSelect,
}: LeadTableProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border p-5">
        <TableSkeleton />
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-lg border border-border">
        <EmptyState
          icon={Users}
          title="No leads found"
          description={
            total === 0
              ? "Leads will appear here after qualification flows are completed."
              : "Try adjusting your filters to find what you're looking for."
          }
        />
      </div>
    );
  }

  const sortDir = (field: string) =>
    filters.sortBy === field ? (filters.sortOrder === "asc" ? "asc" : "desc") : null;

  return (
    <div className="rounded-lg border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <Th
                label="Name"
                field="full_name"
                sortDir={sortDir("full_name")}
                onSort={onSort}
              />
              <th scope="col" className="text-left font-medium text-muted-foreground pb-3 pr-4 whitespace-nowrap">
                Type
              </th>
              <th scope="col" className="text-left font-medium text-muted-foreground pb-3 pr-4 whitespace-nowrap">
                Status
              </th>
              <Th
                label="Score"
                field="score"
                sortDir={sortDir("score")}
                onSort={onSort}
              />
              <Th
                label="Created"
                field="created_at"
                sortDir={sortDir("created_at")}
                onSort={onSort}
              />
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-border/50 hover:bg-secondary/40 cursor-pointer transition-colors"
                onClick={() => onSelect(lead)}
              >
                <td className="py-3 pr-4">
                  <div>
                    <span className="font-medium text-foreground">
                      {lead.full_name}
                    </span>
                    <span className="block text-xs text-muted-foreground/60 mt-0.5">
                      {lead.email}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${
                      typeStyles[lead.type] ?? ""
                    }`}
                  >
                    {lead.type}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span className="text-xs text-muted-foreground capitalize">
                    {lead.status}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  {lead.score !== null ? (
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium tabular-nums ${
                        bucketStyles[lead.score_bucket ?? ""] ?? ""
                      }`}
                    >
                      {lead.score}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/40">&mdash;</span>
                  )}
                </td>
                <td className="py-3 text-muted-foreground text-xs whitespace-nowrap">
                  {formatDate(lead.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 pb-4">
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          perPage={perPage}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}

function Th({
  label,
  field,
  sortDir,
  onSort,
}: {
  label: string;
  field: NonNullable<LeadFilters["sortBy"]>;
  sortDir: "asc" | "desc" | null;
  onSort: (field: NonNullable<LeadFilters["sortBy"]>) => void;
}) {
  const ariaSort = sortDir === "asc" ? "ascending" : sortDir === "desc" ? "descending" : undefined;
  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className="text-left font-medium text-muted-foreground pb-3 pr-4 cursor-pointer hover:text-foreground transition-colors select-none whitespace-nowrap"
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={`h-3 w-3 transition-colors ${
            sortDir ? "text-foreground" : "text-muted-foreground/30"
          }`}
          aria-hidden
        />
      </span>
    </th>
  );
}
