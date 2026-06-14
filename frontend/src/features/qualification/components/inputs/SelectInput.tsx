import type { QuestionOption } from "@/features/qualification/types";
import { cn } from "@/shared/lib/utils";

interface SelectInputProps {
  value: string;
  onChange: (value: string) => void;
  options: QuestionOption[];
  placeholder?: string;
  disabled?: boolean;
  "aria-labelledby"?: string;
  onAutoSubmit?: (value: string) => void;
}

export function SelectInput({ value, onChange, options, disabled, onAutoSubmit, ...props }: SelectInputProps) {
  // If there are many options (e.g. industry), use a tighter grid, else 1-col
  const isMany = options.length > 5;
  return (
    <div
      className={cn("grid gap-2", isMany ? "grid-cols-2" : "grid-cols-1")}
      {...(props["aria-labelledby"] ? { "aria-labelledby": props["aria-labelledby"] } : {})}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => {
              onChange(option.value);
              // Auto-advance
              if (onAutoSubmit) {
                // slight delay for UX
                setTimeout(() => onAutoSubmit(option.value), 150);
              }
            }}
            className={cn(
              "flex flex-col items-start justify-center rounded-xl border p-3 text-left transition-all active:scale-[0.98]",
              isSelected
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-white/[0.1] bg-white/[0.03] hover:border-white/[0.2] hover:bg-white/[0.06]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className={cn("text-[13px] font-semibold", isSelected ? "text-emerald-400" : "text-white")}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
