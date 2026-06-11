import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface NavigationButtonsProps {
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastQuestion: boolean;
  isSubmitting: boolean;
}

export function NavigationButtons({
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  isLastQuestion,
  isSubmitting,
}: NavigationButtonsProps) {
  return (
    <div className="flex items-center justify-between pt-6">
      {canGoBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          aria-label="Go back to previous question"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
      ) : (
        <div />
      )}

      <Button
        variant="default"
        onClick={onNext}
        disabled={!canGoNext || isSubmitting}
        className="gap-2 h-11 px-6 text-sm font-medium"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Submitting...</span>
          </span>
        ) : isLastQuestion ? (
          "Submit"
        ) : (
          <>
            Continue
            <ArrowRight className="h-4 w-4" aria-hidden />
          </>
        )}
      </Button>
    </div>
  );
}
