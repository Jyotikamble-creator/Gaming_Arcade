// Auth page specific utility functions and helpers

import type {
  AuthPageConfig,
  AuthMode,
  AuthFormValidation,
  AuthValidationRules,
  AuthPageError,
  LoginFormData,
  SignupFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData
} from "@/types/auth/page";

/**
 * Auth page configuration utilities
 */
export class AuthPageUtils {
  /**
   * Create default auth page configuration
   */
  static createDefaultConfig(override: Partial<AuthPageConfig> = {}): AuthPageConfig {
    const defaultConfig: AuthPageConfig = {
      title: "Gaming Arcade",
      subtitle: "Welcome to the ultimate gaming experience",
      footer: "You will enjoy the platform.",
      defaultMode: 'login',
      enableSwitching: true,
      enableSocialLogin: false,
      enableRememberMe: true,
      redirectAfterLogin: "/dashboard",
      redirectAfterSignup: "/profile"
    };

    return { ...defaultConfig, ...override };
  }

  /**
   * Get auth mode display name
   */
  static getModeDisplayName(mode: AuthMode): string {
    const displayNames: Record<AuthMode, string> = {
      'login': 'Sign In',
      'signup': 'Sign Up',
      'forgot-password': 'Forgot Password',
      'reset-password': 'Reset Password'
    };

    return displayNames[mode] || 'Authentication';
  }

  /**
   * Get auth mode description
   */
  static getModeDescription(mode: AuthMode): string {
    const descriptions: Record<AuthMode, string> = {
      'login': 'Enter your credentials to access your account',
      'signup': 'Create a new account to start gaming',
      'forgot-password': 'Enter your email to reset your password',
      'reset-password': 'Enter your new password'
    };

    return descriptions[mode] || 'Complete the form to continue';
  }

  /**
   * Get related modes for navigation
   */
  static getRelatedModes(currentMode: AuthMode): Array<{ mode: AuthMode; label: string }> {
    const modeMap: Record<AuthMode, Array<{ mode: AuthMode; label: string }>> = {
      'login': [
        { mode: 'signup', label: "Don't have an account? Sign up" },
        { mode: 'forgot-password', label: 'Forgot your password?' }
      ],
      'signup': [
        { mode: 'login', label: 'Already have an account? Sign in' }
      ],
      'forgot-password': [
        { mode: 'login', label: 'Remember your password? Sign in' },
        { mode: 'signup', label: "Don't have an account? Sign up" }
      ],
      'reset-password': [
        { mode: 'login', label: 'Back to sign in' }
      ]
    };

    return modeMap[currentMode] || [];
  }
}

/**
 * Auth page validation utilities
 */
