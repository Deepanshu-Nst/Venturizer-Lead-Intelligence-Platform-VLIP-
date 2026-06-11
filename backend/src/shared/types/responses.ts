export interface ApiResponse<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
    fields?: string[];
  } | null;
  meta?: Record<string, unknown>;
}

export function success<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
  return { data, error: null, meta };
}

export function error(code: string, message: string, fields?: string[]): ApiResponse<null> {
  return { data: null, error: { code, message, fields } };
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  perPage: number
): ApiResponse<T[]> {
  return {
    data,
    error: null,
    meta: {
      total,
      page,
      per_page: perPage,
      total_pages: Math.ceil(total / perPage),
    },
  };
}
