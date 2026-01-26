// Enhanced logger client for Next.js with TypeScript

import axios, { AxiosInstance } from 'axios';
import type {
  ILogger,
  IClientLogger,
  IAuthLogger,
  IApiLogger,
  IGameLogger,
  IPerformanceLogger,
  LogLevel,
  LoggerConfig,
  ILogEntry,
  LogBuffer,
  LogContext,
  Environment,
  LogMetadata
} from "@/types/logger/logger";
import { 
  ClientRequestError, 
  ServerResponseError, 
  ConnectionError, 
  TimeoutError, 
  SerializationError 
} from "@/lib/errors/client";

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  level: 'info',
  enabled: true,
  environment: (process.env.NODE_ENV as Environment) || 'development',
  destinations: ['console'],
  console: {
    enabled: true,
    colors: process.env.NODE_ENV === 'development',
    timestamps: true,
    level: 'debug'
  },
  server: {
    enabled: process.env.NODE_ENV === 'development',
    endpoint: '/api/logs',
    batchSize: 10,
    flushInterval: 5000,
    retryAttempts: 3,
    timeout: 10000
  },
  filters: {
    maxMessageLength: 1000
  },
  performance: {
    enableMetrics: true,
    maxBufferSize: 1000,
    maxRetentionDays: 7,
    enableSampling: false,
    samplingRate: 1.0
  },
  privacy: {
    maskSensitiveData: true,
    sensitiveFields: ['password', 'token', 'apiKey', 'secret', 'credential'],
    maskPatterns: [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // emails
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // credit cards
      /\b\d{3}-\d{2}-\d{4}\b/g // SSNs
    ],
    enableRedaction: true
  },
  external: {}
};

/**
 * Log buffer implementation
 */
class LogBufferImpl implements LogBuffer {
  public entries: ILogEntry[] = [];
  public lastFlush: Date = new Date();

  constructor(
    public maxSize: number = 100,
    public flushInterval: number = 5000
  ) {}

  add(entry: ILogEntry): void {
    this.entries.push(entry);
  }

  async flush(): Promise<ILogEntry[]> {
    const toFlush = [...this.entries];
    this.entries = [];
    this.lastFlush = new Date();
    return toFlush;
  }

  clear(): void {
    this.entries = [];
  }

  isFull(): boolean {
    return this.entries.length >= this.maxSize;
  }

  shouldFlush(): boolean {
    const timeSinceLastFlush = Date.now() - this.lastFlush.getTime();
    return this.isFull() || timeSinceLastFlush >= this.flushInterval;
  }
}

/**
 * Enhanced Client Logger
 */
