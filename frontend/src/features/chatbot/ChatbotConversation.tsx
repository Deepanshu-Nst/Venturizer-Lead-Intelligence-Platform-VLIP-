import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQualificationMachine } from "@/features/qualification/hooks/useQualificationMachine";
import { validateField } from "@/features/qualification/validation";
import { loadSession } from "@/features/qualification/engine/conversationState";
import { ChatbotMessage } from "./ChatbotMessage";
import { ChatbotInputArea } from "./ChatbotInputArea";
import type { FlowType } from "@/features/qualification/types";
import type { ValidationError } from "@/features/qualification/types";

type MessageRole = "bot" | "user";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  questionId?: string;
}

const BOT_INTRO = "Hi there 👋 I'm the Venturizer Qualification Assistant. I'll guide you through a quick set of questions to match you with the right opportunities.\n\nAre you a **Founder** or an **Investor**?";

const BOT_FLOW_GREETINGS: Record<FlowType, string> = {
  founder: "Great! Let's qualify your startup. I'll ask you about 18 questions — it takes about 5 minutes. Let's go 🚀",
  investor: "Perfect! I'll ask you about 17 questions to understand your investment thesis. Let's begin 📈",
};

function formatAnswerForDisplay(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    // File IDs — show "PDF uploaded" instead of the UUID
    if (/^[0-9a-f-]{36}$/.test(value)) return "📎 PDF uploaded";
    return value;
  }
  return String(value);
}

