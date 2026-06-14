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
              "rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-200 active:scale-[0.98]",
              selected
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-white/[0.15] bg-white/[0.04] text-white/70 hover:border-white/[0.3] hover:bg-white/[0.08] hover:text-white",
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
