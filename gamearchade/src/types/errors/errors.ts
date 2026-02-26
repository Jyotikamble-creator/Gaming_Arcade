// Error handling type definitions and interfaces

import { AxiosError, AxiosResponse } from 'axios';

/**
 * HTTP status code ranges
 */
export type HttpStatusRange = 
  | 'informational' // 1xx
  | 'success'       // 2xx
  | 'redirection'   // 3xx
  | 'client_error'  // 4xx
  | 'server_error'; // 5xx

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Error categories for classification
 */
export type ErrorCategory = 
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'network'
  | 'server'
  | 'client'
  | 'timeout'
  | 'serialization'
  | 'unknown';

/**
 * Base error interface
 */
export interface IBaseError {
  name: string;
  message: string;
  timestamp: Date;
  category: ErrorCategory;
  severity: ErrorSeverity;
  code?: string;
  stack?: string;
  metadata?: Record<string, any>;
  
  /**
   * Convert error to JSON for serialization
   */
  toJSON(): Record<string, any>;
  
  /**
   * Get user-friendly error message
   */
  getUserMessage(): string;
}

/**
 * HTTP error details
 */
export interface HttpErrorDetails {
  status: number;
  statusText: string;
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  response?: any;
  request?: any;
}

/**
 * Client request error interface
 */
export interface IClientRequestError extends IBaseError {
  category: 'client';
  httpDetails: HttpErrorDetails;
  retryable: boolean;
  userMessage?: string;
}

/**
 * Server response error interface
 */
export interface IServerResponseError extends IBaseError {
  category: 'server';
  httpDetails: HttpErrorDetails;
  retryable: boolean;
  alertDevelopers?: boolean;
}

/**
 * Serialization error interface
 */
export interface ISerializationError extends IBaseError {
  category: 'serialization';
  originalError: Error;
  dataType?: string;
  operation: 'serialize' | 'deserialize';
}

/**
 * Connection error interface
 */
export interface IConnectionError extends IBaseError {
  category: 'network';
  connectionType: 'timeout' | 'offline' | 'refused' | 'unreachable';
  retryable: boolean;
  retryAfter?: number; // seconds
}

/**
 * Timeout error interface
 */
export interface ITimeoutError extends IBaseError {
  category: 'timeout';
  timeoutDuration: number; // milliseconds
  operation: string;
  retryable: boolean;
}

/**
 * Validation error interface
 */
export interface IValidationError extends IBaseError {
  category: 'validation';
  field?: string;
  value?: any;
  constraints: string[];
  validationRules?: Record<string, any>;
}

/**
 * Authentication error interface
 */
export interface IAuthenticationError extends IBaseError {
  category: 'authentication';
  reason: 'invalid_credentials' | 'token_expired' | 'token_invalid' | 'missing_token' | 'account_locked';
  retryable: boolean;
  redirectToLogin?: boolean;
}

/**
 * Authorization error interface
 */
export interface IAuthorizationError extends IBaseError {
  category: 'authorization';
  requiredPermissions?: string[];
  userPermissions?: string[];
  resource?: string;
  action?: string;
}

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
  // Logging configuration
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    includeStack: boolean;
    maxStackLines?: number;
  };
  
  // Retry configuration
  retry: {
    enabled: boolean;
    maxAttempts: number;
    backoffStrategy: 'linear' | 'exponential';
    baseDelay: number; // milliseconds
    maxDelay: number; // milliseconds
  };
  
  // User notification configuration
  userNotification: {
    enabled: boolean;
    showTechnicalDetails: boolean;
    defaultMessage: string;
    customMessages: Record<ErrorCategory, string>;
  };
  
  // Development features
  development: {
    detailedErrors: boolean;
    showErrorBoundary: boolean;
    enableErrorOverlay: boolean;
  };
  
  // Monitoring and analytics
  monitoring: {
    enabled: boolean;
    service?: 'sentry' | 'bugsnag' | 'custom';
    apiKey?: string;
    environment: string;
    userId?: string;
  };
}

