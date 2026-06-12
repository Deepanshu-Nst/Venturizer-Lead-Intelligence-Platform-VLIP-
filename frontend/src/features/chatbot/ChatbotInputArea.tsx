import { useRef } from "react";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import type { Question } from "@/features/qualification/types";
import {
  TextInput,
  EmailInput,
  PhoneInput,
  UrlInput,
  NumberInput,
  SelectInput,
  MultiSelectInput,
  TextAreaInput,
  BooleanInput,
  FileUploadInput,
} from "@/features/qualification/components/inputs";

interface ChatbotInputAreaProps {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
  onSubmit: () => void;
  onBack: () => void;
  error: string | null;
  disabled: boolean;
  isLastQuestion: boolean;
  canGoBack: boolean;
  documentType: 'pitch-deck' | 'investment-thesis';
}

export function ChatbotInputArea({
  question,
  value,
  onChange,
  onSubmit,
  onBack,
  error,
  disabled,
  isLastQuestion,
  canGoBack,
  documentType,
}: ChatbotInputAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && question.type !== 'textarea') {
      e.preventDefault();
      onSubmit();
    }
  }

  function renderInput() {
    const commonProps = { disabled };
    let finalPlaceholder = question.placeholder ?? 'Type your answer…';
    
    // Add specific placeholders per user request
    if (question.id === 'industry_experience_years') finalPlaceholder = 'Example: 0, 1, 2, 3';
    if (question.id === 'target_customer') finalPlaceholder = 'E.g., Mid-market B2B SaaS companies';
    if (question.id === 'active_users') finalPlaceholder = 'E.g., 1000 monthly active users';
    if (question.id === 'monthly_revenue_usd' || question.id === 'funding_raising_usd') finalPlaceholder = 'e.g., $10,000';
    if (question.id === 'growth_rate') finalPlaceholder = 'e.g., 15%';

    switch (question.type) {
      case 'text':
        return <TextInput value={String(value ?? '')} onChange={onChange} placeholder={finalPlaceholder} {...commonProps} />;
      case 'email':
        return <EmailInput value={String(value ?? '')} onChange={onChange} placeholder={question.placeholder ?? 'your@email.com'} {...commonProps} />;
      case 'tel':
        return <PhoneInput value={String(value ?? '')} onChange={onChange} placeholder={question.placeholder ?? '+1 555 000 0000'} {...commonProps} />;
      case 'url':
        return <UrlInput value={String(value ?? '')} onChange={onChange} placeholder={question.placeholder ?? 'https://'} {...commonProps} />;
      case 'number':
        return <NumberInput value={value === undefined || value === null || value === '' ? null : Number(value)} onChange={onChange} placeholder={finalPlaceholder} min={question.validation?.min} max={question.validation?.max} {...commonProps} />;
      case 'select':
        return <SelectInput value={String(value ?? '')} onChange={onChange} options={question.options ?? []} placeholder={question.placeholder ?? 'Select an option…'} onAutoSubmit={onSubmit} {...commonProps} />;
      case 'multiselect':
        return <MultiSelectInput value={Array.isArray(value) ? value : []} onChange={onChange} options={question.options ?? []} {...commonProps} />;
      case 'textarea':
        return <TextAreaInput value={String(value ?? '')} onChange={onChange} placeholder={finalPlaceholder} {...commonProps} />;
      case 'boolean':
        return <BooleanInput value={value === true || value === false ? (value as boolean) : null} onChange={onChange} onAutoSubmit={onSubmit} {...commonProps} />;
      case 'file':
        return <FileUploadInput value={typeof value === 'string' ? value : null} onChange={(v) => onChange(v)} documentType={documentType} {...commonProps} />;
      default:
        return <TextInput value={String(value ?? '')} onChange={onChange} placeholder={finalPlaceholder} {...commonProps} />;
    }
  }

  return (
    <div
      ref={containerRef}
      className="flex-none border-t border-white/[0.07] px-4 pt-4 pb-5 space-y-3 bg-[#0d1428]"
      onKeyDown={handleKeyDown}
    >
      {/* Input wrapped for dark panel styling */}
      <div className="chatbot-input-wrapper">
        {renderInput()}
      </div>

      {/* Validation error */}
      {error && (
        <div className="flex items-center gap-1.5" role="alert">
          <span className="h-1 w-1 rounded-full bg-red-400 flex-none" aria-hidden />
          <p className="text-[11px] text-red-400 font-medium">{error}</p>
        </div>
      )}

      {/* Actions row */}
      <div className="flex items-center gap-2">
        {canGoBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={disabled}
            aria-label="Go back"
            className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-white/[0.08] text-white/40 hover:text-white hover:border-white/20 transition-colors disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}

        <button
          id="chatbot-submit-btn"
          type="button"
          onClick={onSubmit}
          disabled={disabled}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white h-10 text-[13px] font-bold text-[#0d1428] transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {disabled ? (
            <><Loader2 className="h-4 w-4 animate-spin" aria-hidden />Submitting…</>
          ) : isLastQuestion ? (
            <>Submit <Send className="h-3.5 w-3.5" aria-hidden /></>
          ) : (
            <>Send <Send className="h-3.5 w-3.5" aria-hidden /></>
          )}
        </button>
      </div>

      {/* Helper */}
      {question.helperText && (
        <p className="text-[11px] text-white/25 leading-relaxed">{question.helperText}</p>
      )}
    </div>
  );
}
