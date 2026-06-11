import type { Question } from "@/features/qualification/types";
import { QuestionRenderer } from "./QuestionRenderer";

interface QuestionCardProps {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string | null;
  disabled?: boolean;
  direction: "next" | "prev" | null;
  documentType?: "pitch-deck" | "investment-thesis";
}

export function QuestionCard({ question, value, onChange, error, disabled, direction, documentType }: QuestionCardProps) {
  const slideClass =
    direction === "next"
      ? "animate-slide-in-right"
      : direction === "prev"
        ? "animate-slide-in-left"
        : "animate-fade-in";

  const questionId = `q-${question.id}`;

  return (
    <div className={`space-y-8 ${slideClass}`}>
      <div className="space-y-3">
        <h2 id={questionId} className="text-2xl font-semibold text-foreground leading-tight tracking-tight">
          {question.question}
        </h2>
        {question.helperText && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {question.helperText}
          </p>
        )}
      </div>

      <QuestionRenderer
        question={question}
        value={value}
        onChange={onChange}
        error={error}
        disabled={disabled}
        documentType={documentType}
        questionId={questionId}
      />
    </div>
  );
}
