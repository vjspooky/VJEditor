import type { AIJob, CreateProjectInput, Project } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';
const TOKEN_KEY = 'vjeditor_access_token';
const DEFAULT_USERNAME = 'demo';
const DEFAULT_PASSWORD = 'change-me-now';

async function ensureApiToken(): Promise<string | null> {
  const existing = localStorage.getItem(TOKEN_KEY);
  if (existing) return existing;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: DEFAULT_USERNAME, password: DEFAULT_PASSWORD }),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { token?: string };
    if (!payload.token) return null;
    localStorage.setItem(TOKEN_KEY, payload.token);
    return payload.token;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY) ?? (await ensureApiToken());
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  baseUrl: API_BASE,
  async login(username: string, password: string): Promise<{ token: string; expiresInSeconds: number }> {
    const response = await request<{ token: string; expiresInSeconds: number }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    localStorage.setItem(TOKEN_KEY, response.token);
    return response;
  },
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
  listProjects(): Promise<Project[]> {
    return request<Project[]>('/projects');
  },
  getProject(id: string): Promise<Project> {
    return request<Project>(`/projects/${id}`);
  },
  createProject(input: CreateProjectInput): Promise<Project> {
    return request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  updateProject(id: string, input: CreateProjectInput): Promise<Project> {
    return request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
  deleteProject(id: string): Promise<void> {
    return request<void>(`/projects/${id}`, { method: 'DELETE' });
  },
  async enqueueJob(_job: Pick<AIJob, 'type' | 'projectId' | 'prompt'>): Promise<never> {
    throw new Error('AI job processing is not connected until the Python worker phase.');
  },
};
