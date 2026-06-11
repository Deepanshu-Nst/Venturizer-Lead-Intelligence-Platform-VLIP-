import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import { dashboardNav } from "@/shared/config/navigation";

export function DashboardSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex w-56 flex-col border-r border-border bg-background">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-foreground">
            <span className="text-xs font-bold text-background">V</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Venturizer
          </span>
          <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            ERP
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {dashboardNav.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? location.pathname === "/dashboard"
              : location.pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to site
        </Link>
      </div>
    </aside>
  );
}
