// API configuration and endpoint definitions

import type { GameApiEndpoints } from "@/types/api/client";

/**
 * API base configuration
 */
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE || '/api',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  cacheEnabled: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
} as const;

/**
 * API endpoint definitions
 */
export const API_ENDPOINTS: GameApiEndpoints = {
  word: {
    random: '/word',
    search: '/word/search',
    create: '/word/create',
    analytics: '/word/analytics',
  },
  memory: {
    start: '/memory/start',
    session: '/memory/session',
  },
  math: {
    questions: '/math/questions',
    session: '/math/session',
  },
  typing: {
    passage: '/typing/passage',
    session: '/typing/session',
  },
  wordScramble: {
    words: '/word-scramble/words',
    start: '/word-scramble/start',
  },
  quiz: {
    questions: '/quiz/questions',
    session: '/quiz/session',
  },
  emoji: {
    start: '/emoji/start',
    session: '/emoji/session',
  },
  whackMole: {
    start: '/whack-a-mole/start',
    hit: '/whack-a-mole/hit',
  },
  simon: {
    start: '/simon/start',
    session: '/simon/session',
  },
  common: {
    score: '/common/score',
    leaderboard: '/common/leaderboard',
  },
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * API error messages
 */
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  NOT_FOUND: 'Requested resource not found.',
  UNAUTHORIZED: 'Authentication required. Please log in.',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  VALIDATION_ERROR: 'Invalid request data.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
} as const;

/**
 * Request headers
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;

/**
 * Environment-specific configuration
 */
export const ENV_CONFIG = {
  development: {
    logLevel: 'debug',
    enableMocking: true,
    enableCache: true,
  },
  production: {
    logLevel: 'error',
    enableMocking: false,
    enableCache: true,
  },
  test: {
    logLevel: 'silent',
    enableMocking: true,
    enableCache: false,
  },
} as const;

/**
 * Get current environment configuration
 */
export function getCurrentEnvConfig() {
  const env = process.env.NODE_ENV as keyof typeof ENV_CONFIG;
  return ENV_CONFIG[env] || ENV_CONFIG.development;
}

/**
 * API rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
  requests: 100,
  windowMs: 60 * 1000, // 1 minute
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
} as const;

/**
 * Cache configuration for different endpoints
 */
export const CACHE_CONFIG = {
  word: { ttl: 10 * 60 * 1000 }, // 10 minutes
  leaderboard: { ttl: 2 * 60 * 1000 }, // 2 minutes
  userProfile: { ttl: 5 * 60 * 1000 }, // 5 minutes
  gameSession: { ttl: 0 }, // No cache
  scores: { ttl: 1 * 60 * 1000 }, // 1 minute
} as const;