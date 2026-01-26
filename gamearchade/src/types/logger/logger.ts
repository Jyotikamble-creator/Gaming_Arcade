// Logger type definitions and interfaces

/**
 * Log levels supported by the logger
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

/**
 * Log output destinations
 */
export type LogDestination = 'console' | 'server' | 'file' | 'external';

/**
 * Log transport types
 */
export type LogTransport = 'http' | 'websocket' | 'local' | 'memory';

/**
 * Environment types
 */
export type Environment = 'development' | 'staging' | 'production' | 'test';

/**
 * Base log entry interface
 */
export interface ILogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  tag?: string;
  context?: Record<string, any>;
  source?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  environment: Environment;
  metadata?: LogMetadata;
}

/**
 * Log metadata for enhanced tracking
 */
export interface LogMetadata {
  userAgent?: string;
  url?: string;
  referrer?: string;
  stackTrace?: string;
  errorCode?: string;
  duration?: number; // milliseconds
  performanceMarks?: PerformanceEntry[];
  memoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
}

/**
 * Logger configuration interface
 */
export interface LoggerConfig {
  // Basic configuration
  level: LogLevel;
  enabled: boolean;
  environment: Environment;
  
  // Output configuration
  destinations: LogDestination[];
  console: {
    enabled: boolean;
    colors: boolean;
    timestamps: boolean;
    level: LogLevel;
  };
  
  // Server logging configuration
  server: {
    enabled: boolean;
    endpoint: string;
    batchSize: number;
    flushInterval: number; // milliseconds
    retryAttempts: number;
    timeout: number;
    headers?: Record<string, string>;
  };
  
  // Filtering and sampling
  filters: {
    excludeTags?: string[];
    includeTags?: string[];
    excludePatterns?: RegExp[];
    includePatterns?: RegExp[];
    maxMessageLength?: number;
  };
  
  // Performance and storage
  performance: {
    enableMetrics: boolean;
    maxBufferSize: number;
    maxRetentionDays: number;
    enableSampling: boolean;
    samplingRate: number; // 0-1
  };
  
  // Privacy and security
  privacy: {
    maskSensitiveData: boolean;
    sensitiveFields: string[];
    maskPatterns: RegExp[];
    enableRedaction: boolean;
  };
  
  // External integrations
  external: {
    sentry?: {
      enabled: boolean;
      dsn: string;
      environment: string;
    };
    datadog?: {
      enabled: boolean;
      apiKey: string;
      service: string;
    };
    customWebhooks?: Array<{
      name: string;
      url: string;
      headers?: Record<string, string>;
      levels: LogLevel[];
    }>;
  };
}

/**
 * Client logger interface
 */
export interface IClientLogger {
  send(level: LogLevel, tag: string, message: string, context?: Record<string, any>): Promise<void>;
  debug(tag: string, message: string, context?: Record<string, any>): Promise<void>;
  info(tag: string, message: string, context?: Record<string, any>): Promise<void>;
  warn(tag: string, message: string, context?: Record<string, any>): Promise<void>;
  error(tag: string, message: string, context?: Record<string, any>): Promise<void>;
  critical(tag: string, message: string, context?: Record<string, any>): Promise<void>;
}

/**
 * Logger interface
 */
export interface ILogger {
  // Basic logging methods
  debug(message: string, context?: Record<string, any>, tag?: string): void;
  info(message: string, context?: Record<string, any>, tag?: string): void;
  warn(message: string, context?: Record<string, any>, tag?: string): void;
  error(message: string, error?: Error | string, context?: Record<string, any>, tag?: string): void;
  critical(message: string, error?: Error | string, context?: Record<string, any>, tag?: string): void;
  
  // Utility methods
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
  isLevelEnabled(level: LogLevel): boolean;
  addContext(context: Record<string, any>): void;
  clearContext(): void;
  flush(): Promise<void>;
  
  // Specialized logging
  auth: IAuthLogger;
  api: IApiLogger;
  game: IGameLogger;
  performance: IPerformanceLogger;
}