export class ClientLogger implements IClientLogger {
  private logApi: AxiosInstance;
  private buffer: LogBufferImpl;
  private flushTimer?: NodeJS.Timeout;
  private config: LoggerConfig;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    this.logApi = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
      timeout: this.config.server.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.server.headers
      }
    });

    this.buffer = new LogBufferImpl(
      this.config.server.batchSize,
      this.config.server.flushInterval
    );

    this.setupPeriodicFlush();
  }

  /**
   * Send log entry to destinations
   */
  async send(
    level: LogLevel, 
    tag: string, 
    message: string, 
    context?: Record<string, any>
  ): Promise<void> {
    try {
      if (!this.config.enabled || !this.isLevelEnabled(level)) {
        return;
      }

      // Create log entry
      const entry = this.createLogEntry(level, message, tag, context);
      
      // Apply filters
      if (!this.shouldLog(entry)) {
        return;
      }

      // Console logging
      if (this.config.console.enabled && this.config.destinations.includes('console')) {
        this.logToConsole(entry);
      }

      // Server logging
      if (this.config.server.enabled && this.config.destinations.includes('server')) {
        this.buffer.add(entry);
        
        if (this.buffer.shouldFlush()) {
          await this.flushToServer();
        }
      }
    } catch (error) {
      // Prevent logging errors from breaking the application
      if (this.config.environment === 'development') {
        console.error('[Logger Error]', error);
      }
    }
  }

  /**
   * Debug logging
   */
  async debug(tag: string, message: string, context?: Record<string, any>): Promise<void> {
    return this.send('debug', tag, message, context);
  }

  /**
   * Info logging
   */
  async info(tag: string, message: string, context?: Record<string, any>): Promise<void> {
    return this.send('info', tag, message, context);
  }

  /**
   * Warning logging
   */
  async warn(tag: string, message: string, context?: Record<string, any>): Promise<void> {
    return this.send('warn', tag, message, context);
  }

  /**
   * Error logging
   */
  async error(tag: string, message: string, context?: Record<string, any>): Promise<void> {
    return this.send('error', tag, message, context);
  }

  /**
   * Critical logging
   */
  async critical(tag: string, message: string, context?: Record<string, any>): Promise<void> {
    return this.send('critical', tag, message, context);
  }

  /**
   * Create structured log entry
   */
  private createLogEntry(
    level: LogLevel, 
    message: string, 
    tag?: string, 
    context?: Record<string, any>
  ): ILogEntry {
    const maskedContext = this.maskSensitiveData(context);
    const truncatedMessage = this.truncateMessage(message);

    return {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      message: truncatedMessage,
      tag,
      context: maskedContext,
      source: 'client',
      environment: this.config.environment,
      metadata: this.gatherMetadata()
    };
  }

  /**
   * Log to console with formatting
   */
  private logToConsole(entry: ILogEntry): void {
    const prefix = entry.tag ? `[${entry.tag}]` : '';
    const timestamp = this.config.console.timestamps 
      ? `[${entry.timestamp.toISOString()}]` 
      : '';
    
    const message = `${timestamp} ${prefix} ${entry.message}`;
    const data = entry.context || {};

    switch (entry.level) {
      case 'debug':
        console.debug(message, data);
        break;
      case 'info':
        console.info(message, data);
        break;
      case 'warn':
        console.warn(message, data);
        break;
      case 'error':
      case 'critical':
        console.error(message, data);
        break;
    }
  }

  /**
   * Flush logs to server
   */
  private async flushToServer(): Promise<void> {
    try {
      const entries = await this.buffer.flush();
      
      if (entries.length === 0) {
        return;
      }

      await this.logApi.post(this.config.server.endpoint, { logs: entries });
    } catch (error) {
      // Restore entries to buffer if send failed
      if (error instanceof Error) {
        this.handleServerLogError(error);
      }
    }
  }

  /**
   * Handle server logging errors
   */
  private handleServerLogError(error: Error): void {
    // Only log to console in development to avoid infinite loops
    if (this.config.environment === 'development') {
      console.warn('[Logger] Failed to send logs to server:', error.message);
    }
    
    // Could implement retry logic here
  }

  /**
   * Setup periodic flush timer
   */
  private setupPeriodicFlush(): void {
    if (this.config.server.enabled) {
      this.flushTimer = setInterval(() => {
        if (this.buffer.entries.length > 0) {
          this.flushToServer();
        }
      }, this.config.server.flushInterval);
    }
  }

  /**
   * Check if log level is enabled
   */
  private isLevelEnabled(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      critical: 4
    };

    return levels[level] >= levels[this.config.level];
  }

  /**
   * Check if entry should be logged based on filters
   */
  private shouldLog(entry: ILogEntry): boolean {
    const { filters } = this.config;

    // Tag filters
    if (entry.tag) {
      if (filters.excludeTags?.includes(entry.tag)) {
        return false;
      }
      if (filters.includeTags && !filters.includeTags.includes(entry.tag)) {
        return false;
      }
    }

    // Pattern filters
    if (filters.excludePatterns?.some(pattern => pattern.test(entry.message))) {
      return false;
    }
    if (filters.includePatterns && !filters.includePatterns.some(pattern => pattern.test(entry.message))) {
      return false;
    }

    // Sampling
    if (this.config.performance.enableSampling) {
      return Math.random() <= this.config.performance.samplingRate;
    }

    return true;
  }

  /**
   * Mask sensitive data in context
   */
  private maskSensitiveData(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context || !this.config.privacy.maskSensitiveData) {
      return context;
    }

    const masked = { ...context };
    const { sensitiveFields, maskPatterns } = this.config.privacy;

    // Mask sensitive fields
    for (const field of sensitiveFields) {
      if (field in masked) {
        masked[field] = this.maskValue(masked[field]);
      }
    }

    // Apply pattern masking to string values
    for (const [key, value] of Object.entries(masked)) {
      if (typeof value === 'string') {
        for (const pattern of maskPatterns) {
          masked[key] = value.replace(pattern, '[REDACTED]');
        }
      }
    }

    return masked;
  }

  /**
   * Mask a sensitive value
   */
  private maskValue(value: any): string {
    if (typeof value !== 'string') {
      return '[REDACTED]';
    }
    
    if (value.length <= 4) {
      return '*'.repeat(value.length);
    }
    
    return `${value.slice(0, 2)}${'*'.repeat(value.length - 4)}${value.slice(-2)}`;
  }

  /**
   * Truncate message if too long
   */
  private truncateMessage(message: string): string {
    const maxLength = this.config.filters.maxMessageLength;
    if (!maxLength || message.length <= maxLength) {
      return message;
    }
    
    return `${message.slice(0, maxLength - 3)}...`;
  }

  /**
   * Gather runtime metadata
   */
  private gatherMetadata(): LogMetadata {
    const metadata: LogMetadata = {};

    if (typeof window !== 'undefined') {
      metadata.userAgent = window.navigator.userAgent;
      metadata.url = window.location.href;
      metadata.referrer = document.referrer;

      // Memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        metadata.memoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
        };
      }

      // Performance marks
      if (performance.getEntriesByType) {
        metadata.performanceMarks = performance.getEntriesByType('mark').slice(-5);
      }
    }

    return metadata;
  }

  /**
   * Generate unique log ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    // Flush any remaining logs
    if (this.buffer.entries.length > 0) {
      this.flushToServer();
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Main Logger Class
 */
