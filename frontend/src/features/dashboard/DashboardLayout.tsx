import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { DashboardSidebar } from "@/shared/components/DashboardSidebar";
import { dashboardNav } from "@/shared/config/navigation";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebar, setMobileSidebar] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      {/* Mobile sidebar overlay */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setMobileSidebar(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-56 bg-background border-r border-border animate-slide-in-left">
            <nav className="p-3 space-y-1 pt-20">
              {dashboardNav.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? location.pathname === "/dashboard"
                    : location.pathname.startsWith(item.href);

                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      navigate(item.href);
                      setMobileSidebar(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-secondary text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
          <button
            className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileSidebar(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
          >
            Exit Dashboard
          </Button>
        </header>

        <div className="flex-1 px-4 sm:px-6 py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
