import { getAuthToken, clearAuth } from "../store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuth();
    // Do not hard reload if running in memory or testing
  }

  if (!response.ok) {
    let errorText = response.statusText;
    try {
      const errJson = await response.json();
      errorText = errJson.message || errJson.error || response.statusText;
    } catch {
      // Ignored
    }
    throw new ApiError(errorText, response.status);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};

export default api;
