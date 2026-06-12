import { useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Menu, X, ArrowLeft, Shield } from "lucide-react";
import { DashboardSidebar } from "@/shared/components/DashboardSidebar";
import { dashboardNav } from "@/shared/config/navigation";
import { cn } from "@/shared/lib/utils";

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebar, setMobileSidebar] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      <DashboardSidebar />

      {/* Mobile sidebar overlay */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileSidebar(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[220px] bg-white border-r border-border shadow-2xl animate-slide-in-left flex flex-col">
            {/* Mobile brand */}
            <div className="flex h-[60px] items-center gap-2.5 border-b border-border px-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0d1428]">
                <svg width="13" height="13" viewBox="0 0 32 32" fill="none">
                  <path d="M8 8L14.5 22L16 18.5L11.5 8H8Z" fill="#dc2626"/>
                  <path d="M24 8L17.5 22L16 18.5L20.5 8H24Z" fill="white" fillOpacity="0.9"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-semibold block leading-none">Venturizer</span>
                <span className="text-[9px] text-muted-foreground/50 uppercase tracking-widest">Internal ERP</span>
              </div>
              <button
                className="ml-auto rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
                onClick={() => setMobileSidebar(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {dashboardNav.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? location.pathname === "/dashboard"
                    : location.pathname.startsWith(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => { navigate(item.href); setMobileSidebar(false); }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors',
                      isActive
                        ? 'bg-[#0d1428] text-white'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-border px-3 py-4">
              <Link to="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-3 py-2">
                <ArrowLeft className="h-3 w-3" />
                Exit to public site
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar — operator console style */}
        <header className="sticky top-0 z-30 flex h-[60px] items-center gap-4 border-b border-border bg-white px-4 sm:px-6">
          <button
            className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            onClick={() => setMobileSidebar(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Internal designation */}
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-muted-foreground/40" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40">Internal ERP</span>
          </div>

          <div className="flex-1" />

          {/* Operator badge */}
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-[#f7f8fa] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-medium text-muted-foreground">Operator View</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg px-3 py-1.5 hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Exit to site</span>
          </button>
        </header>

        <div className="flex-1 px-4 sm:px-6 py-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