export class Logger implements ILogger {
  private clientLogger: ClientLogger;
  private globalContext: Record<string, any> = {};
  private isDevelopment: boolean;
  private config: LoggerConfig;

  // Specialized loggers
  public readonly auth: IAuthLogger;
  public readonly api: IApiLogger;
  public readonly game: IGameLogger;
  public readonly performance: IPerformanceLogger;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.isDevelopment = this.config.environment === 'development';
    this.clientLogger = new ClientLogger(this.config);

    // Initialize specialized loggers
    this.auth = new AuthLogger(this);
    this.api = new ApiLogger(this);
    this.game = new GameLogger(this);
    this.performance = new PerformanceLogger(this);
  }

  /**
   * Debug logging
   */
  debug(message: string, context?: Record<string, any>, tag?: string): void {
    if (this.isDevelopment) {
      this.log('debug', message, context, tag);
    }
  }

  /**
   * Info logging
   */
  info(message: string, context?: Record<string, any>, tag?: string): void {
    this.log('info', message, context, tag);
  }

  /**
   * Warning logging
   */
  warn(message: string, context?: Record<string, any>, tag?: string): void {
    this.log('warn', message, context, tag);
  }

  /**
   * Error logging
   */
  error(message: string, error?: Error | string, context?: Record<string, any>, tag?: string): void {
    const errorContext = this.processError(error, context);
    this.log('error', message, errorContext, tag);
  }

  /**
   * Critical logging
   */
  critical(message: string, error?: Error | string, context?: Record<string, any>, tag?: string): void {
    const errorContext = this.processError(error, context);
    this.log('critical', message, errorContext, tag);
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>, tag?: string): void {
    const fullContext = { ...this.globalContext, ...context };
    const logTag = tag || 'GENERAL';
    
    // Use void to handle the promise without awaiting
    void this.clientLogger.send(level, logTag, message, fullContext);
  }

  /**
   * Process error object for logging
   */
  private processError(error?: Error | string, context?: Record<string, any>): Record<string, any> {
    const errorContext = { ...context };

    if (error instanceof Error) {
      errorContext.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };

      // Add specific error properties
      if (error instanceof ClientRequestError || error instanceof ServerResponseError) {
        errorContext.error.status = error.status;
        errorContext.error.statusText = error.statusText;
      }
    } else if (typeof error === 'string') {
      errorContext.error = { message: error };
    }

    return errorContext;
  }

  /**
   * Set logging level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
    this.clientLogger.updateConfig({ level });
  }

  /**
   * Get current logging level
   */
  getLevel(): LogLevel {
    return this.config.level;
  }

  /**
   * Check if level is enabled
   */
  isLevelEnabled(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0, info: 1, warn: 2, error: 3, critical: 4
    };
    return levels[level] >= levels[this.config.level];
  }

  /**
   * Add global context
   */
  addContext(context: Record<string, any>): void {
    this.globalContext = { ...this.globalContext, ...context };
  }

  /**
   * Clear global context
   */
  clearContext(): void {
    this.globalContext = {};
  }

  /**
   * Flush all pending logs
   */
  async flush(): Promise<void> {
    // Implementation would flush all pending logs
    return Promise.resolve();
  }

  /**
   * Static methods for backward compatibility
   */
  static d(tag: string, message: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${tag}] ${message}`);
    }
  }

  static i(tag: string, message: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[${tag}] ${message}`);
    }
  }

  static w(tag: string, message: string): void {
    console.warn(`[${tag}] ${message}`);
  }

  static e(tag: string, message: string): void {
    console.error(`[${tag}] ${message}`);
  }

  static getStackTraceString(error: Error): string {
    return error.stack || 'No stack trace available';
  }

  /**
   * Token masking utility
   */
  maskToken(token: string): string {
    if (!token || typeof token !== 'string') return '';
    if (token.length <= 12) return token;
    return `${token.slice(0, 6)}...${token.slice(-6)}`;
  }

  static maskToken(token: string): string {
    return new Logger().maskToken(token);
  }
}

