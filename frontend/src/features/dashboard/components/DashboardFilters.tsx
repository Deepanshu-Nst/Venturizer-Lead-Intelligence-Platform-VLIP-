import { useState, useCallback, useRef, useEffect } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import type { LeadFilters, LeadType, LeadStatus, ScoreBucket } from "@/features/dashboard/types/dashboard";

interface DashboardFiltersProps {
  filters: LeadFilters;
  onChange: (filters: LeadFilters) => void;
}

const typeOptions: { value: LeadType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'founder', label: 'Founders' },
  { value: 'investor', label: 'Investors' },
];

const bucketOptions: { value: ScoreBucket | ''; label: string }[] = [
  { value: '', label: 'All Scores' },
  { value: 'hot', label: '🔥 Hot' },
  { value: 'good', label: '✅ Good' },
  { value: 'maybe', label: '📋 Maybe' },
  { value: 'low', label: '⤵️ Low' },
];

const statusOptions: { value: LeadStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'converted', label: 'Converted' },
];

export function DashboardFilters({ filters, onChange }: DashboardFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchInput(filters.search ?? '');
  }, [filters.search]);

  const update = useCallback(
    (patch: Partial<LeadFilters>) => {
      onChange({ ...filters, ...patch, page: 1 });
    },
    [filters, onChange]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      debounceRef.current && clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        update({ search: value || undefined });
      }, 300);
    },
    [update]
  );

  const activeFilterCount = [
    filters.type,
    filters.bucket,
    filters.status,
    filters.search,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search leads…"
          className="w-full h-9 rounded-lg border border-border bg-white pl-9 pr-8 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-[#0d1428]/20 focus:border-[#0d1428]/30 transition-all shadow-sm"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => { setSearchInput(''); update({ search: undefined }); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors p-0.5 rounded"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Type filter */}
      <FilterSelect
        value={filters.type ?? ''}
        onChange={(v) => update({ type: (v || undefined) as LeadType | undefined })}
        options={typeOptions}
      />

      {/* Status filter */}
      <FilterSelect
        value={filters.status ?? ''}
        onChange={(v) => update({ status: (v || undefined) as LeadStatus | undefined })}
        options={statusOptions}
      />

      {/* Score filter */}
      <FilterSelect
        value={filters.bucket ?? ''}
        onChange={(v) => update({ bucket: (v || undefined) as ScoreBucket | undefined })}
        options={bucketOptions}
      />

      {/* Clear */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={() => onChange({
            type: undefined,
            status: undefined,
            bucket: undefined,
            search: undefined,
            dateFrom: undefined,
            dateTo: undefined,
            page: 1,
          })}
          className="inline-flex items-center gap-1.5 h-9 rounded-lg px-3 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-colors"
        >
          <X className="h-3 w-3" />
          Clear ({activeFilterCount})
        </button>
      )}

      <div className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
        <SlidersHorizontal className="h-3 w-3" />
        <span>Filters</span>
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-lg border border-border bg-white px-3 pr-8 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d1428]/20 focus:border-[#0d1428]/30 transition-all shadow-sm appearance-none cursor-pointer"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
    >
      {options.map((opt) => (
        <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>
      ))}
    </select>
  );
}
