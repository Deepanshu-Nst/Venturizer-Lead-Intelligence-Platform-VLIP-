const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  meta?: Record<string, unknown>;
}

function hasBody(method: string): boolean {
  return method === "POST" || method === "PATCH" || method === "PUT";
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const method = options.method ?? "GET";
  const url = `${API_BASE}${path}`;

  const headers: Record<string, string> = {};
  if (hasBody(method)) {
    headers["Content-Type"] = "application/json";
  }
  Object.assign(headers, options.headers as Record<string, string>);

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return {
        data: null,
        error: body.error ?? {
          code: "HTTP_ERROR",
          message: `Request failed with status ${response.status}`,
        },
      };
    }

    return response.json();
  } catch (err) {
    return {
      data: null,
      error: {
        code: "NETWORK_ERROR",
        message: err instanceof Error ? err.message : "Network request failed",
      },
    };
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, formData: FormData) => {
    const url = `${API_BASE}${path}`;
    return fetch(url, { method: "POST", body: formData }).then(
      (res) => res.json() as Promise<ApiResponse<T>>
    );
  },
};
