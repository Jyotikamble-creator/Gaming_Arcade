// Type definitions for API client and responses

import type { GameType } from "@/types/progress";

/**
 * Base API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  status?: number;
  details?: any;
}

/**
 * Score submission data
 */
export interface ScoreSubmission {
  game: GameType;
  player?: string;
  score: number;
  meta?: Record<string, any>;
}

/**
 * Leaderboard query parameters
 */
export interface LeaderboardParams {
  game: GameType;
  limit?: number;
}

/**
 * Game API endpoints mapping
 */
export interface GameApiEndpoints {
  word: {
    random: string;
    search: string;
    create: string;
    analytics: string;
  };
  memory: {
    start: string;
    session: string;
  };
  math: {
    questions: string;
    session: string;
  };
  typing: {
    passage: string;
    session: string;
  };
  wordScramble: {
    words: string;
    start: string;
  };
  quiz: {
    questions: string;
    session: string;
  };
  emoji: {
    start: string;
    session: string;
  };
  whackMole: {
    start: string;
    hit: string;
  };
  simon: {
    start: string;
    session: string;
  };
  common: {
    score: string;
    leaderboard: string;
  };
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Request interceptor function type
 */
export type RequestInterceptor = (config: any) => any;

/**
 * Response interceptor function type
 */
export type ResponseInterceptor = (response: any) => any;

/**
 * Error interceptor function type
 */
export type ErrorInterceptor = (error: any) => any;