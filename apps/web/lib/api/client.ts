/**
 * lib/api/client.ts
 *
 * Base fetch wrapper for all frontend API calls.
 * Centralises error handling, JSON parsing, and base URL resolution.
 *
 * All methods in this module are for CLIENT-SIDE use only.
 * Do not import from this file in Server Components or API route handlers.
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  params?: Record<string, string | number | boolean | string[] | undefined | null>;
};

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const base = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_APP_URL ?? "");
  const url = new URL(`${base}${path}`, typeof window !== "undefined" ? window.location.origin : undefined);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value == null || value === "") continue;
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, headers, ...rest } = options;

  const url = buildUrl(path, params);
  const isFormData = body instanceof FormData;

  const response = await fetch(url, {
    ...rest,
    headers: {
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: isFormData ? body : body != null ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const json = await response.json();
      errorMessage = json?.error ?? json?.message ?? errorMessage;
    } catch {
      // ignore JSON parse errors
    }
    throw new ApiError(response.status, errorMessage);
  }

  // Handle empty responses (204 No Content etc.)
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, params?: RequestOptions["params"]) =>
    request<T>(path, { method: "GET", params }),

  post: <T>(path: string, body?: unknown, params?: RequestOptions["params"]) =>
    request<T>(path, { method: "POST", body, params }),

  patch: <T>(path: string, body?: unknown, params?: RequestOptions["params"]) =>
    request<T>(path, { method: "PATCH", body, params }),

  delete: <T>(path: string, params?: RequestOptions["params"]) =>
    request<T>(path, { method: "DELETE", params }),

  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", body: formData }),
};