/**
 * Authentication logger interface
 */
export interface IAuthLogger {
  loginAttempt(email: string, context?: Record<string, any>): void;
  loginSuccess(userId: string, context?: Record<string, any>): void;
  loginFailure(email: string, reason: string, context?: Record<string, any>): void;
  logout(userId: string, context?: Record<string, any>): void;
  signupAttempt(email: string, context?: Record<string, any>): void;
  signupSuccess(userId: string, context?: Record<string, any>): void;
  signupFailure(email: string, reason: string, context?: Record<string, any>): void;
  tokenRefresh(userId: string, success: boolean, context?: Record<string, any>): void;
  passwordReset(email: string, context?: Record<string, any>): void;
  accountLocked(userId: string, reason: string, context?: Record<string, any>): void;
}

/**
 * API logger interface
 */
export interface IApiLogger {
  request(method: string, url: string, duration?: number, context?: Record<string, any>): void;
  response(method: string, url: string, status: number, duration: number, context?: Record<string, any>): void;
  error(method: string, url: string, error: Error | string, context?: Record<string, any>): void;
  rateLimitHit(endpoint: string, userId?: string, context?: Record<string, any>): void;
  slowQuery(query: string, duration: number, context?: Record<string, any>): void;
}

/**
 * Game logger interface
 */
export interface IGameLogger {
  gameStart(gameType: string, userId?: string, context?: Record<string, any>): void;
  gameComplete(gameType: string, score: number, duration: number, userId?: string, context?: Record<string, any>): void;
  gameAbandoned(gameType: string, reason: string, userId?: string, context?: Record<string, any>): void;
  scoreSaved(gameType: string, score: number, userId?: string, context?: Record<string, any>): void;
  achievementUnlocked(achievement: string, userId?: string, context?: Record<string, any>): void;
  levelUp(newLevel: number, userId?: string, context?: Record<string, any>): void;
  powerUpUsed(powerUp: string, gameType: string, userId?: string, context?: Record<string, any>): void;
}

/**
 * Performance logger interface
 */
export interface IPerformanceLogger {
  pageLoad(page: string, duration: number, context?: Record<string, any>): void;
  apiCall(endpoint: string, method: string, duration: number, context?: Record<string, any>): void;
  componentRender(component: string, duration: number, context?: Record<string, any>): void;
  memoryUsage(used: number, total: number, context?: Record<string, any>): void;
  frameRate(fps: number, context?: Record<string, any>): void;
  bundleSize(bundle: string, size: number, context?: Record<string, any>): void;
}

/**
 * Log tags organized by category
 */
export interface ILogTags {
  // Authentication operations
  readonly AUTH: {
    readonly LOGIN: string;
    readonly REGISTER: string;
    readonly LOGOUT: string;
    readonly TOKEN_REFRESH: string;
    readonly PASSWORD_RESET: string;
    readonly SIGNUP: string;
    readonly MFA: string;
    readonly SESSION: string;
  };
  
  // Game operations
  readonly GAMES: {
    readonly WORD_GUESS: string;
    readonly WORD_SCRAMBLE: string;
    readonly WORD_BUILDER: string;
    readonly HANGMAN: string;
    readonly MEMORY_CARD: string;
    readonly MATH_QUIZ: string;
    readonly TYPING_TEST: string;
    readonly QUIZ: string;
    readonly EMOJI_GUESS: string;
    readonly WHACK_MOLE: string;
    readonly SIMON_SAYS: string;
    readonly TIC_TAC_TOE: string;
    readonly GAME_2048: string;
    readonly REACTION_TIME: string;
    readonly SLIDING_PUZZLE: string;
    readonly SUDOKU: string;
    readonly TOWER_STACKER: string;
    readonly SPEED_MATH: string;
    readonly BRAIN_TEASER: string;
    readonly CODING_PUZZLE: string;
    readonly NUMBER_MAZE: string;
    readonly MUSIC_TILES: string;
    readonly PIXEL_ART_CREATOR: string;
  };
  
