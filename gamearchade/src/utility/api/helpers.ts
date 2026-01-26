// Utility functions for API operations

import type { 
  ApiResponse, 
  ApiErrorResponse,
  ScoreSubmission,
  LeaderboardParams
} from "@/types/api/client";
import type { GameType } from "@/types/progress";

/**
 * Validate score submission data
 */
export function validateScoreSubmission(data: Partial<ScoreSubmission>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.game) {
    errors.push("Game type is required");
  }

  if (typeof data.score !== "number" || data.score < 0) {
    errors.push("Score must be a non-negative number");
  }

  if (data.player && typeof data.player !== "string") {
    errors.push("Player name must be a string");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate leaderboard parameters
 */
export function validateLeaderboardParams(params: Partial<LeaderboardParams>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!params.game) {
    errors.push("Game type is required");
  }

  if (params.limit && (typeof params.limit !== "number" || params.limit <= 0)) {
    errors.push("Limit must be a positive number");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Format API response for consistent structure
 */
export function formatApiResponse<T>(
  data: T, 
  success: boolean = true, 
  message?: string
): ApiResponse<T> {
  return {
    success,
    data,
    message,
    timestamp: new Date().toISOString()
  };
}

/**
 * Format API error response
 */
export function formatApiError(
  error: string, 
  status?: number, 
  details?: any
): ApiErrorResponse {
  return {
    success: false,
    error,
    status,
    details
  };
}

/**
 * Check if response is successful
 */
export function isApiSuccess<T>(response: ApiResponse<T> | ApiErrorResponse): response is ApiResponse<T> {
  return response.success === true;
}

/**
 * Extract error message from API response
 */
export function getApiErrorMessage(response: ApiErrorResponse): string {
  return response.error || "An unknown error occurred";
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Transform game type to API endpoint path
 */
export function gameTypeToEndpoint(gameType: GameType): string {
  const endpointMap: Record<GameType, string> = {
    "word-guess": "word",
    "word-scramble": "word-scramble",
    "brain-teaser": "brain-teaser",
    "coding-puzzle": "coding-puzzle",
    "emoji-guess": "emoji",
    "math-quiz": "math",
    "memory-card": "memory",
    "number-maze": "number-maze",
    "quiz": "quiz",
    "simon-says": "simon",
    "sliding-puzzle": "sliding-puzzle",
    "speed-math": "speed-math",
    "sudoku": "sudoku",
    "typing-test": "typing",
    "whack-a-mole": "whack-a-mole",
    "word-builder": "word-builder",
    "hangman": "hangman",
    "reaction-time": "reaction-time",
    "tower-stacker": "tower-stacker",
    "tic-tac-toe": "tic-tac-toe",
    "2048": "2048",
    "pixel-art": "pixel-art"
  };

  return endpointMap[gameType] || gameType;
}

/**
 * Cache management utilities
 */
export class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

/**
 * Generate cache key for API requests
 */
export function generateCacheKey(endpoint: string, params?: Record<string, any>): string {
  const baseKey = endpoint.replace(/^\//, '').replace(/\//g, '_');
  
  if (!params) return baseKey;

  const paramString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return `${baseKey}_${Buffer.from(paramString).toString('base64')}`;
}

/**
 * Default cache instance
 */
export const apiCache = new ApiCache();