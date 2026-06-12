import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import { dashboardNav } from "@/shared/config/navigation";

export function DashboardSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex w-[220px] flex-col border-r border-border bg-white flex-none">
      {/* Brand */}
      <div className="flex h-[60px] items-center border-b border-border px-5">
        <Link to="/dashboard" className="flex items-center gap-2.5 group flex-1 min-w-0">
          <div className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-[#0d1428]">
            <svg width="13" height="13" viewBox="0 0 32 32" fill="none">
              <path d="M8 8L14.5 22L16 18.5L11.5 8H8Z" fill="#dc2626"/>
              <path d="M24 8L17.5 22L16 18.5L20.5 8H24Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[13px] font-semibold tracking-tight text-foreground block leading-none">Venturizer</span>
            <span className="text-[9px] text-muted-foreground/40 uppercase tracking-widest block mt-0.5">Internal ERP</span>
          </div>
        </Link>
        <span className="flex-none rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[8px] font-bold text-amber-600 uppercase tracking-wider">
          INT
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {dashboardNav.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? location.pathname === "/dashboard" || location.pathname === "/dashboard/"
              : location.pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                isActive
                  ? 'bg-[#0d1428] text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <item.icon className={cn('h-4 w-4 flex-none', isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground')} />
              {item.label}
              {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/40" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-3 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Exit to public site
        </Link>
      </div>
    </aside>
  );
}
