// Enhanced error handling client for Next.js with TypeScript

import { AxiosError } from 'axios';
import { logger } from "@/lib/logger";
import type {
  IBaseError,
  IClientRequestError,
  IServerResponseError,
  ISerializationError,
  IConnectionError,
  ITimeoutError,
  IValidationError,
  IAuthenticationError,
  IAuthorizationError,
  ErrorCategory,
  ErrorSeverity,
  ErrorHandlerConfig,
  ErrorContext,
  ErrorHandlerResponse,
  AxiosErrorResult,
  ErrorRecoveryStrategy,
  HTTP_STATUS_CODES
} from "@/types/errors/errors";

/**
 * Enhanced custom error classes with TypeScript support
 */

/**
 * Base error class with enhanced properties
 */
abstract class BaseError extends Error implements IBaseError {
  public readonly name: string;
  public readonly timestamp: Date;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly code?: string;
  public readonly metadata?: Record<string, any>;

  constructor(
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity = 'medium',
    code?: string,
    metadata?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.category = category;
    this.severity = severity;
    this.code = code;
    this.metadata = metadata;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace if available
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON for serialization
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
      category: this.category,
      severity: this.severity,
      code: this.code,
      stack: this.stack,
      metadata: this.metadata
    };
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    const userMessages: Record<ErrorCategory, string> = {
      authentication: 'Authentication failed. Please check your credentials.',
      authorization: 'You do not have permission to perform this action.',
      validation: 'The provided data is invalid. Please check your input.',
      network: 'Network connection failed. Please check your internet connection.',
      server: 'A server error occurred. Please try again later.',
      client: 'An error occurred while processing your request.',
      timeout: 'The request timed out. Please try again.',
      serialization: 'Data processing error. Please try again.',
      unknown: 'An unexpected error occurred. Please try again.'
    };

    return userMessages[this.category] || userMessages.unknown;
  }
}

/**
 * Client request error (4xx status codes)
 */
export class ClientRequestError extends BaseError implements IClientRequestError {
  public readonly httpDetails: IClientRequestError['httpDetails'];
  public readonly retryable: boolean;
  public readonly userMessage?: string;

  constructor(
    message: string,
    status: number,
    statusText: string,
    response?: any,
    options: {
      method?: string;
      url?: string;
      headers?: Record<string, string>;
      retryable?: boolean;
      userMessage?: string;
      metadata?: Record<string, any>;
    } = {}
  ) {
    const severity = ClientRequestError.determineSeverity(status);
    super(message, 'client', severity, `HTTP_${status}`, options.metadata);

    this.httpDetails = {
      status,
      statusText,
      method: options.method,
      url: options.url,
      headers: options.headers,
      response
    };
    this.retryable = options.retryable ?? ClientRequestError.isRetryable(status);
    this.userMessage = options.userMessage;
  }

  private static determineSeverity(status: number): ErrorSeverity {
    if (status === 401 || status === 403) return 'high';
    if (status === 404 || status === 422) return 'medium';
    if (status === 429) return 'low';
    return 'medium';
  }

  private static isRetryable(status: number): boolean {
    // Generally retryable client errors
    return [408, 409, 423, 429].includes(status);
  }
}

/**
 * Server response error (5xx status codes)
 */
export class ServerResponseError extends BaseError implements IServerResponseError {
  public readonly httpDetails: IServerResponseError['httpDetails'];
  public readonly retryable: boolean;
  public readonly alertDevelopers?: boolean;

  constructor(
    message: string,
    status: number,
    statusText: string,
    response?: any,
    options: {
      method?: string;
      url?: string;
      headers?: Record<string, string>;
      retryable?: boolean;
      alertDevelopers?: boolean;
      metadata?: Record<string, any>;
    } = {}
  ) {
    const severity = ServerResponseError.determineSeverity(status);
    super(message, 'server', severity, `HTTP_${status}`, options.metadata);

    this.httpDetails = {
      status,
      statusText,
      method: options.method,
      url: options.url,
      headers: options.headers,
      response
    };
    this.retryable = options.retryable ?? true;
    this.alertDevelopers = options.alertDevelopers ?? (status >= 500);
  }

  private static determineSeverity(status: number): ErrorSeverity {
    if (status >= 500) return 'critical';
    return 'high';
  }
}

/**
 * Serialization/Deserialization error
 */
export class SerializationError extends BaseError implements ISerializationError {
  public readonly originalError: Error;
  public readonly dataType?: string;
  public readonly operation: 'serialize' | 'deserialize';

