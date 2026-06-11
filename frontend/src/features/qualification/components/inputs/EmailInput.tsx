interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  "aria-labelledby"?: string;
}

export function EmailInput({ value, onChange, placeholder, disabled, ...props }: EmailInputProps) {
  return (
    <input
      type="email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "name@example.com"}
      disabled={disabled}
      className="w-full border-0 border-b-2 border-border bg-transparent px-0 pb-3 pt-1 text-lg text-foreground transition-all duration-200 placeholder:text-muted-foreground/50 focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
      {...(props["aria-labelledby"] ? { "aria-labelledby": props["aria-labelledby"] } : {})}
    />
  );
}
