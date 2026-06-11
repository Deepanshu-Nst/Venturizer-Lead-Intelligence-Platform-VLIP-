import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useQualificationMachine } from "@/features/qualification/hooks/useQualificationMachine";
import { useKeyDown } from "@/features/qualification/hooks/useKeyDown";
import { validateField } from "@/features/qualification/validation";
import { getFlowStages } from "@/features/qualification/engine/questionRegistry";
import { WelcomeScreen } from "./WelcomeScreen";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";
import { NavigationButtons } from "./NavigationButtons";
import { loadSession } from "@/features/qualification/engine/conversationState";
import type { ValidationError } from "@/features/qualification/types";

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
  } = useQualificationMachine();

  const [fieldError, setFieldError] = useState<ValidationError | null>(null);
  const [direction, setDirection] = useState<Direction>(null);

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
    const error = validateField(currentQuestion, currentValue);
    if (error) {
      setFieldError(error);
      return;
    }
    setFieldError(null);
    setDirection("next");

    if (isLastQuestion) {
      submitStart();
      try {
        const res = await fetch("/api/v1/leads/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: state.sessionId,
            type: state.flowType,
            answers: { ...state.answers, [currentQuestion.id]: currentValue },
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message ?? "Submission failed");
        submitDone(json.data.lead_id);
        navigate("/thank-you", { state: { score: json.data.score, bucket: json.data.bucket } });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setSubmitError(message);
        setDirection(null);
      }
      return;
    }

    try {
      await fetch("/api/v1/leads/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.sessionId,
          questionId: currentQuestion.id,
          value: currentValue,
        }),
      }).catch(() => {});
    } catch {}

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

  if (!state.flowType || !currentQuestion) {
    return (
      <WelcomeScreen
        onSelectFlow={handleSelectFlow}
        hasSavedSession={hasSavedSession}
        onResume={handleResume}
      />
    );
  }

  if (state.submitError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 animate-fade-in">
        <div className="text-center space-y-6 max-w-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <X className="h-6 w-6 text-accent" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Submission failed</h2>
            <p className="text-sm text-muted-foreground">{state.submitError}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={reset}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Start over
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center justify-center rounded-xl bg-foreground text-background px-6 py-2.5 text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  useKeyDown("Enter", handleNext, !state.isSubmitting);

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
