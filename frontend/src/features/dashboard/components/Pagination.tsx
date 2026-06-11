import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, perPage, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between py-2">
        <p className="text-[12px] text-muted-foreground">
          {total} lead{total !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const pages = buildPageList(page, totalPages);

  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-[12px] text-muted-foreground">
        {from}–{to} of {total} lead{total !== 1 ? 's' : ''}
      </p>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <PageButton
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </PageButton>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground/40 text-[12px]">
              …
            </span>
          ) : (
            <PageButton
              key={p}
              onClick={() => onPageChange(p as number)}
              active={p === page}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </PageButton>
          )
        )}

        <PageButton
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </PageButton>
      </nav>
    </div>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  active,
  'aria-label': ariaLabel,
  'aria-current': ariaCurrent,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  'aria-label'?: string;
  'aria-current'?: 'page' | undefined;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      className={[
        'inline-flex h-7 min-w-[28px] items-center justify-center rounded-lg text-[12px] font-medium transition-all px-1.5',
        active
          ? 'bg-[#0d1428] text-white'
          : disabled
          ? 'text-muted-foreground/30 cursor-not-allowed'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function buildPageList(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 4) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 3) pages.push('...');
  pages.push(total);
  return pages;
}
