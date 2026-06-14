import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useChatbot } from "./ChatbotContext";
import { ChatbotConversation } from "./ChatbotConversation";

export function ChatbotPanel() {
  const { isOpen, initialPersona, close } = useChatbot();
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus trap + Escape key
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    setTimeout(() => first?.focus(), 60);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Dynamic subtitle based on persona
  const subtitle = initialPersona === 'founder'
    ? 'Founder Qualification'
    : initialPersona === 'investor'
    ? 'Investor Profile'
    : 'Qualification Assistant';

  return (
    <>
      {/* Backdrop — mobile only */}
      <div
        className={[
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        id="chatbot-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Venturizer Qualification Assistant"
        className={[
          // Base
          'fixed z-50 flex flex-col bg-[#0d1428]/95 backdrop-blur-3xl border border-white/10',
          // Mobile: full-screen bottom sheet
          'inset-x-0 bottom-0 rounded-t-2xl max-h-[92dvh]',
          // Desktop: right-side drawer
          'lg:inset-x-auto lg:right-6 lg:bottom-6 lg:top-auto lg:w-[480px] lg:h-[780px] lg:rounded-2xl lg:max-h-[calc(100dvh-96px)]',
          // Shadow
          'shadow-[0_40px_100px_rgba(0,0,0,0.55)]',
          // Transition
          'transition-all duration-350 ease-out',
          isOpen
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-full opacity-0 pointer-events-none lg:translate-y-3',
        ].join(' ')}
      >
        {/* Handle (mobile drag hint) */}
        <div className="flex justify-center pt-3 pb-0 lg:hidden" aria-hidden>
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex-none flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
                <path d="M8 8L14.5 22L16 18.5L11.5 8H8Z" fill="#dc2626"/>
                <path d="M24 8L17.5 22L16 18.5L20.5 8H24Z" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-white leading-none tracking-tight">Venturizer</p>
              <p className="text-[11px] text-white/40 mt-0.5 leading-none">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
              <span className="text-[11px] text-white/35">Online</span>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close chatbot"
              className="rounded-lg p-1.5 text-white/30 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        {/* Conversation area */}
        <ChatbotConversation />
      </div>
    </>
  );
}
