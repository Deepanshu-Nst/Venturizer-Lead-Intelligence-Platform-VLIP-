import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useChatbot } from "@/features/chatbot/ChatbotContext";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const chatbot = useChatbot();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-15 items-center justify-between" style={{ height: '60px' }}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0d1428] transition-opacity group-hover:opacity-85">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 8L14.5 22L16 18.5L11.5 8H8Z" fill="#dc2626"/>
              <path d="M24 8L17.5 22L16 18.5L20.5 8H24Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            Venturizer
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <a
            href="#about"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            About
          </a>
          <a
            href="#how-it-works"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            How it Works
          </a>
          <Link
            to="/dashboard"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            Admin Dashboard
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={chatbot.open}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0d1428] px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#1a2540] active:scale-[0.98] shadow-sm"
          >
            Start Qualification
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border animate-fade-in bg-white">
          <nav className="container py-3 space-y-1">
            <a
              href="#about"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              About
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              How it Works
            </a>
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Admin Dashboard
            </Link>
            <button
              type="button"
              onClick={() => { setMobileOpen(false); chatbot.open(); }}
              className="w-full mt-2 rounded-lg bg-[#0d1428] px-3 py-2.5 text-sm font-bold text-white text-center shadow-sm"
            >
              Start Qualification
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

// Internal helper — used programmatically in some nav contexts, not rendered in SiteHeader
function _NavLink({ href, current, children, onClick }: { href: string; current: string; children: React.ReactNode; onClick: () => void }) {
  const isActive = current === href || (href !== '/' && current.startsWith(href));
  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
        isActive
          ? 'text-foreground bg-secondary'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
      )}
    >
      {children}
    </Link>
  );
}

// Suppress unused warning
void _NavLink;
