import { MessageCircle, X } from "lucide-react";
import { useChatbot } from "./ChatbotContext";

export function ChatbotLauncher() {
  const { isOpen, toggle } = useChatbot();

  return (
    <button
      id="chatbot-launcher"
      type="button"
      onClick={toggle}
      aria-label={isOpen ? "Close qualification chatbot" : "Open qualification chatbot"}
      aria-expanded={isOpen}
      aria-controls="chatbot-panel"
      className={[
        "fixed bottom-6 right-6 z-50 group flex items-center gap-2.5 rounded-full shadow-2xl",
        "transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
        isOpen
          ? "bg-secondary text-foreground border border-border pl-4 pr-4 py-3"
          : "bg-foreground text-background pl-4 pr-5 py-3 hover:shadow-[0_0_40px_rgba(0,0,0,0.25)]",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-6 w-6 items-center justify-center transition-transform duration-300",
          isOpen ? "rotate-0" : "group-hover:scale-110",
        ].join(" ")}
      >
        {isOpen ? (
          <X className="h-4 w-4" aria-hidden />
        ) : (
          <MessageCircle className="h-4 w-4" aria-hidden />
        )}
      </span>

      {!isOpen && (
        <>
          <span className="text-sm font-semibold tracking-tight whitespace-nowrap">
            Start Qualification
          </span>
          {/* Pulse ring */}
          <span
            className="absolute -inset-0.5 rounded-full animate-pulse-ring pointer-events-none"
            aria-hidden
          />
        </>
      )}

      {isOpen && (
        <span className="text-sm font-medium text-muted-foreground">Close</span>
      )}
    </button>
  );
}
