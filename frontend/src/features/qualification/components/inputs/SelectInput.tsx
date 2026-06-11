import type { QuestionOption } from "@/features/qualification/types";
import { ChevronDown } from "lucide-react";

interface SelectInputProps {
  value: string;
  onChange: (value: string) => void;
  options: QuestionOption[];
  placeholder?: string;
  disabled?: boolean;
  "aria-labelledby"?: string;
}

export function SelectInput({ value, onChange, options, placeholder, disabled, ...props }: SelectInputProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none border-0 border-b-2 border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-all duration-200 focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        {...(props["aria-labelledby"] ? { "aria-labelledby": props["aria-labelledby"] } : {})}
      >
        <option value="" disabled>
          {placeholder || "Select an option..."}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" aria-hidden />
    </div>
  );
}