export function ChatbotConversation() {
  const navigate = useNavigate();
  const {
    state,
    selectFlow,
    answer,
    goNext,
    goBack,
    reset,
    submitStart,
    submitDone,
    submitError: dispatchSubmitError,
    clearSubmitError,
  } = useQualificationMachine();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [fieldError, setFieldError] = useState<ValidationError | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);

  const addBotMessage = useCallback((content: string, delayMs = 600): Promise<void> => {
    return new Promise((resolve) => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}-${Math.random()}`,
            role: "bot",
            content,
          },
        ]);
        resolve();
      }, delayMs);
    });
  }, []);

  const addUserMessage = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}-${Math.random()}`,
        role: "user",
        content,
      },
    ]);
  }, []);

  // Initialize chat — show intro + handle existing session
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    const savedSession = loadSession();

    if (savedSession && state.flowType && state.questions.length > 0) {
      // Resuming a session — rebuild transcript up to current question
      const introMessages: ChatMessage[] = [
        {
          id: "bot-intro",
          role: "bot",
          content: "Welcome back 👋 I've restored your progress. Let's continue from where you left off.",
        },
      ];
      // Add answered questions as transcript
      for (let i = 0; i < state.currentIndex; i++) {
        const q = state.questions[i];
        if (!q) continue;
        const val = state.answers[q.id];
        const displayVal = formatAnswerForDisplay(val);
        introMessages.push({ id: `bot-q-${q.id}`, role: "bot", content: q.question });
        if (displayVal) {
          introMessages.push({ id: `user-a-${q.id}`, role: "user", content: displayVal });
        }
      }
      setMessages(introMessages);
      // Then show current question
      const currentQ = state.questions[state.currentIndex];
      if (currentQ) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            { id: `bot-current`, role: "bot", content: currentQ.question },
          ]);
        }, 800);
      }
    } else {
      // Fresh start
      addBotMessage(BOT_INTRO, 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When flow is selected (not from resume)
  const prevFlowType = useRef<FlowType | null>(null);
  useEffect(() => {
    if (!state.flowType || state.flowType === prevFlowType.current) return;
    if (initialized && prevFlowType.current === null && !loadSession()) {
      // Flow was freshly selected
      const greeting = BOT_FLOW_GREETINGS[state.flowType];
      addBotMessage(greeting, 400).then(() => {
        const firstQ = state.questions[0];
        if (firstQ) {
          addBotMessage(firstQ.question, 800);
        }
      });
    }
    prevFlowType.current = state.flowType;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.flowType]);

  // Auto-scroll to bottom when messages or typing changes
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages, isTyping]);

  const handleSelectFlow = useCallback(
    (flowType: FlowType) => {
      const label = flowType === "founder" ? "Founder" : "Investor";
      addUserMessage(label);
      setFieldError(null);
      selectFlow(flowType);
    },
    [addUserMessage, selectFlow]
  );

  const handleAnswer = useCallback(
    (value: unknown) => {
      if (!state.questions[state.currentIndex]) return;
      const currentQuestion = state.questions[state.currentIndex]!;
      const error = validateField(currentQuestion, value);
      setFieldError(error);
      answer(currentQuestion.id, value);
    },
    [state.questions, state.currentIndex, answer]
  );

  const handleSubmit = useCallback(async () => {
    const currentQuestion = state.questions[state.currentIndex];
    if (!currentQuestion) return;
    if (isSubmittingRef.current) return;

    const currentValue = state.answers[currentQuestion.id];
    const error = validateField(currentQuestion, currentValue);
    if (error) {
      setFieldError(error);
      return;
    }
    setFieldError(null);

    const isLastQuestion = state.currentIndex >= state.questions.length - 1;

    // Show user answer as bubble
    const displayVal = formatAnswerForDisplay(currentValue);
    if (displayVal) {
      addUserMessage(displayVal);
    }

    if (isLastQuestion) {
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      submitStart();

      await addBotMessage("Perfect! Submitting your qualification now... ⏳", 400);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const body: Record<string, unknown> = {
          type: state.flowType,
          answers: state.answers,
        };
        if (state.sessionId) {
          body.sessionId = state.sessionId;
        }

        const res = await fetch("/api/v1/lead/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message ?? "Submission failed");

        isSubmittingRef.current = false;
        setIsSubmitting(false);
        submitDone(json.data.lead_id);

        const score = json.data.score as number;
        const bucket = json.data.bucket as string;
        const bucketLabel =
          bucket === "hot" ? "🔥 Hot Lead" :
          bucket === "good" ? "✅ Good Fit" :
          bucket === "maybe" ? "📋 Worth Reviewing" : "📌 Low Priority";

        await addBotMessage(
          `✅ **Qualification complete!**\n\nYour qualification score is **${score}/100** — ${bucketLabel}.\n\nOur team will review your submission and get back to you within 48 hours. Thank you for connecting with Venturizer.`,
          600
        );
      } catch (err) {
        clearTimeout(timeoutId);
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        const message = err instanceof Error ? err.message : "Something went wrong";
        dispatchSubmitError(message);
        clearSubmitError();
        await addBotMessage(
          `❌ Submission failed: ${message}\n\nYour answers have been saved. Click the button below to retry.`,
          400
        );
      }
      return;
    }

    // Not last question — advance
    goNext();

    // Show next question as bot message
    const nextIndex = state.currentIndex + 1;
    const nextQuestion = state.questions[nextIndex];
    if (nextQuestion) {
      await addBotMessage(nextQuestion.question, 700);
    }
  }, [
    state,
    addUserMessage,
    addBotMessage,
    submitStart,
    submitDone,
    dispatchSubmitError,
    clearSubmitError,
    goNext,
  ]);

  const handleBack = useCallback(() => {
    if (state.currentIndex === 0) return;
    setFieldError(null);
    goBack();

    // Remove last user message from transcript
    setMessages((prev) => {
      const lastUserIdx = [...prev].reverse().findIndex((m) => m.role === "user");
      if (lastUserIdx === -1) return prev;
      const idxToRemove = prev.length - 1 - lastUserIdx;
      return prev.filter((_, i) => i !== idxToRemove);
    });

    // Remove last bot question and re-show previous
    setMessages((prev) => {
      const lastBotIdx = [...prev].reverse().findIndex((m) => m.role === "bot");
      if (lastBotIdx === -1) return prev;
      const idxToRemove = prev.length - 1 - lastBotIdx;
      return prev.filter((_, i) => i !== idxToRemove);
    });

    // Show prev question as new bot message
    const prevQuestion = state.questions[state.currentIndex - 1];
    if (prevQuestion) {
      addBotMessage(prevQuestion.question, 300);
    }
  }, [state, goBack, addBotMessage]);

  const handleReset = useCallback(() => {
    reset();
    prevFlowType.current = null;
    setMessages([]);
    setFieldError(null);
    setIsSubmitting(false);
    isSubmittingRef.current = false;
    addBotMessage(BOT_INTRO, 400);
  }, [reset, addBotMessage]);

  const currentQuestion = state.questions[state.currentIndex] ?? null;
  const currentValue = currentQuestion ? state.answers[currentQuestion.id] : undefined;
  const isComplete = state.isComplete;
  const isLastQuestion = state.currentIndex >= state.questions.length - 1 && state.questions.length > 0;

  // Show flow selection if no flow yet
  const showFlowSelector = !state.flowType && !isComplete;
  // Show input area if flow selected and not complete
  const showInputArea = !!state.flowType && !!currentQuestion && !isComplete;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Scrollable transcript */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}
      >
        {messages.map((msg) => (
          <ChatbotMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2.5" aria-live="polite" aria-label="Venturizer is typing">
            <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white/10">
              <span className="text-[10px] font-bold text-white/70">V</span>
            </div>
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white/[0.06] px-4 py-3">
              <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-typing-dot" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-typing-dot" style={{ animationDelay: "160ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-typing-dot" style={{ animationDelay: "320ms" }} />
            </div>
          </div>
        )}

        {/* Completion state */}
        {isComplete && !isTyping && (
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs font-medium text-white/60 hover:text-white hover:border-white/20 transition-colors"
            >
              Start New Qualification
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex-1 rounded-xl bg-white/10 py-2.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
            >
              View Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Flow selector — shown before flow is chosen */}
      {showFlowSelector && !isTyping && (
        <div className="flex-none px-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              id="chatbot-select-founder"
              type="button"
              onClick={() => handleSelectFlow("founder")}
              className="group flex flex-col items-start gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 text-left transition-all hover:border-white/20 hover:bg-white/[0.07] active:scale-[0.98]"
            >
              <span className="text-base">🚀</span>
              <span className="text-sm font-semibold text-white">Founder</span>
              <span className="text-[11px] text-white/40 leading-relaxed">Raising capital for your startup</span>
            </button>
            <button
              id="chatbot-select-investor"
              type="button"
              onClick={() => handleSelectFlow("investor")}
              className="group flex flex-col items-start gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 text-left transition-all hover:border-white/20 hover:bg-white/[0.07] active:scale-[0.98]"
            >
              <span className="text-base">📈</span>
              <span className="text-sm font-semibold text-white">Investor</span>
              <span className="text-[11px] text-white/40 leading-relaxed">Seeking deal flow opportunities</span>
            </button>
          </div>

          {/* Resume session button */}
          {loadSession() && (
            <button
              type="button"
              onClick={() => {
                // Session is already loaded from the hook — just re-init transcript
                setInitialized(false);
              }}
              className="mt-2 w-full text-center text-[11px] text-white/30 hover:text-white/60 transition-colors py-1"
            >
              ↩ Resume saved session
            </button>
          )}
        </div>
      )}

      {/* Input area — shown for each question */}
      {showInputArea && !isTyping && (
        <ChatbotInputArea
          question={currentQuestion!}
          value={currentValue}
          onChange={handleAnswer}
          onSubmit={handleSubmit}
          onBack={handleBack}
          error={fieldError?.message ?? null}
          disabled={isSubmitting}
          isLastQuestion={isLastQuestion}
          canGoBack={state.currentIndex > 0}
          documentType={state.flowType === "founder" ? "pitch-deck" : "investment-thesis"}
        />
      )}
    </div>
  );
}