  // Score operations
  readonly SCORES: {
    readonly SAVE: string;
    readonly FETCH: string;
    readonly LEADERBOARD: string;
    readonly MY_SCORES: string;
    readonly ANALYTICS: string;
  };
  
  // Progress operations
  readonly PROGRESS: {
    readonly FETCH: string;
    readonly UPDATE: string;
    readonly ACHIEVEMENTS: string;
    readonly ANALYTICS: string;
  };
  
  // API operations
  readonly API: {
    readonly REQUEST: string;
    readonly RESPONSE: string;
    readonly ERROR: string;
    readonly TIMEOUT: string;
    readonly RETRY: string;
  };
  
  // System operations
  readonly SYSTEM: {
    readonly STARTUP: string;
    readonly SHUTDOWN: string;
    readonly ERROR_HANDLING: string;
    readonly PERFORMANCE: string;
    readonly MEMORY: string;
    readonly CACHE: string;
  };
  
  // UI operations
  readonly UI: {
    readonly NAVIGATION: string;
    readonly COMPONENT_MOUNT: string;
    readonly COMPONENT_UNMOUNT: string;
    readonly USER_ACTION: string;
    readonly ANIMATION: string;
  };
}

/**
 * Log buffer for batching
 */
export interface LogBuffer {
  entries: ILogEntry[];
  maxSize: number;
  flushInterval: number;
  lastFlush: Date;
  add(entry: ILogEntry): void;
  flush(): Promise<ILogEntry[]>;
  clear(): void;
  isFull(): boolean;
  shouldFlush(): boolean;
}

/**
 * Log transport interface
 */
export interface ILogTransport {
  name: string;
  type: LogTransport;
  enabled: boolean;
  send(entries: ILogEntry[]): Promise<void>;
  configure(config: Record<string, any>): void;
  isHealthy(): boolean;
}

/**
 * Log formatter interface
 */
export interface ILogFormatter {
  format(entry: ILogEntry): string;
  formatBatch(entries: ILogEntry[]): string;
  setTemplate(template: string): void;
}

/**
 * Log filter interface
 */
export interface ILogFilter {
  shouldLog(entry: ILogEntry): boolean;
  addRule(rule: (entry: ILogEntry) => boolean): void;
  removeRule(rule: (entry: ILogEntry) => boolean): void;
  clearRules(): void;
}

/**
 * Log analytics interface
 */
export interface LogAnalytics {
  totalLogs: number;
  logsByLevel: Record<LogLevel, number>;
  logsByTag: Record<string, number>;
  errorRate: number;
  averageResponseTime: number;
  topErrors: Array<{
    message: string;
    count: number;
    lastOccurred: Date;
  }>;
  logTrends: Array<{
    date: Date;
    count: number;
    level: LogLevel;
  }>;
}

/**
 * Log search criteria
 */
export interface LogSearchCriteria {
  levels?: LogLevel[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  messagePattern?: string | RegExp;
  userId?: string;
  sessionId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Structured logging context
 */
export interface LogContext {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
  session?: {
    id: string;
    startTime: Date;
    userAgent?: string;
  };
  request?: {
    id: string;
    method: string;
    url: string;
    headers?: Record<string, string>;
  };
  game?: {
    type: string;
    level?: number;
    score?: number;
    duration?: number;
  };
  performance?: {
    startTime: number;
    endTime?: number;
    memory?: number;
    cpu?: number;
  };
  custom?: Record<string, any>;
}

/**
 * Log event interface for real-time monitoring
 */
export interface LogEvent {
  type: 'log' | 'error' | 'performance' | 'user_action';
  entry: ILogEntry;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
}

/**
 * Logger middleware interface
 */
export interface ILoggerMiddleware {
  name: string;
  priority: number;
  beforeLog?(entry: ILogEntry): ILogEntry | null;
  afterLog?(entry: ILogEntry): void;
  onError?(error: Error, entry: ILogEntry): void;
}