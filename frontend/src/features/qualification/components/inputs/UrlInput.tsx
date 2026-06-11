interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  "aria-labelledby"?: string;
}

export function UrlInput({ value, onChange, placeholder, disabled, ...props }: UrlInputProps) {
  return (
    <input
      type="url"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "https://linkedin.com/in/..."}
      disabled={disabled}
      className="w-full border-0 border-b-2 border-border bg-transparent px-0 pb-3 pt-1 text-lg text-foreground transition-all duration-200 placeholder:text-muted-foreground/50 focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
      {...(props["aria-labelledby"] ? { "aria-labelledby": props["aria-labelledby"] } : {})}
    />
  );
}
