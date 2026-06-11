import { useState, useCallback, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import type { LeadFilters, LeadType, LeadStatus, ScoreBucket } from "@/features/dashboard/types/dashboard";

interface DashboardFiltersProps {
  filters: LeadFilters;
  onChange: (filters: LeadFilters) => void;
}

const typeOptions: { value: LeadType | ""; label: string }[] = [
  { value: "", label: "All Types" },
  { value: "founder", label: "Founders" },
  { value: "investor", label: "Investors" },
];

const bucketOptions: { value: ScoreBucket | ""; label: string }[] = [
  { value: "", label: "All Scores" },
  { value: "hot", label: "Hot" },
  { value: "good", label: "Good" },
  { value: "maybe", label: "Maybe" },
  { value: "low", label: "Low" },
];

const statusOptions: { value: LeadStatus | ""; label: string }[] = [
  { value: "", label: "All Status" },
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "qualified", label: "Qualified" },
  { value: "contacted", label: "Contacted" },
  { value: "rejected", label: "Rejected" },
  { value: "converted", label: "Converted" },
];

export function DashboardFilters({ filters, onChange }: DashboardFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchInput(filters.search ?? "");
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
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search leads…"
          className="w-full h-9 rounded-md border border-border bg-background pl-8 pr-8 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-shadow"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              update({ search: undefined });
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <select
        value={filters.type ?? ""}
        onChange={(e) =>
          update({ type: (e.target.value || undefined) as LeadType | undefined })
        }
        className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-shadow"
      >
        {typeOptions.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={filters.status ?? ""}
        onChange={(e) =>
          update({
            status: (e.target.value || undefined) as LeadStatus | undefined,
          })
        }
        className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-shadow"
      >
        {statusOptions.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={filters.bucket ?? ""}
        onChange={(e) =>
          update({
            bucket: (e.target.value || undefined) as ScoreBucket | undefined,
          })
        }
        className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-shadow"
      >
        {bucketOptions.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={() =>
            onChange({
              type: undefined,
              status: undefined,
              bucket: undefined,
              search: undefined,
              dateFrom: undefined,
              dateTo: undefined,
              page: 1,
            })
          }
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3 w-3" />
          Clear ({activeFilterCount})
        </button>
      )}
    </div>
  );
}
