import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-10">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0d1428]">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 8L14.5 22L16 18.5L11.5 8H8Z" fill="#dc2626"/>
                <path d="M24 8L17.5 22L16 18.5L20.5 8H24Z" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-foreground">Venturizer</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/qualify" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              For Founders
            </Link>
            <Link to="/qualify" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              For Investors
            </Link>
            <Link to="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <span className="text-xs text-muted-foreground/50">
              © {new Date().getFullYear()} Venturizer. All rights reserved.
            </span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