export class AuthPageValidationUtils {
  /**
   * Default validation rules
   */
  private static readonly defaultRules: AuthValidationRules = {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    password: {
      required: true,
      minLength: 8,
      maxLength: 128,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character'
    },
    username: {
      required: true,
      minLength: 3,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_-]+$/,
      message: 'Username must be 3-20 characters using only letters, numbers, hyphens and underscores'
    },
    confirmPassword: {
      required: true,
      mustMatch: true,
      message: 'Passwords must match'
    }
  };

  /**
   * Validate email
   */
  static validateEmail(email: string): string[] {
    const errors: string[] = [];
    const rules = this.defaultRules.email;

    if (rules.required && !email.trim()) {
      errors.push('Email is required');
    } else if (email && !rules.pattern.test(email)) {
      errors.push(rules.message);
    }

    return errors;
  }

  /**
   * Validate password
   */
  static validatePassword(password: string): string[] {
    const errors: string[] = [];
    const rules = this.defaultRules.password;

    if (rules.required && !password) {
      errors.push('Password is required');
    } else if (password) {
      if (password.length < rules.minLength) {
        errors.push(`Password must be at least ${rules.minLength} characters long`);
      }
      if (password.length > rules.maxLength) {
        errors.push(`Password must be no more than ${rules.maxLength} characters long`);
      }
      if (rules.pattern && !rules.pattern.test(password)) {
        errors.push(rules.message);
      }
    }

    return errors;
  }

  /**
   * Validate username
   */
  static validateUsername(username: string): string[] {
    const errors: string[] = [];
    const rules = this.defaultRules.username;

    if (rules.required && !username.trim()) {
      errors.push('Username is required');
    } else if (username) {
      if (username.length < rules.minLength) {
        errors.push(`Username must be at least ${rules.minLength} characters long`);
      }
      if (username.length > rules.maxLength) {
        errors.push(`Username must be no more than ${rules.maxLength} characters long`);
      }
      if (!rules.pattern.test(username)) {
        errors.push(rules.message);
      }
    }

    return errors;
  }

  /**
   * Validate password confirmation
   */
  static validateConfirmPassword(password: string, confirmPassword: string): string[] {
    const errors: string[] = [];
    const rules = this.defaultRules.confirmPassword;

    if (rules.required && !confirmPassword) {
      errors.push('Please confirm your password');
    } else if (confirmPassword && rules.mustMatch && password !== confirmPassword) {
      errors.push(rules.message);
    }

    return errors;
  }

  /**
   * Validate login form
   */
  static validateLoginForm(data: LoginFormData): AuthFormValidation {
    const errors: Record<string, string[]> = {};

    errors.email = this.validateEmail(data.email);
    errors.password = this.validatePassword(data.password);

    // Remove empty error arrays
    Object.keys(errors).forEach(key => {
      if (errors[key].length === 0) {
        delete errors[key];
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      touched: {},
      isSubmitting: false
    };
  }

  /**
   * Validate signup form
   */
  static validateSignupForm(data: SignupFormData): AuthFormValidation {
    const errors: Record<string, string[]> = {};

    errors.email = this.validateEmail(data.email);
    errors.username = this.validateUsername(data.username);
    errors.password = this.validatePassword(data.password);
    errors.confirmPassword = this.validateConfirmPassword(data.password, data.confirmPassword);

    if (!data.agreeToTerms) {
      errors.agreeToTerms = ['You must agree to the terms and conditions'];
    }

    // Remove empty error arrays
    Object.keys(errors).forEach(key => {
      if (errors[key].length === 0) {
        delete errors[key];
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      touched: {},
      isSubmitting: false
    };
  }

  /**
   * Get password strength
   */
  static getPasswordStrength(password: string): {
    score: number;
    label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
    suggestions: string[];
  } {
    let score = 0;
    const suggestions: string[] = [];

    // Length check
    if (password.length >= 8) score += 1;
    else suggestions.push('Use at least 8 characters');

    if (password.length >= 12) score += 1;
    else if (password.length >= 8) suggestions.push('Consider using 12+ characters for better security');

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    else suggestions.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else suggestions.push('Include uppercase letters');

    if (/\d/.test(password)) score += 1;
    else suggestions.push('Include numbers');

    if (/[@$!%*?&]/.test(password)) score += 1;
    else suggestions.push('Include special characters');

    // Common patterns check
    if (!/(.)\1{2,}/.test(password)) score += 1;
    else suggestions.push('Avoid repeated characters');

    const labels: Array<'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong'> = [
      'Very Weak', 'Very Weak', 'Weak', 'Fair', 'Good', 'Good', 'Strong', 'Strong'
    ];

    return {
      score: Math.min(score, 7),
      label: labels[Math.min(score, 7)],
      suggestions
    };
  }
}

/**
 * Auth page error utilities
 */
export class AuthPageErrorUtils {
  /**
   * Create auth error
   */
  static createError(
    type: AuthPageError['type'],
    message: string,
    code: string,
    field?: string,
    details?: Record<string, any>
  ): AuthPageError {
    return {
      type,
      message,
      code,
      field,
      details
    };
  }

  /**
   * Parse API error response
   */
  static parseApiError(error: any): AuthPageError {
    // Handle network errors
    if (!error.response) {
      return this.createError(
        'NETWORK_ERROR',
        'Unable to connect to server. Please check your internet connection.',
        'NETWORK_ERROR'
      );
    }

    const { status, data } = error.response;

    // Handle different status codes
    switch (status) {
      case 400:
        return this.createError(
          'VALIDATION_ERROR',
          data.message || 'Invalid input provided',
          'VALIDATION_ERROR',
          data.field,
          data
        );
      
      case 401:
        return this.createError(
          'AUTHENTICATION_FAILED',
          data.message || 'Invalid credentials',
          'AUTHENTICATION_FAILED'
        );
      
      case 404:
        return this.createError(
          'USER_NOT_FOUND',
          data.message || 'User not found',
          'USER_NOT_FOUND'
        );
      
      case 409:
        return this.createError(
          'USER_ALREADY_EXISTS',
          data.message || 'User already exists',
          'USER_ALREADY_EXISTS',
          data.field
        );
      
      case 429:
        return this.createError(
          'RATE_LIMITED',
          data.message || 'Too many requests. Please try again later.',
          'RATE_LIMITED'
        );
      
      case 500:
      default:
        return this.createError(
          'SERVER_ERROR',
          data.message || 'An unexpected error occurred. Please try again.',
          'SERVER_ERROR'
        );
    }
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: AuthPageError): string {
    const friendlyMessages: Record<AuthPageError['type'], string> = {
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'AUTHENTICATION_FAILED': 'Invalid email or password. Please try again.',
      'USER_NOT_FOUND': 'No account found with this email address.',
      'USER_ALREADY_EXISTS': 'An account with this email already exists.',
      'INVALID_TOKEN': 'Your session has expired. Please try again.',
      'TOKEN_EXPIRED': 'Your session has expired. Please log in again.',
      'NETWORK_ERROR': 'Connection error. Please check your internet and try again.',
      'SERVER_ERROR': 'Something went wrong. Please try again later.',
      'RATE_LIMITED': 'Too many attempts. Please wait before trying again.',
      'ACCOUNT_LOCKED': 'Your account has been temporarily locked for security.',
      'EMAIL_NOT_VERIFIED': 'Please verify your email address to continue.'
    };

    return friendlyMessages[error.type] || error.message;
  }

  /**
   * Check if error is recoverable
   */
  static isRecoverable(error: AuthPageError): boolean {
    const recoverableTypes: AuthPageError['type'][] = [
      'VALIDATION_ERROR',
      'AUTHENTICATION_FAILED',
      'NETWORK_ERROR'
    ];

    return recoverableTypes.includes(error.type);
  }
}

/**
 * Auth navigation utilities
 */
export class AuthPageNavigationUtils {
  /**
   * Build auth URL
   */
  static buildAuthUrl(mode: AuthMode, params: Record<string, string> = {}): string {
    const url = new URL('/auth', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    
    // Set mode parameter
    url.searchParams.set('mode', mode);
    
    // Add additional parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    return url.pathname + url.search;
  }

  /**
   * Get redirect URL with fallback
   */
  static getRedirectUrl(
    requested?: string | null,
    defaultUrl: string = '/dashboard',
    allowedDomains: string[] = []
  ): string {
    if (!requested) {
      return defaultUrl;
    }

    try {
      const url = new URL(requested, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
      
      // Check if it's a relative URL or allowed domain
      if (url.origin === window?.location?.origin || allowedDomains.includes(url.hostname)) {
        return requested;
      }
    } catch {
      // Invalid URL, use default
    }

    return defaultUrl;
  }

  /**
   * Get Next.js auth route
   */
  static getAuthRoute(mode: AuthMode): string {
    const routes: Record<AuthMode, string> = {
      'login': '/auth',
      'signup': '/auth?mode=signup',
      'forgot-password': '/auth?mode=forgot-password',
      'reset-password': '/auth?mode=reset-password'
    };

    return routes[mode] || '/auth';
  }

  /**
   * Parse URL mode parameter
   */
  static parseUrlMode(searchParams: URLSearchParams, pathname: string): AuthMode {
    // Check search params first
    const modeParam = searchParams.get('mode');
    if (modeParam) {
      const validModes: AuthMode[] = ['login', 'signup', 'forgot-password', 'reset-password'];
      if (validModes.includes(modeParam as AuthMode)) {
        return modeParam as AuthMode;
      }
    }

    // Check pathname patterns
    if (pathname.includes('signup')) return 'signup';
    if (pathname.includes('forgot')) return 'forgot-password';
    if (pathname.includes('reset')) return 'reset-password';
    
    return 'login';
  }
}

/**
 * Export all utilities as a combined object
 */
export const AuthPageHelpers = {
  Config: AuthPageUtils,
  Validation: AuthPageValidationUtils,
  Error: AuthPageErrorUtils,
  Navigation: AuthPageNavigationUtils
};