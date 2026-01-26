// Auth page specific TypeScript interfaces and types

import { ReactNode } from "react";
import type { IUser, AuthResponse } from "./auth";

/**
 * Auth page configuration
 */
export interface AuthPageConfig {
  title: string;
  subtitle: string;
  footer: string;
  defaultMode: AuthMode;
  enableSwitching: boolean;
  enableSocialLogin: boolean;
  enableRememberMe: boolean;
  redirectAfterLogin: string;
  redirectAfterSignup: string;
}

/**
 * Auth modes
 */
export type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password';

/**
 * Auth page props
 */
export interface AuthPageProps {
  mode?: AuthMode;
  redirectTo?: string;
  config?: Partial<AuthPageConfig>;
  onModeChange?: (mode: AuthMode) => void;
  onSuccess?: (data: AuthResponse) => void;
  onError?: (error: AuthPageError) => void;
  className?: string;
  children?: ReactNode;
}

/**
 * Auth component props
 */
export interface AuthComponentProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onSuccess?: (data: AuthResponse) => void;
  onError?: (error: AuthPageError) => void;
  config: AuthPageConfig;
  isLoading?: boolean;
}

/**
 * Auth form data interfaces
 */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  agreeToTerms: boolean;
  newsletter?: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Auth page error types
 */
export interface AuthPageError {
  type: AuthPageErrorType;
  message: string;
  code: string;
  field?: string;
  details?: Record<string, any>;
}

export type AuthPageErrorType = 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_FAILED'
  | 'USER_NOT_FOUND'
  | 'USER_ALREADY_EXISTS'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'RATE_LIMITED'
  | 'ACCOUNT_LOCKED'
  | 'EMAIL_NOT_VERIFIED';

/**
 * Auth validation rules
 */
export interface AuthValidationRules {
  email: {
    required: boolean;
    pattern: RegExp;
    message: string;
  };
  password: {
    required: boolean;
    minLength: number;
    maxLength: number;
    pattern?: RegExp;
    message: string;
  };
  username: {
    required: boolean;
    minLength: number;
    maxLength: number;
    pattern: RegExp;
    message: string;
  };
  confirmPassword: {
    required: boolean;
    mustMatch: boolean;
    message: string;
  };
}

/**
 * Auth form validation state
 */
export interface AuthFormValidation {
  isValid: boolean;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

/**
 * Auth form hooks
 */
export interface UseAuthFormReturn<T> {
  values: T;
  validation: AuthFormValidation;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reset: () => void;
  setFieldError: (field: keyof T, error: string) => void;
  clearFieldError: (field: keyof T) => void;
}

/**
 * Auth social providers
 */
export type SocialProvider = 'google' | 'facebook' | 'twitter' | 'github' | 'discord';

export interface SocialAuthData {
  provider: SocialProvider;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

/**
 * Next.js auth page params
 */
export interface AuthPageParams {
  mode?: string[];
}

export interface AuthPageSearchParams {
  redirect?: string;
  error?: string;
  message?: string;
  token?: string;
}

/**
 * Auth layout props
 */
export interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showFooter?: boolean;
  className?: string;
}

/**
 * Export all page-specific types
 */
export type {
  // Core interfaces
  AuthPageConfig,
  AuthPageProps,
  AuthComponentProps,
  AuthLayoutProps,
  
  // Form data
  LoginFormData,
  SignupFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  
  // Auth data
  AuthPageError,
  AuthPageErrorType,
  AuthMode,
  
  // Validation
  AuthValidationRules,
  AuthFormValidation,
  UseAuthFormReturn,
  
  // Social auth
  SocialProvider,
  SocialAuthData,
  
  // Next.js specific
  AuthPageParams,
  AuthPageSearchParams
};