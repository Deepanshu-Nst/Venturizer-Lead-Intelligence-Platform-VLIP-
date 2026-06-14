import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQualificationMachine } from "@/features/qualification/hooks/useQualificationMachine";
import { validateField } from "@/features/qualification/validation";
import { loadSession } from "@/features/qualification/engine/conversationState";
import { ChatbotMessage } from "./ChatbotMessage";
import { ChatbotInputArea } from "./ChatbotInputArea";
import { useChatbot } from "./ChatbotContext";
import { CheckCircle2, Home, RotateCcw, Briefcase, Landmark } from "lucide-react";
import type { FlowType } from "@/features/qualification/types";
import type { ValidationError } from "@/features/qualification/types";

type MessageRole = 'bot' | 'user';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
}

// ── Score band system ─────────────────────────────────────────────────────────
interface BandConfig {
  emoji: string;
  label: string;            // shown to applicant
  internalLabel: string;    // shown internally
  applicantMessage: string; // outcome message shown after submission
  nextStep: string;         // expected next step copy
  operatorAction: string;   // for internal dashboard
}

function getBandConfig(score: number, flowType: FlowType | null): BandConfig {
  if (score >= 85) {
    return {
      emoji: '🔥',
      label: 'Strong Fit',
      internalLabel: 'Hot Lead',
      applicantMessage:
        flowType === 'founder'
          ? 'Your startup appears aligned with the types of opportunities currently being reviewed by Venturizer.'
          : 'Your investor profile strongly aligns with the deal flow we are currently sourcing.',
      nextStep: 'A Venturizer team member may reach out for further discussion within the next few business days.',
      operatorAction: 'Schedule intro call within 24 hours',
    };
  }
  if (score >= 70) {
    return {
      emoji: '✅',
      label: 'Qualified',
      internalLabel: 'Good Lead',
      applicantMessage:
        flowType === 'founder'
          ? 'Your startup profile meets several of our qualification criteria.'
          : 'Your investment profile meets several of our matching criteria.',
      nextStep: 'Your application has entered our review queue.',
      operatorAction: 'Follow up with intake email',
    };
  }
  if (score >= 40) {
    return {
      emoji: '📋',
      label: 'Under Review',
      internalLabel: 'Maybe',
      applicantMessage: 'Your application requires additional review before a determination can be made.',
      nextStep: 'We may reach out to request more information before proceeding.',
      operatorAction: 'Add to review queue',
    };
  }
  return {
    emoji: '📌',
    label: 'Not a Current Fit',
    internalLabel: 'Low Priority',
    applicantMessage: 'Your submission does not currently meet our review thresholds.',
    nextStep: 'You are welcome to reapply as your circumstances evolve.',
    operatorAction: 'Mark as not a fit',
  };
}

// ── Constants ─────────────────────────────────────────────────────────────────
const BOT_INTRO = "Hi there 👋 I'm the Venturizer Qualification Assistant. I'll guide you through a quick set of questions to match you with the right opportunities.\n\nAre you a **Founder** or an **Investor**?";

const BOT_FLOW_GREETINGS: Record<FlowType, string> = {
  founder: "Great! Let's qualify your startup — I'll ask ~18 focused questions. Takes about 5 minutes. Let's begin 🚀",
  investor: "Perfect! I'll walk you through ~17 questions to understand your investment focus. Let's begin 📈",
};

const BOT_PERSONA_INTRO: Record<FlowType, string> = {
  founder: "Welcome 👋 I'm the Venturizer Qualification Assistant. I'll ask you a few questions about your startup to assess fit. Let's start 🚀",
  investor: "Welcome 👋 I'm the Venturizer Qualification Assistant. I'll ask about your investment focus to find the right deal flow for you. Let's begin 📈",
};

function formatAnswerForDisplay(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    if (/^[0-9a-f-]{36}$/.test(value)) return '📎 PDF uploaded';
    return value;
  }
  return String(value);
}

