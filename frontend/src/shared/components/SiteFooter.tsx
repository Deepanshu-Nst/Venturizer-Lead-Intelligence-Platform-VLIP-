import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-10">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-foreground">
              <span className="text-xs font-bold text-background">V</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              Venturizer
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              to="/qualify"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              For Founders
            </Link>
            <Link
              to="/qualify"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              For Investors
            </Link>
            <span className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Venturizer
            </span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
