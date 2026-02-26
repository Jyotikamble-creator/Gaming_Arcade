// Extended authentication type definitions

import type { IUser, AuthResponse, UserResponse } from "@/types/auth/auth";

/**
 * Authentication state management types
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: IUser | null;
  token: string | null;
  error: string | null;
}

/**
 * Authentication action types
 */
export type AuthAction =
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: { user: IUser; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_UPDATE_USER'; payload: IUser }
  | { type: 'AUTH_CLEAR_ERROR' };

/**
 * Password strength levels
 */
export type PasswordStrength = 'weak' | 'medium' | 'strong';

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Field validation result
 */
export interface FieldValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Form validation result
 */
export interface FormValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Password validation result
 */
export interface PasswordValidationResult extends ValidationResult {
  strength: PasswordStrength;
}

/**
 * Profile completion result
 */
export interface ProfileCompletionResult {
  completed: boolean;
  completionPercentage: number;
  missingFields: string[];
}

/**
 * Authentication session info
 */
export interface AuthSession {
  user: IUser;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
  isValid: boolean;
}

/**
 * Login options
 */
export interface LoginOptions {
  rememberMe?: boolean;
  redirectTo?: string;
}

/**
 * Signup options
 */
export interface SignupOptions {
  acceptTerms: boolean;
  subscribeNewsletter?: boolean;
  redirectTo?: string;
}

/**
 * OAuth provider types
 */
export type OAuthProvider = 'google' | 'github';

/**
 * OAuth login request
 */
export interface OAuthLoginRequest {
  provider: OAuthProvider;
  code: string;
  state?: string;
  redirectUri: string;
}

/**
 * Two-factor authentication types
 */
export interface TwoFactorAuthSetup {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

export interface TwoFactorAuthRequest {
  code: string;
  backupCode?: string;
}

/**
 * Password reset types
 */
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Email verification types
 */
export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationConfirm {
  token: string;
}

/**
 * Account security settings
 */
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  securityEmails: boolean;
  sessionTimeout: number; // in minutes
}

/**
 * Authentication hooks return types
 */
export interface UseAuthReturn {
  // State
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest, options?: LoginOptions) => Promise<void>;
  signup: (data: SignupRequest, options?: SignupOptions) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileUpdateRequest) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;

  // Utils
  checkAuth: () => Promise<void>;
  isTokenValid: () => boolean;
}

/**
 * Authentication provider props
 */
export interface AuthProviderProps {
  children: React.ReactNode;
  config?: {
    autoRefresh?: boolean;
    refreshInterval?: number; // in milliseconds
    persistAuth?: boolean;
    redirectOnExpiry?: boolean;
    loginRedirect?: string;
  };
}

/**
 * Route protection types
 */
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireGuest?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Authentication middleware options
 */
export interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  roles?: string[];
  permissions?: string[];
  redirectOnFail?: string;
}

/**
 * API authentication headers
 */
export interface AuthHeaders {
  Authorization?: string;
  'X-API-Key'?: string;
  'X-User-ID'?: string;
}

/**
 * Authentication events
 */
export type AuthEvent =
  | 'login'
  | 'logout'
  | 'signup'
  | 'profile_update'
  | 'token_refresh'
  | 'token_expire'
  | 'session_start'
  | 'session_end';

export interface AuthEventPayload {
  event: AuthEvent;
  user?: IUser;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Authentication analytics
 */
export interface AuthAnalytics {
  totalLogins: number;
  totalSignups: number;
  averageSessionDuration: number;
  failedLoginAttempts: number;
  lastLoginAt?: Date;
  deviceInfo?: {
    userAgent: string;
    ip: string;
    location?: string;
  };
}