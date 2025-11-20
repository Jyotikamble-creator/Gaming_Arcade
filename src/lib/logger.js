/**
 * Client-side logger: prints to console and (in development) POSTs messages to server /api/logs
 */
import axios from 'axios';

const logApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:4000'
});

export const clientLogger = {
  send: async (level, tag, message, context) => {
    try {
      // Browser console
      const msg = `[${tag}] ${message}`;
      if (level === 'debug') console.debug(msg, context);
      else if (level === 'info') console.info(msg, context);
      else if (level === 'warn') console.warn(msg, context);
      else console.error(msg, context);

      // Forward to server for terminal logging in development
      if (process.env.NODE_ENV === 'development') {
        try {
          await logApi.post('/api/logs', { level, tag, message, context });
        } catch {
          // ignore network errors when forwarding logs
        }
      }
    } catch {
      // ignore
    }
  },
  debug: (tag, message, context) => clientLogger.send('debug', tag, message, context),
  info: (tag, message, context) => clientLogger.send('info', tag, message, context),
  warn: (tag, message, context) => clientLogger.send('warn', tag, message, context),
  error: (tag, message, context) => clientLogger.send('error', tag, message, context),
};

export default clientLogger;

export const LogTags = {

  // Auth operations
  LOGIN: 'LOGIN',
  REGISTER: 'REGISTER',
  LOGOUT: 'LOGOUT',
  SESSIONS: 'SESSIONS',
  TOKEN_MANAGER: 'TOKEN_MANAGER',

  // Game operations
  WORD_GUESS: 'WORD_GUESS',
  MEMORY_CARD: 'MEMORY_CARD',
  MATH_QUIZ: 'MATH_QUIZ',
  TYPING_TEST: 'TYPING_TEST',
  WORD_SCRAMBLE: 'WORD_SCRAMBLE',
  QUIZ: 'QUIZ',
  EMOJI_GUESS: 'EMOJI_GUESS',
  WHACK_MOLE: 'WHACK_MOLE',
  SIMON_SAYS: 'SIMON_SAYS',
  TIC_TAC_TOE: 'TIC_TAC_TOE',
  GAME_2048: 'GAME_2048',

  // Score operations
  SAVE_SCORE: 'SAVE_SCORE',
  FETCH_SCORES: 'FETCH_SCORES',
  LEADERBOARD: 'LEADERBOARD',
  MY_SCORES: 'MY_SCORES',

  // Progress operations
  FETCH_PROGRESS: 'FETCH_PROGRESS',

  // API operations
  API_REQUEST: 'API_REQUEST',
  API_ERROR: 'API_ERROR',

  // General operations
  GAME_LOAD: 'GAME_LOAD',
  GAME_START: 'GAME_START',
  GAME_COMPLETE: 'GAME_COMPLETE',
  ERROR_HANDLING: 'ERROR_HANDLING',

};

export class Logger {
  #isDevelopment = process.env.NODE_ENV === 'development';

  #formatMessage(level, message, context) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  info(message, context) {
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', message, context));
    }
  }

  warn(message, context) {
    if (this.isDevelopment) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message, error, context) {
    const errorContext = error instanceof Error
      ? { ...context, error: error.message, stack: error.stack }
      : { ...context, error };

    console.error(this.formatMessage('error', message, errorContext));

    // In production, you might want to send errors to a monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error monitoring service (Sentry, etc.)
    }
  }

  debug(message, context) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  /**
   * Kotlin-style logging methods
   * Similar to Log.d(), Log.e(), Log.i(), Log.w() in Android
   */

  /**
   * Debug logging similar to Kotlin Log.d()
   * Only logs in development mode
   */
  static d(tag, message) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${tag}] ${message}`);
    }
  }

  /**
   * Error logging similar to Kotlin Log.e()
   */
  static e(tag, message) {
    console.error(`[${tag}] ${message}`);
  }

  /**
   * Info logging similar to Kotlin Log.i()
   */
  static i(tag, message) {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[${tag}] ${message}`);
    }
  }

  /**
   * Warning logging similar to Kotlin Log.w()
   */
  static w(tag, message) {
    console.warn(`[${tag}] ${message}`);
  }

  /**
   * Get stack trace string similar to Kotlin Log.getStackTraceString()
   */
  static getStackTraceString(error) {
    return error.stack || 'No stack trace available';
  }

  // Auth-specific logging methods
  auth = {
    otpSent: (phone) => this.info('OTP sent', { phone: this.maskPhone(phone) }),
    otpVerified: (phone) => this.info('OTP verified', { phone: this.maskPhone(phone) }),
    loginSuccess: (userId) => this.info('Login successful', { userId }),
    loginFailed: (reason) => this.warn('Login failed', { reason }),
  };

  // API-specific logging methods
  api = {
    request: (method, url, status) =>
      this.debug('API request', { method, url, status }),
    error: (method, url, status, error) =>
      this.error('API error', new Error(error), { method, url, status }),
  };

  #maskPhone(phone) {
    if (phone.length <= 4) return phone;
    const visibleStart = phone.slice(0, 3);
    const visibleEnd = phone.slice(-2);
    const masked = '*'.repeat(phone.length - 5);
    return `${visibleStart}${masked}${visibleEnd}`;
  }

  /**
   * Mask tokens for safe logging - show first 6 and last 6 chars with ellipsis
   */
  maskToken(token) {
    if (!token || typeof token !== 'string') return '';
    if (token.length <= 12) return token;
    return `${token.slice(0,6)}...${token.slice(-6)}`;
  }

  /**
   * Static mask helper so callers that import the Logger class can mask tokens safely
   */
  static maskToken(token) {
    return new Logger().maskToken(token);
  }
}

export const logger = new Logger();

/**
 * Error types to match Kotlin exception categories
 * Similar to ClientRequestException, ServerResponseException, etc.
 */
export class ClientRequestError extends Error {
  constructor(message, status, statusText, response) {
    super(message);
    this.name = 'ClientRequestError';
    this.status = status;
    this.statusText = statusText;
    this.response = response;
  }
}

export class ServerResponseError extends Error {
  constructor(message, status, statusText, response) {
    super(message);
    this.name = 'ServerResponseError';
    this.status = status;
    this.statusText = statusText;
    this.response = response;
  }
}

export class SerializationError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'SerializationError';
    this.originalError = originalError;
  }
}

export class ConnectionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConnectionError';
  }
}

export class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Categorize fetch errors similar to Kotlin exception handling
 */
export function categorizeError(error) {
  // Type guard for Error objects
  const isError = (err) => err instanceof Error;

  // Type guard for objects with HTTP status properties
  const hasStatus = (err) => {
    return typeof err === 'object' && err !== null && 'status' in err && typeof (err).status === 'number';
  };

  if (isError(error)) {
    // Network/Connection errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new ConnectionError('Check your Internet Connection');
    }

    // Timeout errors
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return new TimeoutError('TimeOut Retry');
    }

    // JSON parsing errors (similar to SerializationException)
    if (error.name === 'SyntaxError' || error.message.includes('JSON')) {
      return new SerializationError(`Error in parsing response: ${error.message}`, error);
    }
  }

  // HTTP status errors
  if (hasStatus(error)) {
    if (error.status >= 400 && error.status < 500) {
      return new ClientRequestError(`Client error: ${error.message || 'Client Error'}`, error.status, error.statusText || 'Unknown', error.response);
    }
    if (error.status >= 500) {
      return new ServerResponseError('Error from Server Side', error.status, error.statusText || 'Unknown', error.response);
    }
  }

  // Generic error
  return new Error('Unexpected Error');
}