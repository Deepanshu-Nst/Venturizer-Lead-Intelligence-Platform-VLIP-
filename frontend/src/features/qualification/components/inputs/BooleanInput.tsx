import { cn } from "@/shared/lib/utils";

interface BooleanInputProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  onAutoSubmit?: (value: boolean) => void;
}

export function BooleanInput({ value, onChange, disabled, onAutoSubmit }: BooleanInputProps) {
  return (
    <div className="flex gap-4" role="radiogroup" aria-label="Yes or No">
      <button
        type="button"
        role="radio"
        aria-checked={value === true}
        disabled={disabled}
        onClick={() => {
          onChange(true);
          if (onAutoSubmit) setTimeout(onAutoSubmit, 150);
        }}
        className={cn(
          "flex-1 rounded-xl border-2 px-6 py-4 text-base font-medium transition-all duration-200",
          value === true
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        Yes
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === false}
        disabled={disabled}
        onClick={() => {
          onChange(false);
          if (onAutoSubmit) setTimeout(onAutoSubmit, 150);
        }}
        className={cn(
          "flex-1 rounded-xl border-2 px-6 py-4 text-base font-medium transition-all duration-200",
          value === false
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        No
      </button>
    </div>
  );
}
