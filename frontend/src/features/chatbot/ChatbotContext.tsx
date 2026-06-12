import { createContext, useContext, useState, useCallback } from "react";
import type { FlowType } from "@/features/qualification/types";

interface ChatbotContextValue {
  isOpen: boolean;
  initialPersona: FlowType | null;
  open: () => void;
  openWithPersona: (persona: FlowType) => void;
  close: () => void;
  toggle: () => void;
  clearPersona: () => void;
}

const ChatbotContext = createContext<ChatbotContextValue | null>(null);

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialPersona, setInitialPersona] = useState<FlowType | null>(null);

  const open = useCallback(() => setIsOpen(true), []);

  const openWithPersona = useCallback((persona: FlowType) => {
    setInitialPersona(persona);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Keep persona so it's still set if user reopens without navigating away
  }, []);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const clearPersona = useCallback(() => setInitialPersona(null), []);

  return (
    <ChatbotContext.Provider value={{ isOpen, initialPersona, open, openWithPersona, close, toggle, clearPersona }}>
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot(): ChatbotContextValue {
  const ctx = useContext(ChatbotContext);
  if (!ctx) throw new Error("useChatbot must be used inside ChatbotProvider");
  return ctx;
}
