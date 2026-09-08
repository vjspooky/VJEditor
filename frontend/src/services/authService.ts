import api from "./api";
import { setAuthToken, clearAuth, getAuthToken } from "../store/authStore";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    if (response && response.token) {
      setAuthToken(response.token, response.user?.name || credentials.email);
    }
    return response;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", data);
    if (response && response.token) {
      setAuthToken(response.token, response.user?.name || data.name);
    }
    return response;
  },

  logout(): void {
    clearAuth();
  },

  async getCurrentUser(): Promise<AuthResponse["user"] | null> {
    const token = getAuthToken();
    if (!token) return null;
    try {
      return await api.get<AuthResponse["user"]>("/auth/me");
    } catch {
      return null;
    }
  },

  async updateProfile(updates: Partial<RegisterData>): Promise<AuthResponse["user"]> {
    return await api.put<AuthResponse["user"]>("/auth/profile", updates);
  },
};

export default authService;
