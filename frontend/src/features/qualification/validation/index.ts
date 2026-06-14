import type { Question, Validation } from "@/features/qualification/types";

export interface ValidationError {
  field: string;
  message: string;
}

export function validateField(
  question: Question,
  value: unknown
): ValidationError | null {
  if (question.required) {
    if (value === undefined || value === null || value === "") {
      return { field: question.id, message: "This field is required" };
    }
    if (Array.isArray(value) && value.length === 0) {
      return { field: question.id, message: "Please select at least one option" };
    }
  }

  const validation = question.validation as Validation | undefined;
  if (value === undefined || value === null || value === "") {
    return null;
  }

  switch (question.type) {
    case "email": {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        return { field: question.id, message: "Please enter a valid email address" };
      }
      break;
    }
    case "tel": {
      const phoneRegex = /^\+?\d{10,16}$/;
      if (!phoneRegex.test(String(value).replace(/[\s-()]/g, ''))) {
        return { field: question.id, message: "Please enter a valid phone number (10-16 digits)" };
      }
      break;
    }
    case "url": {
      const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
      if (!urlRegex.test(String(value))) {
        return { field: question.id, message: "Please enter a valid URL (e.g., https://example.com)" };
      }
      if (validation?.pattern && !String(value).includes(validation.pattern)) {
        return {
          field: question.id,
          message: `URL must contain ${validation.pattern}`,
        };
      }
      break;
    }
    case "number": {
      const num = Number(value);
      if (isNaN(num)) {
        return { field: question.id, message: "Please enter a valid number" };
      }
      if (validation?.min !== undefined && num < validation.min) {
        return {
          field: question.id,
          message: `Minimum value is ${validation.min}`,
        };
      }
      if (validation?.max !== undefined && num > validation.max) {
        return {
          field: question.id,
          message: `Maximum value is ${validation.max}`,
        };
      }
      break;
    }
    case "text":
    case "textarea": {
      const str = String(value);
      if (validation?.minLength && str.length < validation.minLength) {
        return {
          field: question.id,
          message: `Minimum ${validation.minLength} characters required`,
        };
      }
      if (validation?.maxLength && str.length > validation.maxLength) {
        return {
          field: question.id,
          message: `Maximum ${validation.maxLength} characters allowed`,
        };
      }
      break;
    }
  }

  return null;
}

export function validateAnswers(
  questions: Question[],
  answers: Record<string, unknown>
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const question of questions) {
    const error = validateField(question, answers[question.id]);
    if (error) {
      errors.push(error);
    }
  }

  return errors;
}
