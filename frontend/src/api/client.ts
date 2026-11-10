import { clearToken, getToken } from "./token";

const API_URL: string = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
export const UNAUTHORIZED_EVENT = "synced:unauthorized";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH";
  json?: unknown; // sent as a JSON body
  form?: Record<string, string>; // sent as a form body (the login endpoint wants this)
}

// FastAPI reports errors as { detail: "text" } or { detail: [{ msg: "..." }] }.
function errorMessage(body: unknown, fallback: string): string {
  if (typeof body === "object" && body !== null && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string };
      if (first.msg) return first.msg;
    }
  }
  return fallback;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (options.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.json);
  } else if (options.form) {
    body = new URLSearchParams(options.form); // the browser sets the content type
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body,
    });
  } catch {
    throw new ApiError(
      0,
      "Cannot reach the server. Check your connection and try again.",
    );
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    // A 401 while holding a token means it expired or is invalid: forget it.
    if (response.status === 401 && token) {
      clearToken();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(
      response.status,
      errorMessage(data, `Request failed (${response.status})`),
    );
  }
  return data as T;
}