import { User, Building } from "lucide-react";
import type { FlowType } from "@/features/qualification/types";

interface WelcomeScreenProps {
  onSelectFlow: (flow: FlowType) => void;
  hasSavedSession: boolean;
  onResume: () => void;
}

export function WelcomeScreen({ onSelectFlow, hasSavedSession, onResume }: WelcomeScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg text-center space-y-10">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            I am a...
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose your path to get started
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onSelectFlow("founder")}
            className="group flex flex-col items-center gap-3 sm:gap-4 rounded-2xl border-2 border-border bg-background px-4 sm:px-6 py-6 sm:py-10 text-center transition-all duration-200 hover:border-foreground/40 hover:bg-foreground/[0.02] active:scale-[0.98]"
          >
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-foreground/5" aria-hidden>
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-foreground/70" />
            </div>
            <div className="space-y-1">
              <p className="text-sm sm:text-base font-semibold text-foreground">Founder</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Raising capital for your startup
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectFlow("investor")}
            className="group flex flex-col items-center gap-3 sm:gap-4 rounded-2xl border-2 border-border bg-background px-4 sm:px-6 py-6 sm:py-10 text-center transition-all duration-200 hover:border-foreground/40 hover:bg-foreground/[0.02] active:scale-[0.98]"
          >
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-foreground/5" aria-hidden>
              <Building className="h-5 w-5 sm:h-6 sm:w-6 text-foreground/70" />
            </div>
            <div className="space-y-1">
              <p className="text-sm sm:text-base font-semibold text-foreground">Investor</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Seeking deal flow opportunities
              </p>
            </div>
          </button>
        </div>

        {hasSavedSession && (
          <button
            type="button"
            onClick={onResume}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-muted-foreground/30 hover:decoration-foreground/50"
          >
            Resume saved session &rarr;
          </button>
        )}
      </div>
    </div>
  );
}
