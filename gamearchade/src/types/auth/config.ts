// Authentication configuration types and constants

/**
 * Authentication configuration interface
 */
export interface AuthConfig {
  // API Configuration
  apiUrl: string;
  endpoints: {
    login: string;
    signup: string;
    logout: string;
    me: string;
    updateProfile: string;
    refresh: string;
    passwordReset: string;
    passwordResetConfirm: string;
    emailVerify: string;
    emailVerifyConfirm: string;
    oauth: string;
    twoFactor: string;
  };
  
  // Token Configuration
  token: {
    storageKey: string;
    refreshKey: string;
    expirationKey: string;
    headerName: string;
    prefix: string;
  };
  
  // Session Configuration
  session: {
    timeout: number; // in milliseconds
    refreshThreshold: number; // refresh when token expires in X milliseconds
    maxRetries: number;
    retryDelay: number;
  };
  
  // Security Configuration
  security: {
    enforceHttps: boolean;
    allowedOrigins: string[];
    csrfProtection: boolean;
    cookieSecure: boolean;
    cookieSameSite: 'strict' | 'lax' | 'none';
  };
  
  // UI Configuration
  ui: {
    redirectAfterLogin: string;
    redirectAfterLogout: string;
    redirectAfterSignup: string;
    showRememberMe: boolean;
    showSocialLogin: boolean;
  };
  
  // Validation Configuration
  validation: {
    password: {
      minLength: number;
      maxLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    username: {
      minLength: number;
      maxLength: number;
      allowedChars: string;
    };
    email: {
      strictValidation: boolean;
      allowedDomains?: string[];
      blockedDomains?: string[];
    };
  };
}

/**
 * Default authentication configuration
 */
export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  endpoints: {
    login: '/auth/login',
    signup: '/auth/signup',
    logout: '/auth/logout',
    me: '/auth/me',
    updateProfile: '/auth/profile',
    refresh: '/auth/refresh',
    passwordReset: '/auth/password-reset',
    passwordResetConfirm: '/auth/password-reset/confirm',
    emailVerify: '/auth/email-verify',
    emailVerifyConfirm: '/auth/email-verify/confirm',
    oauth: '/auth/oauth',
    twoFactor: '/auth/2fa',
  },
  token: {
    storageKey: 'auth_token',
    refreshKey: 'auth_refresh_token',
    expirationKey: 'auth_token_expires',
    headerName: 'Authorization',
    prefix: 'Bearer ',
  },
  session: {
    timeout: 24 * 60 * 60 * 1000, // 24 hours
    refreshThreshold: 5 * 60 * 1000, // 5 minutes
    maxRetries: 3,
    retryDelay: 1000,
  },
  security: {
    enforceHttps: process.env.NODE_ENV === 'production',
    allowedOrigins: ['http://localhost:3000', 'http://localhost:3001'],
    csrfProtection: true,
    cookieSecure: process.env.NODE_ENV === 'production',
    cookieSameSite: 'lax',
  },
  ui: {
    redirectAfterLogin: '/',
    redirectAfterLogout: '/auth/login',
    redirectAfterSignup: '/',
    showRememberMe: true,
    showSocialLogin: false,
  },
  validation: {
    password: {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    username: {
      minLength: 3,
      maxLength: 30,
      allowedChars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-',
    },
    email: {
      strictValidation: true,
      allowedDomains: undefined,
      blockedDomains: ['tempmail.org', '10minutemail.com'],
    },
  },
};

/**
 * Authentication error codes
 */
export const AUTH_ERRORS = {
  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  
  // Token errors
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  TOKEN_MISSING: 'TOKEN_MISSING',
  REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',
  
  // Validation errors
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  INVALID_USERNAME: 'INVALID_USERNAME',
  PASSWORD_TOO_WEAK: 'PASSWORD_TOO_WEAK',
  
  // Registration errors
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  USERNAME_ALREADY_EXISTS: 'USERNAME_ALREADY_EXISTS',
  
  // Rate limiting
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Two-factor authentication
  TWO_FACTOR_REQUIRED: 'TWO_FACTOR_REQUIRED',
  INVALID_TWO_FACTOR_CODE: 'INVALID_TWO_FACTOR_CODE',
  TWO_FACTOR_BACKUP_CODE_USED: 'TWO_FACTOR_BACKUP_CODE_USED',
  
  // OAuth errors
  OAUTH_ERROR: 'OAUTH_ERROR',
  OAUTH_CANCELLED: 'OAUTH_CANCELLED',
  OAUTH_STATE_MISMATCH: 'OAUTH_STATE_MISMATCH',
} as const;

/**
 * Authentication success messages
 */
export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  SIGNUP_SUCCESS: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  EMAIL_VERIFIED: 'Email verified successfully!',
  PASSWORD_RESET_SENT: 'Password reset email sent!',
  TWO_FACTOR_ENABLED: 'Two-factor authentication enabled!',
  TWO_FACTOR_DISABLED: 'Two-factor authentication disabled!',
} as const;