// ── CompletionOutcomeCard ─────────────────────────────────────────────────────
function CompletionOutcomeCard({
  score,
  flowType,
  onReset,
}: {
  score: number;
  flowType: FlowType | null;
  onReset: () => void;
}) {
  const navigate = useNavigate();
  const band = getBandConfig(score, flowType);

  return (
    <div className="pt-4 px-1">
      {/* Outcome card */}
      <div className="rounded-2xl border border-white/[0.1] bg-white/[0.05] overflow-hidden">
        {/* Band header */}
        <div className="px-5 pt-5 pb-4 border-b border-white/[0.07]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Qualification Complete</span>
            </div>
            <div className="text-right">
              <span className="text-[28px] font-bold text-white leading-none">{score}</span>
              <span className="text-[14px] text-white/30 font-medium">/100</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{band.emoji}</span>
            <span className="text-[16px] font-bold text-white">{band.label}</span>
          </div>
        </div>

        {/* Outcome message */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-[13px] text-white/70 leading-relaxed">
            {band.applicantMessage}
          </p>
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">Expected Next Step</p>
            <p className="text-[12px] text-white/60 leading-relaxed">{band.nextStep}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 space-y-2">
        <button
          type="button"
          onClick={() => { window.location.href = '/'; }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-[13px] font-semibold text-[#0d1428] hover:bg-white/90 transition-colors"
        >
          <Home className="h-3.5 w-3.5" aria-hidden />
          Return to Home
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] py-2.5 text-[13px] font-medium text-white/50 hover:text-white hover:border-white/20 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Start Another Qualification
        </button>
      </div>
    </div>
  );
}

// ── Main conversation component ───────────────────────────────────────────────
export function ChatbotConversation() {
  const { isOpen, initialPersona, clearPersona } = useChatbot();
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
  const [completionScore, setCompletionScore] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);

  const addBotMessage = useCallback((content: string, delayMs = 650): Promise<void> => {
    return new Promise((resolve) => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: `bot-${Date.now()}-${Math.random()}`, role: 'bot', content },
        ]);
        resolve();
      }, delayMs);
    });
  }, []);

  const addUserMessage = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}-${Math.random()}`, role: 'user', content },
    ]);
  }, []);


  const hasGreetedRef = useRef(false);

  // Initialize or handle persona when chatbot opens
  useEffect(() => {
    if (!isOpen) return; // Only run logic when panel is actually open
    
    const savedSession = loadSession();
    const hasProgress = savedSession && savedSession.flowType && Object.keys(savedSession.answers).length > 0;

    // Handle session restore
    if (!initialized && hasProgress && state.flowType && state.questions.length > 0) {
      setInitialized(true);
      hasGreetedRef.current = true;
      const introMessages: ChatMessage[] = [
        { id: 'bot-intro', role: 'bot', content: "Welcome back 👋 I've restored your progress. Let's continue from where you left off." },
      ];
      for (let i = 0; i < state.currentIndex; i++) {
        const q = state.questions[i];
        if (!q) continue;
        const val = state.answers[q.id];
        const displayVal = formatAnswerForDisplay(val);
        introMessages.push({ id: `bot-q-${q.id}`, role: 'bot', content: q.question });
        if (displayVal) introMessages.push({ id: `user-a-${q.id}`, role: 'user', content: displayVal });
      }
      setMessages(introMessages);
      const currentQ = state.questions[state.currentIndex];
      if (currentQ) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [...prev, { id: 'bot-current', role: 'bot', content: currentQ.question }]);
        }, 900);
      }
      return;
    }

    if (!initialized && savedSession && !hasProgress) {
      reset();
    }

    // Handle initial persona injection (e.g. from Nav / Homepage CTA)
    if (initialPersona && !hasGreetedRef.current) {
      setInitialized(true);
      hasGreetedRef.current = true;
      const greeting = BOT_PERSONA_INTRO[initialPersona];
      addBotMessage(greeting, 400).then(() => {
        selectFlow(initialPersona);
        clearPersona();
      });
      return;
    }

    // Default intro if no persona and not yet initialized
    if (!initialized && !initialPersona) {
      setInitialized(true);
      addBotMessage(BOT_INTRO, 500);
    }
  }, [isOpen, initialPersona, initialized, state.flowType, state.questions, state.currentIndex, state.answers, reset, selectFlow, clearPersona, addBotMessage]);

  const prevFlowType = useRef<FlowType | null>(null);
  useEffect(() => {
    if (!state.flowType || state.flowType === prevFlowType.current) return;
    
    if (initialized && prevFlowType.current === null) {
      if (hasGreetedRef.current) {
        // We already greeted via initialPersona. Just ask the first question.
        const firstQ = state.questions[0];
        if (firstQ) addBotMessage(firstQ.question, 600);
      } else {
        // Normal selection flow (user clicked Founder/Investor in chat)
        const greeting = BOT_FLOW_GREETINGS[state.flowType];
        addBotMessage(greeting, 400).then(() => {
          const firstQ = state.questions[0];
          if (firstQ) addBotMessage(firstQ.question, 900);
        });
      }
    }
    prevFlowType.current = state.flowType;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.flowType]);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [messages, isTyping]);

  const handleSelectFlow = useCallback((flowType: FlowType) => {
    addUserMessage(flowType === 'founder' ? 'Founder' : 'Investor');
    setFieldError(null);
    selectFlow(flowType);
  }, [addUserMessage, selectFlow]);

  const handleAnswer = useCallback((value: unknown) => {
    if (!state.questions[state.currentIndex]) return;
    const currentQuestion = state.questions[state.currentIndex]!;
    // Clear field error on any change so the user sees their input is acknowledged
    setFieldError(null);
    answer(currentQuestion.id, value);
  }, [state.questions, state.currentIndex, answer]);

  const handleSubmit = useCallback(async (overrideValue?: unknown) => {
    const currentQuestion = state.questions[state.currentIndex];
    if (!currentQuestion || isSubmittingRef.current) return;

    // Use overrideValue (passed from the button/input) if provided,
    // otherwise fall back to saved state. This fixes the "double click" bug
    // where React state hasn't flushed yet from handleAnswer.
    const currentValue = overrideValue !== undefined ? overrideValue : state.answers[currentQuestion.id];

    // Store the answer into state immediately so submission has the latest data
    if (overrideValue !== undefined) {
      answer(currentQuestion.id, overrideValue);
    }

    const error = validateField(currentQuestion, currentValue);
    if (error) { setFieldError(error); return; }
    
    // Check email uniqueness if the current question is email
    if (currentQuestion.type === 'email' && typeof currentValue === 'string') {
      setIsSubmitting(true);
      try {
        const checkRes = await fetch(`/api/v1/lead/check-email?email=${encodeURIComponent(currentValue)}`);
        const checkJson = await checkRes.json();
        if (checkJson.data?.exists) {
          setFieldError({ field: currentQuestion.id, message: "Lead Already Exists. Please use a different email." });
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        console.error("Email check failed", err);
      }
      setIsSubmitting(false);
    }
    
    setFieldError(null);

    const displayVal = formatAnswerForDisplay(currentValue);
    if (displayVal) addUserMessage(displayVal);

    const isLastQuestion = state.currentIndex >= state.questions.length - 1;

    if (isLastQuestion) {
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      submitStart();
      await addBotMessage('Submitting your qualification now… ⏳', 400);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        // Build final answers: merge current state with the overrideValue
        const finalAnswers = { ...state.answers };
        if (overrideValue !== undefined) {
          finalAnswers[currentQuestion.id] = overrideValue;
        }
        const body: Record<string, unknown> = { type: state.flowType, answers: finalAnswers };
        if (state.sessionId) body.sessionId = state.sessionId;

        const res = await fetch('/api/v1/lead/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        let json;
        try {
          json = await res.json();
        } catch (e) {
          throw new Error(res.ok ? 'Failed to parse response' : `Server connection error (${res.status}). Please check if the backend is running.`);
        }
        if (!res.ok) throw new Error(json?.error?.message ?? 'Submission failed');

        isSubmittingRef.current = false;
        setIsSubmitting(false);
        submitDone(json.data.lead_id);

        const score = json.data.score as number;
        setCompletionScore(score);
        await addBotMessage('Your qualification has been submitted. Here is your result:', 600);
      } catch (err) {
        clearTimeout(timeoutId);
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        const message = err instanceof Error ? err.message : 'Something went wrong';
        dispatchSubmitError(message);
        clearSubmitError();
        await addBotMessage(
          `❌ Submission failed: ${message}\n\nYour answers have been saved. You can retry below.`,
          400
        );
      }
      return;
    }

    goNext();
    const nextQuestion = state.questions[state.currentIndex + 1];
    if (nextQuestion) await addBotMessage(nextQuestion.question, 750);
  }, [state, answer, addUserMessage, addBotMessage, submitStart, submitDone, dispatchSubmitError, clearSubmitError, goNext]);

  const handleBack = useCallback(() => {
    if (state.currentIndex === 0) return;
    setFieldError(null);
    goBack();
    setMessages((prev) => {
      const lastUserIdx = [...prev].reverse().findIndex((m) => m.role === 'user');
      if (lastUserIdx === -1) return prev;
      return prev.filter((_, i) => i !== prev.length - 1 - lastUserIdx);
    });
    setMessages((prev) => {
      const lastBotIdx = [...prev].reverse().findIndex((m) => m.role === 'bot');
      if (lastBotIdx === -1) return prev;
      return prev.filter((_, i) => i !== prev.length - 1 - lastBotIdx);
    });
    const prevQuestion = state.questions[state.currentIndex - 1];
    if (prevQuestion) addBotMessage(prevQuestion.question, 300);
  }, [state, goBack, addBotMessage]);

  const handleReset = useCallback(() => {
    reset();
    prevFlowType.current = null;
    setMessages([]);
    setFieldError(null);
    setIsSubmitting(false);
    setCompletionScore(null);
    isSubmittingRef.current = false;
    addBotMessage(BOT_INTRO, 400);
  }, [reset, addBotMessage]);

  const currentQuestion = state.questions[state.currentIndex] ?? null;
  const currentValue = currentQuestion ? state.answers[currentQuestion.id] : undefined;
  const isComplete = state.isComplete;
  const isLastQuestion = state.currentIndex >= state.questions.length - 1 && state.questions.length > 0;
  const showFlowSelector = !state.flowType && !isComplete;
  const showInputArea = !!state.flowType && !!currentQuestion && !isComplete;

  // Progress
  const totalQ = state.questions.length;
  const currentQ = state.currentIndex + 1;
  const progressPct = totalQ > 0 ? Math.round((currentQ / totalQ) * 100) : 0;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Progress bar — only when a flow is active and not complete */}
      {state.flowType && !isComplete && totalQ > 0 && (
        <div className="flex-none px-5 py-2 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25">
              {state.flowType === 'founder' ? 'Founder Qualification' : 'Investor Profile'}
            </span>
            <span className="text-[10px] text-white/25 tabular-nums">
              {currentQ} / {totalQ}
            </span>
          </div>
          <div className="h-0.5 w-full rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-white/30 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Scrollable transcript */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-3"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.07) transparent' }}
      >
        {messages.map((msg) => (
          <ChatbotMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2.5" aria-live="polite" aria-label="Venturizer is typing">
            <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white/10">
              <svg width="9" height="9" viewBox="0 0 32 32" fill="none">
                <path d="M8 8L14.5 22L16 18.5L11.5 8H8Z" fill="#dc2626"/>
                <path d="M24 8L17.5 22L16 18.5L20.5 8H24Z" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-white/[0.08] border border-white/[0.06] px-4 py-3">
              <span className="h-1.5 w-1.5 rounded-full bg-white/50 animate-typing-dot" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-white/50 animate-typing-dot" style={{ animationDelay: '180ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-white/50 animate-typing-dot" style={{ animationDelay: '360ms' }} />
            </div>
          </div>
        )}

        {/* Completion outcome card — replaces old "View Dashboard" buttons */}
        {isComplete && !isTyping && completionScore !== null && (
          <CompletionOutcomeCard
            score={completionScore}
            flowType={state.flowType}
            onReset={handleReset}
          />
        )}

        {/* Fallback if score not returned */}
        {isComplete && !isTyping && completionScore === null && (
          <div className="pt-3 space-y-2">
            <button
              type="button"
              onClick={() => window.location.href = '/'}
              className="w-full rounded-xl bg-white py-2.5 text-[13px] font-semibold text-[#0d1428] hover:bg-white/90 transition-colors"
            >
              Return to Home
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="w-full rounded-xl border border-white/10 py-2.5 text-[13px] font-medium text-white/60 hover:text-white hover:border-white/20 transition-colors"
            >
              Start New Qualification
            </button>
          </div>
        )}
      </div>

      {/* Flow selector — redesigned as distinct persona cards */}
      {showFlowSelector && !isTyping && (
        <div className="flex-none px-4 pb-5">
          <p className="text-[11px] text-white/30 text-center mb-3 uppercase tracking-widest">Choose your path to begin</p>
          <div className="grid grid-cols-2 gap-2.5">
            <PersonaCard
              id="chatbot-select-founder"
              icon={<Briefcase className="h-5 w-5 text-emerald-400" />}
              label="Founder"
              subtitle="Raising capital"
              onClick={() => handleSelectFlow('founder')}
            />
            <PersonaCard
              id="chatbot-select-investor"
              icon={<Landmark className="h-5 w-5 text-blue-400" />}
              label="Investor"
              subtitle="Looking for deals"
              onClick={() => handleSelectFlow('investor')}
            />
          </div>
          {loadSession() && (
            <button
              type="button"
              onClick={() => setInitialized(false)}
              className="mt-3 w-full text-center text-[11px] text-white/25 hover:text-white/60 transition-colors py-1"
            >
              ↩ Resume saved session
            </button>
          )}
        </div>
      )}

      {/* Input area */}
      {showInputArea && !isTyping && (
        <ChatbotInputArea
          question={currentQuestion!}
          value={currentValue}
          onChange={handleAnswer}
          onSubmit={(val) => handleSubmit(val)}
          onBack={handleBack}
          error={fieldError?.message ?? null}
          disabled={isSubmitting}
          isLastQuestion={isLastQuestion}
          canGoBack={state.currentIndex > 0}
          documentType={state.flowType === 'founder' ? 'pitch-deck' : 'investment-thesis'}
        />
      )}
    </div>
  );
}

// ── PersonaCard — distinct, larger, clearer than old FlowCard ────────────────
function PersonaCard({
  id, icon, label, subtitle, onClick
}: {
  id: string;
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className="group flex flex-col items-start gap-2 rounded-xl border border-white/[0.1] bg-white/[0.05] p-4 text-left transition-all hover:border-white/[0.22] hover:bg-white/[0.09] active:scale-[0.97]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.05] mb-1">
        {icon}
      </div>
      <div>
        <span className="text-[14px] font-bold text-white block">{label}</span>
        <span className="text-[11px] text-white/50 block mt-0.5">{subtitle}</span>
      </div>
    </button>
  );
}