/**
 * Authentication Logger Implementation
 */
class AuthLogger implements IAuthLogger {
  constructor(private logger: Logger) {}

  loginAttempt(email: string, context?: Record<string, any>): void {
    this.logger.info('Login attempt', { email: this.maskEmail(email), ...context }, 'LOGIN');
  }

  loginSuccess(userId: string, context?: Record<string, any>): void {
    this.logger.info('Login successful', { userId, ...context }, 'LOGIN');
  }

  loginFailure(email: string, reason: string, context?: Record<string, any>): void {
    this.logger.warn('Login failed', { email: this.maskEmail(email), reason, ...context }, 'LOGIN');
  }

  logout(userId: string, context?: Record<string, any>): void {
    this.logger.info('User logout', { userId, ...context }, 'LOGOUT');
  }

  signupAttempt(email: string, context?: Record<string, any>): void {
    this.logger.info('Signup attempt', { email: this.maskEmail(email), ...context }, 'REGISTER');
  }

  signupSuccess(userId: string, context?: Record<string, any>): void {
    this.logger.info('Signup successful', { userId, ...context }, 'REGISTER');
  }

  signupFailure(email: string, reason: string, context?: Record<string, any>): void {
    this.logger.warn('Signup failed', { email: this.maskEmail(email), reason, ...context }, 'REGISTER');
  }

  tokenRefresh(userId: string, success: boolean, context?: Record<string, any>): void {
    const level = success ? 'info' : 'warn';
    const message = success ? 'Token refreshed' : 'Token refresh failed';
    this.logger[level](message, { userId, ...context }, 'TOKEN_REFRESH');
  }

  passwordReset(email: string, context?: Record<string, any>): void {
    this.logger.info('Password reset requested', { email: this.maskEmail(email), ...context }, 'PASSWORD_RESET');
  }

  accountLocked(userId: string, reason: string, context?: Record<string, any>): void {
    this.logger.warn('Account locked', { userId, reason, ...context }, 'ACCOUNT_LOCKED');
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (local.length <= 2) return email;
    return `${local.slice(0, 2)}***@${domain}`;
  }
}

/**
 * API Logger Implementation
 */
