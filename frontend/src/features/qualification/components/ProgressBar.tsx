import type { Stage } from "@/features/qualification/types";
import { cn } from "@/shared/lib/utils";

interface ProgressBarProps {
  stages: Stage[];
  currentStage: Stage;
  currentIndex: number;
  totalQuestions: number;
}

export function ProgressBar({ stages, currentStage, currentIndex, totalQuestions }: ProgressBarProps) {
  const currentStageIndex = stages.indexOf(currentStage);
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background">
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-foreground transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="container max-w-xl mx-auto px-4">
        <div className="flex items-center justify-between pt-3 pb-1">
          <div className="flex items-center gap-2" aria-hidden>
            {stages.map((stage, i) => (
              <div
                key={stage}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors duration-300",
                  i <= currentStageIndex ? "bg-foreground" : "bg-muted-foreground/20"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>
      </div>
    </div>
  );
}
