const TOKEN_KEY = "vjeditor-auth-token";
const USER_KEY = "vjeditor-auth-user";

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string, username?: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  if (username) localStorage.setItem(USER_KEY, username);
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}
