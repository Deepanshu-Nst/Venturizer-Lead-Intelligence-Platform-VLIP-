import { useEffect, useRef } from "react";
import { X, Zap } from "lucide-react";
import { useChatbot } from "./ChatbotContext";
import { ChatbotConversation } from "./ChatbotConversation";

export function ChatbotPanel() {
  const { isOpen, close } = useChatbot();
  const panelRef = useRef<HTMLDivElement>(null);

  // Trap focus inside panel when open
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
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    // Focus the panel on open
    setTimeout(() => first?.focus(), 50);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  // Prevent body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop — only on mobile/small screens */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        id="chatbot-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Venturizer Qualification Chatbot"
        className={[
          // Base layout
          "fixed z-50 flex flex-col bg-[#0c0c0c] border border-white/[0.08]",
          // Mobile: full screen from bottom
          "inset-x-0 bottom-0 rounded-t-2xl max-h-[92dvh]",
          // Desktop: right-side drawer
          "lg:inset-x-auto lg:right-6 lg:bottom-6 lg:top-auto lg:w-[420px] lg:h-[680px] lg:rounded-2xl lg:max-h-[calc(100dvh-5rem)]",
          // Transition
          "transition-all duration-400 ease-out",
          isOpen
            ? "translate-y-0 opacity-100 pointer-events-auto shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
            : "translate-y-full opacity-0 pointer-events-none lg:translate-y-4",
        ].join(" ")}
      >
        {/* Panel header */}
        <div className="flex-none flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
              <Zap className="h-3.5 w-3.5 text-white" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">Venturizer</p>
              <p className="text-[11px] text-white/40 mt-0.5 leading-none">Qualification Assistant</p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
              <span className="text-[11px] text-white/40">Online</span>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close chatbot"
              className="rounded-full p-1.5 text-white/30 hover:text-white hover:bg-white/10 transition-colors"
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