  constructor(
    message: string,
    originalError: Error,
    operation: 'serialize' | 'deserialize',
    dataType?: string,
    metadata?: Record<string, any>
  ) {
    super(message, 'serialization', 'medium', 'SERIALIZATION_ERROR', metadata);
    this.originalError = originalError;
    this.operation = operation;
    this.dataType = dataType;
  }

  /**
   * Get the root cause of the serialization error
   */
  getRootCause(): string {
    return this.originalError.message || 'Unknown serialization error';
  }
}

/**
 * Connection error (network issues)
 */
export class ConnectionError extends BaseError implements IConnectionError {
  public readonly connectionType: IConnectionError['connectionType'];
  public readonly retryable: boolean;
  public readonly retryAfter?: number;

  constructor(
    message: string,
    connectionType: IConnectionError['connectionType'] = 'unreachable',
    options: {
      retryable?: boolean;
      retryAfter?: number;
      metadata?: Record<string, any>;
    } = {}
  ) {
    super(message, 'network', 'high', 'CONNECTION_ERROR', options.metadata);
    this.connectionType = connectionType;
    this.retryable = options.retryable ?? true;
    this.retryAfter = options.retryAfter;
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends BaseError implements ITimeoutError {
  public readonly timeoutDuration: number;
  public readonly operation: string;
  public readonly retryable: boolean;

  constructor(
    message: string,
    timeoutDuration: number,
    operation: string,
    options: {
      retryable?: boolean;
      metadata?: Record<string, any>;
    } = {}
  ) {
    super(message, 'timeout', 'medium', 'TIMEOUT_ERROR', options.metadata);
    this.timeoutDuration = timeoutDuration;
    this.operation = operation;
    this.retryable = options.retryable ?? true;
  }

  /**
   * Get formatted timeout duration
   */
  getFormattedDuration(): string {
    if (this.timeoutDuration < 1000) {
      return `${this.timeoutDuration}ms`;
    }
    return `${(this.timeoutDuration / 1000).toFixed(1)}s`;
  }
}

/**
 * Validation error
 */
export class ValidationError extends BaseError implements IValidationError {
  public readonly field?: string;
  public readonly value?: any;
  public readonly constraints: string[];
  public readonly validationRules?: Record<string, any>;

  constructor(
    message: string,
    constraints: string[],
    options: {
      field?: string;
      value?: any;
      validationRules?: Record<string, any>;
      metadata?: Record<string, any>;
    } = {}
  ) {
    super(message, 'validation', 'low', 'VALIDATION_ERROR', options.metadata);
    this.field = options.field;
    this.value = options.value;
    this.constraints = constraints;
    this.validationRules = options.validationRules;
  }

  /**
   * Get formatted validation errors
   */
  getFormattedConstraints(): string[] {
    return this.constraints.map(constraint => {
      if (this.field) {
        return `${this.field}: ${constraint}`;
      }
      return constraint;
    });
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends BaseError implements IAuthenticationError {
  public readonly reason: IAuthenticationError['reason'];
  public readonly retryable: boolean;
  public readonly redirectToLogin?: boolean;

  constructor(
    message: string,
    reason: IAuthenticationError['reason'],
    options: {
      retryable?: boolean;
      redirectToLogin?: boolean;
      metadata?: Record<string, any>;
    } = {}
  ) {
    super(message, 'authentication', 'high', `AUTH_${reason.toUpperCase()}`, options.metadata);
    this.reason = reason;
    this.retryable = options.retryable ?? (reason === 'token_expired');
    this.redirectToLogin = options.redirectToLogin ?? true;
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends BaseError implements IAuthorizationError {
  public readonly requiredPermissions?: string[];
  public readonly userPermissions?: string[];
  public readonly resource?: string;
  public readonly action?: string;

  constructor(
    message: string,
    options: {
      requiredPermissions?: string[];
      userPermissions?: string[];
      resource?: string;
      action?: string;
      metadata?: Record<string, any>;
    } = {}
  ) {
    super(message, 'authorization', 'high', 'AUTHORIZATION_ERROR', options.metadata);
    this.requiredPermissions = options.requiredPermissions;
    this.userPermissions = options.userPermissions;
    this.resource = options.resource;
    this.action = options.action;
  }

  /**
   * Get missing permissions
   */
  getMissingPermissions(): string[] {
    if (!this.requiredPermissions || !this.userPermissions) {
      return [];
    }
    return this.requiredPermissions.filter(perm => !this.userPermissions!.includes(perm));
  }
}

/**
 * Enhanced Error Handler Client
 */
export class ErrorHandlerClient {
  private config: ErrorHandlerConfig;
  private context: Partial<ErrorContext>;

  constructor(config?: Partial<ErrorHandlerConfig>, context?: Partial<ErrorContext>) {
    this.config = {
      logging: {
        enabled: true,
        level: 'error',
        includeStack: process.env.NODE_ENV === 'development',
        maxStackLines: 10,
      },
      retry: {
        enabled: true,
        maxAttempts: 3,
        backoffStrategy: 'exponential',
        baseDelay: 1000,
        maxDelay: 30000,
      },
      userNotification: {
        enabled: true,
        showTechnicalDetails: process.env.NODE_ENV === 'development',
        defaultMessage: 'An unexpected error occurred. Please try again.',
        customMessages: {
          authentication: 'Authentication failed. Please log in again.',
          authorization: 'You do not have permission to perform this action.',
          validation: 'Please check your input and try again.',
          network: 'Network error. Please check your connection.',
          server: 'Server error. Please try again later.',
          client: 'Request error. Please try again.',
          timeout: 'Request timed out. Please try again.',
          serialization: 'Data processing error. Please try again.',
          unknown: 'An unexpected error occurred. Please try again.',
        },
      },
      development: {
        detailedErrors: process.env.NODE_ENV === 'development',
        showErrorBoundary: process.env.NODE_ENV === 'development',
        enableErrorOverlay: process.env.NODE_ENV === 'development',
      },
      monitoring: {
        enabled: process.env.NODE_ENV === 'production',
        environment: process.env.NODE_ENV || 'development',
      },
      ...config,
    };

    this.context = {
      environment: (process.env.NODE_ENV as any) || 'development',
      timestamp: new Date(),
      ...context,
    };
  }

  /**
   * Categorize Axios errors with enhanced logic
   */
  categorizeAxiosError(error: AxiosError): AxiosErrorResult {
    logger.debug('Categorizing Axios error', { error: error.message, code: error.code });

    if (!error) {
      const unknownError = new BaseError('Unknown error', 'unknown', 'medium') as IBaseError;
      return {
        originalError: error,
        categorizedError: unknownError,
        shouldRetry: false,
        context: this.buildContext(),
      };
    }

    let categorizedError: IBaseError;
    let shouldRetry = false;
    let retryDelay: number | undefined;

    // Handle Axios-specific errors
    if (error.code === 'ECONNABORTED') {
      logger.error('[ERROR] Timeout error:', error.message);
      categorizedError = new TimeoutError(
        error.message || 'Request timed out',
        parseInt(error.timeout?.toString() || '0', 10),
        'HTTP request'
      );
      shouldRetry = true;
      retryDelay = this.calculateRetryDelay(1);
    } 
    // Response received from server
    else if (error.response) {
      const { status, statusText, data } = error.response;
      const url = error.config?.url;
      const method = error.config?.method?.toUpperCase();

      logger.error('[ERROR] HTTP error:', {
        status,
        statusText,
        method,
        url,
        message: error.message,
      });

      if (status >= 400 && status < 500) {
        // Client-side error
        categorizedError = new ClientRequestError(
          error.message || 'Client error',
          status,
          statusText,
          data,
          { method, url }
        );
        shouldRetry = (categorizedError as ClientRequestError).retryable;
      } else if (status >= 500) {
        // Server-side error
        categorizedError = new ServerResponseError(
          error.message || 'Server error',
          status,
          statusText,
          data,
          { method, url }
        );
        shouldRetry = true;
        retryDelay = this.calculateRetryDelay(1);
      } else {
        // Other status codes
        categorizedError = new BaseError(
          error.message || 'Unexpected HTTP status',
          'unknown',
          'medium',
          `HTTP_${status}`
        ) as IBaseError;
      }
    } 
    // Request made but no response received
    else if (error.request) {
      logger.error('[ERROR] Connection error:', error.message);
      categorizedError = new ConnectionError(
        error.message || 'No response received',
        'unreachable'
      );
      shouldRetry = true;
      retryDelay = this.calculateRetryDelay(1);
    } 
    // Something else happened
    else {
      logger.error('[ERROR] Unknown error:', error.message);
      categorizedError = new BaseError(
        error.message || 'Unknown error',
        'unknown',
        'medium'
      ) as IBaseError;
    }

    return {
      originalError: error,
      categorizedError,
      shouldRetry,
      retryDelay,
      context: this.buildContext(),
    };
  }

  /**
   * Handle any error with comprehensive processing
   */
  handleError(error: Error | IBaseError, context?: Partial<ErrorContext>): ErrorHandlerResponse {
    const fullContext = { ...this.context, ...context };
    
    // Convert to our error types if needed
    let processedError: IBaseError;
    
    if (this.isBaseError(error)) {
      processedError = error;
    } else if (this.isAxiosError(error)) {
      const result = this.categorizeAxiosError(error);
      processedError = result.categorizedError;
    } else {
      processedError = new BaseError(
        error.message || 'Unknown error',
        'unknown',
        'medium'
      ) as IBaseError;
    }

    // Log the error
    if (this.config.logging.enabled) {
      this.logError(processedError, fullContext);
    }

    // Determine recovery strategy
    const recoveryStrategy = this.determineRecoveryStrategy(processedError);
    
    // Generate user message
    const userMessage = this.generateUserMessage(processedError);

    // Determine if should retry
    const shouldRetry = this.shouldRetryError(processedError);

    return {
      handled: true,
      error: processedError,
      userMessage,
      shouldRetry,
      recoveryStrategy,
      logId: this.generateLogId(processedError),
    };
  }

  /**
   * Calculate retry delay using backoff strategy
   */
  private calculateRetryDelay(attempt: number): number {
    const { backoffStrategy, baseDelay, maxDelay } = this.config.retry;
    
    let delay: number;
    if (backoffStrategy === 'exponential') {
      delay = baseDelay * Math.pow(2, attempt - 1);
    } else {
      delay = baseDelay * attempt;
    }
    
    return Math.min(delay, maxDelay);
  }

  /**
   * Build error context
   */
  private buildContext(): ErrorContext {
    return {
      timestamp: new Date(),
      environment: this.context.environment || 'development',
      userId: this.context.userId,
      sessionId: this.context.sessionId,
      requestId: this.context.requestId,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      ...this.context,
    } as ErrorContext;
  }

  /**
   * Log error with appropriate level
   */
  private logError(error: IBaseError, context: ErrorContext): void {
    const logData = {
      error: error.toJSON(),
      context,
    };

    switch (error.severity) {
      case 'critical':
        logger.error(`[CRITICAL] ${error.message}`, logData);
        break;
      case 'high':
        logger.error(`[HIGH] ${error.message}`, logData);
        break;
      case 'medium':
        logger.warn(`[MEDIUM] ${error.message}`, logData);
        break;
      case 'low':
        logger.info(`[LOW] ${error.message}`, logData);
        break;
    }
  }

  /**
   * Determine recovery strategy for error
   */
  private determineRecoveryStrategy(error: IBaseError): ErrorRecoveryStrategy {
    switch (error.category) {
      case 'authentication':
        return { type: 'redirect', params: { redirectUrl: '/auth/login' } };
      case 'authorization':
        return { type: 'redirect', params: { redirectUrl: '/403' } };
      case 'validation':
        return { type: 'ignore' };
      case 'network':
      case 'timeout':
      case 'server':
        return { 
          type: 'retry', 
          params: { 
            maxRetries: this.config.retry.maxAttempts,
            delay: this.config.retry.baseDelay
          }
        };
      default:
        return { type: 'fallback', params: { fallbackUrl: '/error' } };
    }
  }

  /**
   * Generate user-friendly message
   */
  private generateUserMessage(error: IBaseError): string {
    const { userNotification } = this.config;
    
    if (userNotification.customMessages[error.category]) {
      return userNotification.customMessages[error.category];
    }
    
    if (this.isBaseError(error) && error.getUserMessage) {
      return error.getUserMessage();
    }
    
    return userNotification.defaultMessage;
  }

  /**
   * Determine if error should be retried
   */
  private shouldRetryError(error: IBaseError): boolean {
    if (!this.config.retry.enabled) return false;
    
    // Check if error type supports retry
    if ('retryable' in error) {
      return (error as any).retryable;
    }
    
    // Default retry logic based on category
    const retryableCategories: ErrorCategory[] = ['network', 'timeout', 'server'];
    return retryableCategories.includes(error.category);
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(error: IBaseError): string {
    const timestamp = new Date().toISOString();
    const randomId = Math.random().toString(36).substring(2, 15);
    return `${error.category}_${timestamp}_${randomId}`;
  }

  /**
   * Type guards
   */
  private isAxiosError(error: any): error is AxiosError {
    return error && typeof error === 'object' && error.isAxiosError === true;
  }

  private isBaseError(error: any): error is IBaseError {
    return error && typeof error === 'object' && 'category' in error && 'severity' in error;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Update context
   */
  updateContext(context: Partial<ErrorContext>): void {
    this.context = { ...this.context, ...context };
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandlerClient();

// Export legacy function for backward compatibility
export function categorizeAxiosError(error: AxiosError): IBaseError {
  const result = errorHandler.categorizeAxiosError(error);
  return result.categorizedError;
}