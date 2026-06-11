import { MessageSquare, X } from "lucide-react";
import { useChatbot } from "./ChatbotContext";

export function ChatbotLauncher() {
  const { isOpen, toggle } = useChatbot();

  return (
    <button
      id="chatbot-launcher"
      type="button"
      onClick={toggle}
      aria-label={isOpen ? 'Close qualification chatbot' : 'Open qualification chatbot'}
      aria-expanded={isOpen}
      aria-controls="chatbot-panel"
      className={[
        'fixed bottom-6 right-6 z-50 inline-flex items-center gap-2.5 rounded-full shadow-lg',
        'transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626] focus-visible:ring-offset-2',
        isOpen
          ? 'bg-white text-[#0d1428] border border-border px-4 py-2.5 hover:bg-secondary'
          : 'bg-[#0d1428] text-white px-5 py-3 hover:bg-[#1a2540] hover:shadow-xl hover:shadow-[#0d1428]/25',
      ].join(' ')}
    >
      {isOpen ? (
        <>
          <X className="h-4 w-4" aria-hidden />
          <span className="text-sm font-medium">Close</span>
        </>
      ) : (
        <>
          {/* Pulse ring */}
          <span
            className="absolute inset-0 rounded-full animate-pulse-ring"
            aria-hidden
          />
          <MessageSquare className="h-4 w-4 flex-none" aria-hidden />
          <span className="text-[14px] font-semibold tracking-tight">Start Qualification</span>
        </>
      )}
    </button>
  );
}
