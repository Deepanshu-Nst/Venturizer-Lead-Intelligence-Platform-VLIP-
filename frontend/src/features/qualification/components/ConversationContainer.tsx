import { useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, AlertTriangle, Save } from "lucide-react";
import { useQualificationMachine } from "@/features/qualification/hooks/useQualificationMachine";
import { useKeyDown } from "@/features/qualification/hooks/useKeyDown";
import { validateField } from "@/features/qualification/validation";
import { getFlowStages } from "@/features/qualification/engine/questionRegistry";
import { WelcomeScreen } from "./WelcomeScreen";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";
import { NavigationButtons } from "./NavigationButtons";
import { loadSession, saveSession } from "@/features/qualification/engine/conversationState";
import type { ValidationError } from "@/features/qualification/types";

const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

type Direction = "next" | "prev" | null;

export function ConversationContainer() {
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
    submitError: setSubmitError,
    clearSubmitError,
  } = useQualificationMachine();

  const [fieldError, setFieldError] = useState<ValidationError | null>(null);
  const [direction, setDirection] = useState<Direction>(null);
  const isSubmittingRef = useRef(false);

  const hasSavedSession = useMemo(() => {
    return loadSession() !== null;
  }, []);

  const currentQuestion = state.questions[state.currentIndex] ?? null;
  const currentValue = currentQuestion ? state.answers[currentQuestion.id] : undefined;
  const currentStage = currentQuestion?.stage ?? "personal";
  const stages = state.flowType ? getFlowStages(state.flowType) : [];
  const isLastQuestion = state.currentIndex >= state.questions.length - 1;

  const handleSelectFlow = useCallback(
    (flowType: "founder" | "investor") => {
      setFieldError(null);
      setDirection(null);
      selectFlow(flowType);
    },
    [selectFlow]
  );

  const handleAnswer = useCallback(
    (value: unknown) => {
      if (!currentQuestion) return;
      const error = validateField(currentQuestion, value);
      setFieldError(error);
      answer(currentQuestion.id, value);
    },
    [currentQuestion, answer]
  );

  const handleNext = useCallback(async () => {
    if (!currentQuestion) return;
    if (isSubmittingRef.current) return;

    const error = validateField(currentQuestion, currentValue);
    if (error) {
      setFieldError(error);
      return;
    }
    setFieldError(null);
    setDirection("next");

    if (isLastQuestion) {
      isSubmittingRef.current = true;
      submitStart();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      try {
        const body: Record<string, unknown> = {
          type: state.flowType,
          answers: state.answers,
        };
        if (state.sessionId) {
          body.sessionId = state.sessionId;
        }

        const res = await fetch(`${API_BASE}/lead/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message ?? "Submission failed");
        isSubmittingRef.current = false;
        submitDone(json.data.lead_id);
        navigate("/thank-you", { state: { score: json.data.score, bucket: json.data.bucket } });
      } catch (err) {
        clearTimeout(timeoutId);
        isSubmittingRef.current = false;
        const message = err instanceof Error ? err.message : "Something went wrong";
        setSubmitError(message);
        setDirection(null);
      }
      return;
    }

    goNext();
  }, [currentQuestion, currentValue, state, isLastQuestion, goNext, navigate, submitStart, submitDone, setSubmitError]);

  const handleBack = useCallback(() => {
    setFieldError(null);
    setDirection("prev");
    goBack();
  }, [goBack]);

  const handleResume = useCallback(() => {
    setDirection(null);
    const saved = loadSession();
    if (saved) {
      selectFlow(saved.flowType);
      for (const [qId, val] of Object.entries(saved.answers)) {
        answer(qId, val);
      }
      for (let i = 0; i < saved.currentIndex; i++) {
        goNext();
      }
    }
  }, [selectFlow, answer, goNext]);

  useKeyDown("Enter", handleNext, !state.isSubmitting);

  if (!state.flowType || !currentQuestion) {
    return (
      <WelcomeScreen
        onSelectFlow={handleSelectFlow}
        hasSavedSession={hasSavedSession}
        onResume={handleResume}
      />
    );
  }

  if (state.isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md animate-fade-up">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <svg className="h-8 w-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Thank You</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Your submission has been received. Our team will review your qualification and get back to you within 48 hours.
          </p>
          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center w-full rounded-xl bg-foreground text-background px-6 py-2.5 text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              Back to Home
            </button>
            <button
              type="button"
              onClick={() => { reset(); navigate("/qualify"); }}
              className="inline-flex items-center justify-center w-full rounded-xl border border-border text-foreground px-6 py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state.submitError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 animate-fade-in">
        <div className="text-center space-y-6 max-w-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <AlertTriangle className="h-6 w-6 text-accent" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Submission temporarily failed</h2>
            <p className="text-sm text-muted-foreground">{state.submitError}</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                isSubmittingRef.current = false;
                handleNext();
              }}
              className="inline-flex items-center justify-center rounded-xl bg-foreground text-background px-6 py-2.5 text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              Retry Submission
            </button>
            <button
              type="button"
              onClick={() => {
                saveSession({
                  flowType: state.flowType!,
                  answers: state.answers,
                  currentIndex: state.currentIndex,
                  visited: state.visited,
                  sessionId: state.sessionId,
                  startedAt: state.startedAt,
                });
                navigate("/");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border text-foreground px-6 py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
            >
              <Save className="h-4 w-4" aria-hidden />
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => {
                setDirection(null);
                clearSubmitError();
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Return to form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ProgressBar
        stages={stages}
        currentStage={currentStage}
        currentIndex={state.currentIndex}
        totalQuestions={state.questions.length}
      />

      <button
        type="button"
        onClick={reset}
        className="fixed top-4 right-4 z-50 rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Exit"
      >
        <X className="h-5 w-5" aria-hidden />
      </button>

      <div className="flex-1 flex flex-col justify-center px-4 pt-20 pb-8">
        <div className="w-full max-w-lg mx-auto">
          <QuestionCard
            question={currentQuestion}
            value={currentValue}
            onChange={handleAnswer}
            error={fieldError?.message ?? null}
            disabled={state.isSubmitting}
            direction={direction}
            documentType={state.flowType === "founder" ? "pitch-deck" : "investment-thesis"}
          />
          <NavigationButtons
            onBack={handleBack}
            onNext={handleNext}
            canGoBack={state.currentIndex > 0}
            canGoNext={!fieldError}
            isLastQuestion={isLastQuestion}
            isSubmitting={state.isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
