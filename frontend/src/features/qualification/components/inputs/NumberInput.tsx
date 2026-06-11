interface NumberInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  "aria-labelledby"?: string;
}

export function NumberInput({ value, onChange, placeholder, min, max, disabled, ...props }: NumberInputProps) {
  return (
    <input
      type="number"
      value={value === null ? "" : value}
      onChange={(e) => {
        const v = e.target.value;
        if (v === "") {
          onChange(null);
        } else {
          const num = Number(v);
          if (!isNaN(num)) {
            onChange(num);
          }
        }
      }}
      placeholder={placeholder}
      min={min}
      max={max}
      disabled={disabled}
      className="w-full border-0 border-b-2 border-border bg-transparent px-0 pb-3 pt-1 text-lg text-foreground transition-all duration-200 placeholder:text-muted-foreground/50 focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      {...(props["aria-labelledby"] ? { "aria-labelledby": props["aria-labelledby"] } : {})}
    />
  );
}
