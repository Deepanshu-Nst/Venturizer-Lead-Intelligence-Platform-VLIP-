import type { QuestionOption } from "@/features/qualification/types";
import { cn } from "@/shared/lib/utils";

interface MultiSelectInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: QuestionOption[];
  disabled?: boolean;
}

export function MultiSelectInput({ value, onChange, options, disabled }: MultiSelectInputProps) {
  function toggle(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Select options">
      {options.map((option) => {
        const selected = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => toggle(option.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-all duration-200",
              selected
                ? "border-foreground bg-foreground text-background font-medium"
                : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
