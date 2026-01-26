// Authentication API client for Next.js GameArchade
// Uses Axios for HTTP requests with full TypeScript support

import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import type {
  SignupRequest,
  LoginRequest,
  ProfileUpdateRequest,
  AuthResponse,
  UserResponse,
  ErrorResponse,
  JWTPayload
} from "@/types/auth/auth";
import type { ApiResponse, ApiErrorResponse } from "@/types/api/client";

// Logger tags for authentication operations
const AuthLogTags = {
  REGISTER: "REGISTER",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  SESSIONS: "SESSIONS",
  TOKEN_MANAGER: "TOKEN_MANAGER",
  PROFILE_UPDATE: "PROFILE_UPDATE"
} as const;

type AuthLogTag = typeof AuthLogTags[keyof typeof AuthLogTags];

// Enhanced logging interface for auth operations
interface AuthLogContext {
  email?: string;
  userId?: string;
  [key: string]: any;
}

// Logger utility for authentication
const authLogger = {
  debug: (message: string, context: AuthLogContext, tag: AuthLogTag) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[${tag}] ${message}`, context);
    }
  },
  info: (message: string, context: AuthLogContext, tag: AuthLogTag) => {
    console.info(`[${tag}] ${message}`, context);
  },
  error: (message: string, error: Error | unknown, context: AuthLogContext, tag: AuthLogTag) => {
    console.error(`[${tag}] ${message}`, error, context);
  }
};

// API configuration for authentication
const AUTH_API_BASE = process.env.NEXT_PUBLIC_API_BASE || 
                     (typeof window !== 'undefined' ? '/api' : 'http://localhost:3000/api');

// Create dedicated Axios instance for auth operations
const authAPI: AxiosInstance = axios.create({
  baseURL: AUTH_API_BASE,
  timeout: 15000, // Longer timeout for auth operations
  headers: {
    'Content-Type': 'application/json',
  }
});

// Helper function to get token from storage (client-side only)
const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem("token");
  } catch (e) {
    authLogger.error("Error accessing stored token", e, {}, AuthLogTags.TOKEN_MANAGER);
    return null;
  }
};

// Helper function to store token (client-side only)
const storeToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem("token", token);
  } catch (e) {
    authLogger.error("Error storing token", e, {}, AuthLogTags.TOKEN_MANAGER);
  }
};

// Helper function to remove token (client-side only)
const removeStoredToken = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch (e) {
    authLogger.error("Error removing stored data", e, {}, AuthLogTags.TOKEN_MANAGER);
  }
};

// Request interceptor to attach auth token
authAPI.interceptors.request.use((config) => {
  try {
    const token = getStoredToken();
    if (token) {
      config.headers = { 
        ...config.headers, 
        Authorization: `Bearer ${token}` 
      };
      authLogger.debug(
        "Auth token attached to request",
        { url: config.url },
        AuthLogTags.TOKEN_MANAGER
      );
    }
  } catch (e) {
    authLogger.error("Error attaching auth token", e, {}, AuthLogTags.TOKEN_MANAGER);
  }
  return config;
});

// Response interceptor for auth-specific error handling
authAPI.interceptors.response.use(
  (response: AxiosResponse) => {
    authLogger.debug(
      "Auth API response received",
      { url: response.config.url, status: response.status },
      AuthLogTags.TOKEN_MANAGER
    );
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 errors by clearing stored auth data
    if (error.response?.status === 401) {
      removeStoredToken();
      authLogger.error(
        "Authentication expired, clearing stored data",
        error,
        { url: error.config?.url },
        AuthLogTags.TOKEN_MANAGER
      );
    }

    authLogger.error(
      "Auth API request failed",
      error,
      { url: error.config?.url, status: error.response?.status },
      AuthLogTags.TOKEN_MANAGER
    );
    return Promise.reject(error);
  }
);

// Authentication API Client class
export class AuthApiClient {
  private api: AxiosInstance;

  constructor() {
    this.api = authAPI;
  }

  /**
   * User signup
   */
  async signup(credentials: SignupRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      authLogger.info("Attempting user signup", { email: credentials.email }, AuthLogTags.REGISTER);
      
      const response = await this.api.post<AuthResponse>("/auth/signup", credentials);
      const { token, user } = response.data;

      // Store token and user data
      if (token) {
        storeToken(token);
        if (typeof window !== 'undefined') {
          localStorage.setItem("user", JSON.stringify(user));
        }
      }

      authLogger.info(
        "User signup successful",
        { email: credentials.email, userId: user.id },
        AuthLogTags.REGISTER
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      authLogger.error("User signup failed", error, { email: credentials.email }, AuthLogTags.REGISTER);
      throw this.handleAuthError(error);
    }
  }

  /**
   * User login
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      authLogger.info("Attempting user login", { email: credentials.email }, AuthLogTags.LOGIN);
      
      const response = await this.api.post<AuthResponse>("/auth/login", credentials);
      const { token, user } = response.data;

      // Store token and user data
      if (token) {
        storeToken(token);
        if (typeof window !== 'undefined') {
          localStorage.setItem("user", JSON.stringify(user));
        }
      }

      authLogger.info(
        "User login successful",
        { email: credentials.email, userId: user.id },
        AuthLogTags.LOGIN
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      authLogger.error("User login failed", error, { email: credentials.email }, AuthLogTags.LOGIN);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<ApiResponse<UserResponse>> {
    try {
      authLogger.debug("Fetching current user info", {}, AuthLogTags.SESSIONS);
      
      const response = await this.api.get<UserResponse>("/auth/me");
      
      // Update stored user data
      if (typeof window !== 'undefined' && response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      authLogger.debug(
        "Current user info fetched",
        { userId: response.data.user.id },
        AuthLogTags.SESSIONS
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      authLogger.error(
        "Failed to fetch current user info",
        error,
        {},
        AuthLogTags.SESSIONS
      );
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: ProfileUpdateRequest): Promise<ApiResponse<UserResponse>> {
    try {
      authLogger.info(
        "Updating user profile",
        { profileData },
        AuthLogTags.PROFILE_UPDATE
      );
      
      const response = await this.api.put<UserResponse>("/auth/profile", profileData);
      
      // Update stored user data
      if (typeof window !== 'undefined' && response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      authLogger.info(
        "User profile updated successfully",
        { userId: response.data.user.id },
        AuthLogTags.PROFILE_UPDATE
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      authLogger.error(
        "Failed to update user profile",
        error,
        { profileData },
        AuthLogTags.PROFILE_UPDATE
      );
      throw this.handleAuthError(error);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      authLogger.info("User logout initiated", {}, AuthLogTags.LOGOUT);
      
      // Clear stored auth data
      removeStoredToken();
      
      // Optional: Call server logout endpoint if it exists
      try {
        await this.api.post("/auth/logout");
      } catch (e) {
        // Ignore server logout errors, local logout is sufficient
        authLogger.debug("Server logout failed, but local logout completed", e, {}, AuthLogTags.LOGOUT);
      }

      authLogger.info("User logout completed", {}, AuthLogTags.LOGOUT);
    } catch (error) {
      authLogger.error("Logout error", error, {}, AuthLogTags.LOGOUT);
      // Even if there's an error, ensure local data is cleared
      removeStoredToken();
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = getStoredToken();
    return !!token;
  }

  /**
   * Get stored user data
   */
  getStoredUser(): any | null {
    if (typeof window === 'undefined') return null;
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      authLogger.error("Error parsing stored user data", e, {}, AuthLogTags.SESSIONS);
      return null;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    try {
      authLogger.debug("Refreshing authentication token", {}, AuthLogTags.TOKEN_MANAGER);
      
      const response = await this.api.post<AuthResponse>("/auth/refresh");
      const { token, user } = response.data;

      if (token) {
        storeToken(token);
        if (typeof window !== 'undefined') {
          localStorage.setItem("user", JSON.stringify(user));
        }
      }

      authLogger.debug("Token refreshed successfully", { userId: user.id }, AuthLogTags.TOKEN_MANAGER);

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      authLogger.error("Token refresh failed", error, {}, AuthLogTags.TOKEN_MANAGER);
      // Clear invalid token
      removeStoredToken();
      throw this.handleAuthError(error);
    }
  }

  /**
   * Handle authentication-specific errors
   */
  private handleAuthError(error: unknown): ApiErrorResponse {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data as ErrorResponse | undefined;

      // Handle specific auth error cases
      if (status === 401) {
        removeStoredToken();
        return {
          success: false,
          error: "Authentication failed. Please log in again.",
          status,
          details: data
        };
      }

      if (status === 403) {
        return {
          success: false,
          error: "Access denied. Insufficient permissions.",
          status,
          details: data
        };
      }

      if (status === 409) {
        return {
          success: false,
          error: "Email already exists. Please use a different email.",
          status,
          details: data
        };
      }

      return {
        success: false,
        error: data?.error || error.message,
        status,
        details: data
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication error occurred"
    };
  }
}

// Export singleton instance
export const authApiClient = new AuthApiClient();

// Export individual functions for backward compatibility
export const signup = (credentials: SignupRequest) => authApiClient.signup(credentials);
export const login = (credentials: LoginRequest) => authApiClient.login(credentials);
export const me = () => authApiClient.getCurrentUser();
export const updateProfile = (profileData: ProfileUpdateRequest) => authApiClient.updateProfile(profileData);
export const logout = () => authApiClient.logout();

export default authApiClient;