/**
 * Error context for enhanced debugging
 */
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  url?: string;
  timestamp: Date;
  environment: 'development' | 'staging' | 'production';
  version?: string;
  feature?: string;
  action?: string;
  additionalData?: Record<string, any>;
}

/**
 * Error report interface
 */
export interface ErrorReport {
  id: string;
  error: IBaseError;
  context: ErrorContext;
  stackTrace?: string;
  breadcrumbs?: ErrorBreadcrumb[];
  resolved: boolean;
  reportedAt: Date;
  resolvedAt?: Date;
  tags?: string[];
}

/**
 * Error breadcrumb for tracing user actions
 */
export interface ErrorBreadcrumb {
  timestamp: Date;
  category: 'navigation' | 'user_action' | 'api_call' | 'state_change';
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

/**
 * Error recovery strategy
 */
export interface ErrorRecoveryStrategy {
  type: 'retry' | 'fallback' | 'redirect' | 'ignore';
  params?: {
    maxRetries?: number;
    delay?: number;
    fallbackUrl?: string;
    redirectUrl?: string;
    fallbackData?: any;
  };
}

/**
 * Error handler response
 */
export interface ErrorHandlerResponse {
  handled: boolean;
  error: IBaseError;
  userMessage: string;
  shouldRetry: boolean;
  recoveryStrategy?: ErrorRecoveryStrategy;
  logId?: string;
}

/**
 * Axios error categorization result
 */
export interface AxiosErrorResult {
  originalError: AxiosError;
  categorizedError: IBaseError;
  shouldRetry: boolean;
  retryDelay?: number;
  context?: ErrorContext;
}

/**
 * Error metrics for monitoring
 */
export interface ErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByStatus: Record<number, number>;
  averageResolutionTime: number;
  retrySuccessRate: number;
  mostCommonErrors: Array<{
    message: string;
    count: number;
    lastOccurred: Date;
  }>;
  trends: Array<{
    date: Date;
    count: number;
    category: ErrorCategory;
  }>;
}

/**
 * Error filter criteria
 */
export interface ErrorFilter {
  categories?: ErrorCategory[];
  severities?: ErrorSeverity[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  userId?: string;
  resolved?: boolean;
  statusCodes?: number[];
  searchText?: string;
}

/**
 * Error handler middleware interface
 */
export interface ErrorMiddleware {
  name: string;
  priority: number;
  handle: (error: IBaseError, context: ErrorContext) => Promise<ErrorHandlerResponse> | ErrorHandlerResponse;
}

/**
 * Error notification interface
 */
export interface ErrorNotification {
  id: string;
  error: IBaseError;
  severity: ErrorSeverity;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    primary?: boolean;
  }>;
}

/**
 * Global error state interface
 */
export interface GlobalErrorState {
  errors: IBaseError[];
  notifications: ErrorNotification[];
  isLoading: boolean;
  lastError?: IBaseError;
  errorBoundaryTriggered: boolean;
  retryQueue: Array<{
    operation: () => Promise<any>;
    attempts: number;
    maxAttempts: number;
    nextRetry: Date;
  }>;
}

/**
 * Error boundary props interface
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  isolate?: boolean;
  level?: 'page' | 'component' | 'global';
}

/**
 * Error logging interface
 */
export interface ErrorLogger {
  debug(message: string, error?: Error, context?: Record<string, any>): void;
  info(message: string, error?: Error, context?: Record<string, any>): void;
  warn(message: string, error?: Error, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
  critical(message: string, error?: Error, context?: Record<string, any>): void;
}

/**
 * Common HTTP status codes
 */
export const HTTP_STATUS_CODES = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  
  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

/**
 * Error type guards
 */
export type ErrorTypeGuard<T extends IBaseError> = (error: IBaseError) => error is T;