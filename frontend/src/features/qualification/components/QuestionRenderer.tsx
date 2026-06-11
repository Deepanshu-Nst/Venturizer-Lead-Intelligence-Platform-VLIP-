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
} from "./inputs";

interface QuestionRendererProps {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string | null;
  disabled?: boolean;
  documentType?: "pitch-deck" | "investment-thesis";
  questionId?: string;
}

export function QuestionRenderer({ question, value, onChange, error, disabled, documentType, questionId }: QuestionRendererProps) {
  const labelledBy = questionId ? { "aria-labelledby": questionId } : {};

  function renderInput() {
    switch (question.type) {
      case "file":
        return (
          <FileUploadInput
            value={typeof value === "string" ? value : null}
            onChange={(v) => onChange(v)}
            disabled={disabled}
            documentType={documentType ?? "pitch-deck"}
          />
        );
      case "text":
        return (
          <TextInput
            value={String(value ?? "")}
            onChange={(v) => onChange(v)}
            placeholder={question.placeholder}
            disabled={disabled}
            {...labelledBy}
          />
        );
      case "email":
        return (
          <EmailInput
            value={String(value ?? "")}
            onChange={(v) => onChange(v)}
            placeholder={question.placeholder}
            disabled={disabled}
            {...labelledBy}
          />
        );
      case "tel":
        return (
          <PhoneInput
            value={String(value ?? "")}
            onChange={(v) => onChange(v)}
            placeholder={question.placeholder}
            disabled={disabled}
            {...labelledBy}
          />
        );
      case "url":
        return (
          <UrlInput
            value={String(value ?? "")}
            onChange={(v) => onChange(v)}
            placeholder={question.placeholder}
            disabled={disabled}
            {...labelledBy}
          />
        );
      case "number":
        return (
          <NumberInput
            value={value === undefined || value === null || value === "" ? null : Number(value)}
            onChange={(v) => onChange(v)}
            placeholder={question.placeholder}
            min={question.validation?.min}
            max={question.validation?.max}
            disabled={disabled}
            {...labelledBy}
          />
        );
      case "select":
        return (
          <SelectInput
            value={String(value ?? "")}
            onChange={(v) => onChange(v)}
            options={question.options ?? []}
            placeholder={question.placeholder}
            disabled={disabled}
            {...labelledBy}
          />
        );
      case "multiselect":
        return (
          <MultiSelectInput
            value={Array.isArray(value) ? value : []}
            onChange={(v) => onChange(v)}
            options={question.options ?? []}
            disabled={disabled}
          />
        );
      case "textarea":
        return (
          <TextAreaInput
            value={String(value ?? "")}
            onChange={(v) => onChange(v)}
            placeholder={question.placeholder}
            disabled={disabled}
            {...labelledBy}
          />
        );
      case "boolean":
        return (
          <BooleanInput
            value={value === true || value === false ? (value as boolean) : null}
            onChange={(v) => onChange(v)}
            disabled={disabled}
          />
        );
      default:
        return (
          <TextInput
            value={String(value ?? "")}
            onChange={(v) => onChange(v)}
            placeholder={question.placeholder}
            disabled={disabled}
            {...labelledBy}
          />
        );
    }
  }

  return (
    <div className="space-y-2">
      {renderInput()}
      {error && (
        <p className="text-xs text-destructive font-medium" role="alert">{error}</p>
      )}
    </div>
  );
}