/**
 * Authentication event types for analytics
 */
export const AUTH_EVENTS = {
  LOGIN_ATTEMPT: 'auth:login:attempt',
  LOGIN_SUCCESS: 'auth:login:success',
  LOGIN_FAILURE: 'auth:login:failure',
  LOGOUT: 'auth:logout',
  SIGNUP_ATTEMPT: 'auth:signup:attempt',
  SIGNUP_SUCCESS: 'auth:signup:success',
  SIGNUP_FAILURE: 'auth:signup:failure',
  PROFILE_UPDATE: 'auth:profile:update',
  PASSWORD_CHANGE: 'auth:password:change',
  EMAIL_VERIFICATION: 'auth:email:verification',
  TOKEN_REFRESH: 'auth:token:refresh',
  SESSION_EXPIRED: 'auth:session:expired',
  TWO_FACTOR_SETUP: 'auth:2fa:setup',
  TWO_FACTOR_LOGIN: 'auth:2fa:login',
} as const;

/**
 * Storage keys for authentication data
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'game_arcade_auth_token',
  REFRESH_TOKEN: 'game_arcade_refresh_token',
  USER_DATA: 'game_arcade_user_data',
  TOKEN_EXPIRY: 'game_arcade_token_expiry',
  REMEMBER_ME: 'game_arcade_remember_me',
  LAST_LOGIN: 'game_arcade_last_login',
  LOGIN_ATTEMPTS: 'game_arcade_login_attempts',
  DEVICE_ID: 'game_arcade_device_id',
} as const;

/**
 * HTTP status codes for authentication
 */
export const AUTH_HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Regular expressions for validation
 */
export const VALIDATION_REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,30}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  SPECIAL_CHARS: /[!@#$%^&*(),.?":{}|<>]/,
  NUMBERS: /\d/,
  UPPERCASE: /[A-Z]/,
  LOWERCASE: /[a-z]/,
} as const;

/**
 * Password strength criteria
 */
export const PASSWORD_CRITERIA = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
} as const;

/**
 * Two-factor authentication configuration
 */
export const TWO_FACTOR_CONFIG = {
  CODE_LENGTH: 6,
  CODE_EXPIRY: 30, // seconds
  BACKUP_CODES_COUNT: 10,
  BACKUP_CODE_LENGTH: 8,
  QR_CODE_SIZE: 256,
  ISSUER_NAME: 'Game Arcade',
} as const;

/**
 * OAuth provider configurations
 */
export const OAUTH_PROVIDERS = {
  GOOGLE: {
    name: 'Google',
    icon: 'google',
    color: '#4285f4',
  },
  GITHUB: {
    name: 'GitHub',
    icon: 'github',
    color: '#333',
  },
  DISCORD: {
    name: 'Discord',
    icon: 'discord',
    color: '#7289da',
  },
  APPLE: {
    name: 'Apple',
    icon: 'apple',
    color: '#000',
  },
} as const;