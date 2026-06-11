import type { LeadSummary, LeadFilters } from "@/features/dashboard/types/dashboard";
import { formatDate } from "@/shared/lib/utils";
import { TableSkeleton } from "./LoadingSkeleton";
import { EmptyState } from "./EmptyState";
import { Pagination } from "./Pagination";
import { Users, ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";

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

const bucketConfig: Record<string, { label: string; className: string; dotColor: string }> = {
  hot: { label: 'Hot', className: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-500' },
  good: { label: 'Good', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500' },
  maybe: { label: 'Maybe', className: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
  low: { label: 'Low', className: 'bg-slate-50 text-slate-500 border-slate-200', dotColor: 'bg-slate-400' },
};

const typeConfig: Record<string, { className: string }> = {
  founder: { className: 'bg-[#0d1428]/5 text-[#0d1428] border-[#0d1428]/10' },
  investor: { className: 'bg-blue-50 text-blue-700 border-blue-200' },
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
      <div className="card-premium overflow-hidden">
        <div className="p-5">
          <TableSkeleton />
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="card-premium">
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
    <div className="card-premium overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <Th label="Name" field="full_name" sortDir={sortDir('full_name')} onSort={onSort} first />
              <Th label="Type" field={null} sortDir={null} onSort={onSort} />
              <Th label="Status" field={null} sortDir={null} onSort={onSort} />
              <Th label="Score" field="score" sortDir={sortDir('score')} onSort={onSort} />
              <Th label="Created" field="created_at" sortDir={sortDir('created_at')} onSort={onSort} />
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, idx) => (
              <tr
                key={lead.id}
                className="border-b border-border/50 hover:bg-[#f7f8fa] cursor-pointer transition-colors group"
                onClick={() => onSelect(lead)}
                style={{ animationDelay: `${idx * 20}ms` }}
              >
                {/* Name + Email */}
                <td className="py-3.5 pl-5 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#0d1428] text-white text-[11px] font-bold">
                      {(lead.full_name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#0d1428] leading-none">{lead.full_name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{lead.email}</p>
                    </div>
                  </div>
                </td>

                {/* Type badge */}
                <td className="py-3.5 pr-4">
                  <span className={`v-badge capitalize ${typeConfig[lead.type]?.className ?? ''}`}>
                    {lead.type}
                  </span>
                </td>

                {/* Status */}
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      lead.status === 'new' ? 'bg-blue-400' :
                      lead.status === 'qualified' ? 'bg-emerald-400' :
                      lead.status === 'rejected' ? 'bg-red-400' :
                      'bg-amber-400'
                    }`} />
                    <span className="text-[12px] text-muted-foreground capitalize">{lead.status}</span>
                  </div>
                </td>

                {/* Score */}
                <td className="py-3.5 pr-4">
                  {lead.score !== null ? (
                    <div className="flex items-center gap-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold border ${
                        bucketConfig[lead.score_bucket ?? '']?.className ?? 'bg-muted text-muted-foreground border-border'
                      }`}>
                        {lead.score}
                      </div>
                      {lead.score_bucket && (
                        <span className={`v-badge hidden sm:inline-flex ${bucketConfig[lead.score_bucket]?.className ?? ''}`}>
                          <span className={`mr-1 h-1 w-1 rounded-full ${bucketConfig[lead.score_bucket]?.dotColor}`} />
                          {bucketConfig[lead.score_bucket]?.label}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[12px] text-muted-foreground/30">&mdash;</span>
                  )}
                </td>

                {/* Date */}
                <td className="py-3.5 pr-5 text-[12px] text-muted-foreground whitespace-nowrap">
                  {formatDate(lead.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-border">
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
  first,
}: {
  label: string;
  field: NonNullable<LeadFilters["sortBy"]> | null;
  sortDir: 'asc' | 'desc' | null;
  onSort: (field: NonNullable<LeadFilters["sortBy"]>) => void;
  first?: boolean;
}) {
  const ariaSort = sortDir === 'asc' ? 'ascending' : sortDir === 'desc' ? 'descending' : undefined;

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={`text-left py-3 pr-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-[#f7f8fa] select-none whitespace-nowrap ${
        first ? 'pl-5' : ''
      } ${field ? 'cursor-pointer hover:text-foreground transition-colors' : ''}`}
      onClick={field ? () => onSort(field) : undefined}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {field && (
          <span className="text-muted-foreground/40">
            {sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-foreground" /> :
             sortDir === 'desc' ? <ArrowDown className="h-3 w-3 text-foreground" /> :
             <ChevronsUpDown className="h-3 w-3" />}
          </span>
        )}
      </span>
    </th>
  );
}