class ApiLogger implements IApiLogger {
  constructor(private logger: Logger) {}

  request(method: string, url: string, duration?: number, context?: Record<string, any>): void {
    this.logger.debug('API request', { method, url, duration, ...context }, 'API_REQUEST');
  }

  response(method: string, url: string, status: number, duration: number, context?: Record<string, any>): void {
    const level = status >= 400 ? 'warn' : 'debug';
    this.logger[level]('API response', { method, url, status, duration, ...context }, 'API_RESPONSE');
  }

  error(method: string, url: string, error: Error | string, context?: Record<string, any>): void {
    this.logger.error('API error', error, { method, url, ...context }, 'API_ERROR');
  }

  rateLimitHit(endpoint: string, userId?: string, context?: Record<string, any>): void {
    this.logger.warn('Rate limit hit', { endpoint, userId, ...context }, 'API_RATE_LIMIT');
  }

  slowQuery(query: string, duration: number, context?: Record<string, any>): void {
    this.logger.warn('Slow query', { query, duration, ...context }, 'API_SLOW_QUERY');
  }
}

/**
 * Game Logger Implementation
 */
class GameLogger implements IGameLogger {
  constructor(private logger: Logger) {}

  gameStart(gameType: string, userId?: string, context?: Record<string, any>): void {
    this.logger.info('Game started', { gameType, userId, ...context }, 'GAME_START');
  }

  gameComplete(gameType: string, score: number, duration: number, userId?: string, context?: Record<string, any>): void {
    this.logger.info('Game completed', { gameType, score, duration, userId, ...context }, 'GAME_COMPLETE');
  }

  gameAbandoned(gameType: string, reason: string, userId?: string, context?: Record<string, any>): void {
    this.logger.info('Game abandoned', { gameType, reason, userId, ...context }, 'GAME_ABANDONED');
  }

  scoreSaved(gameType: string, score: number, userId?: string, context?: Record<string, any>): void {
    this.logger.info('Score saved', { gameType, score, userId, ...context }, 'SCORE_SAVED');
  }

  achievementUnlocked(achievement: string, userId?: string, context?: Record<string, any>): void {
    this.logger.info('Achievement unlocked', { achievement, userId, ...context }, 'ACHIEVEMENT');
  }

  levelUp(newLevel: number, userId?: string, context?: Record<string, any>): void {
    this.logger.info('Level up', { newLevel, userId, ...context }, 'LEVEL_UP');
  }

  powerUpUsed(powerUp: string, gameType: string, userId?: string, context?: Record<string, any>): void {
    this.logger.info('Power-up used', { powerUp, gameType, userId, ...context }, 'POWER_UP');
  }
}

/**
 * Performance Logger Implementation
 */
class PerformanceLogger implements IPerformanceLogger {
  constructor(private logger: Logger) {}

  pageLoad(page: string, duration: number, context?: Record<string, any>): void {
    this.logger.info('Page loaded', { page, duration, ...context }, 'PAGE_LOAD');
  }

  apiCall(endpoint: string, method: string, duration: number, context?: Record<string, any>): void {
    this.logger.debug('API call performance', { endpoint, method, duration, ...context }, 'API_PERFORMANCE');
  }

  componentRender(component: string, duration: number, context?: Record<string, any>): void {
    this.logger.debug('Component render', { component, duration, ...context }, 'COMPONENT_RENDER');
  }

  memoryUsage(used: number, total: number, context?: Record<string, any>): void {
    const percentage = (used / total) * 100;
    this.logger.debug('Memory usage', { used, total, percentage, ...context }, 'MEMORY_USAGE');
  }

  frameRate(fps: number, context?: Record<string, any>): void {
    this.logger.debug('Frame rate', { fps, ...context }, 'FRAME_RATE');
  }

  bundleSize(bundle: string, size: number, context?: Record<string, any>): void {
    this.logger.info('Bundle size', { bundle, size, ...context }, 'BUNDLE_SIZE');
  }
}

// Export singleton instances for backward compatibility
export const clientLogger = new ClientLogger();
export const logger = new Logger();

// Export default
export default clientLogger;