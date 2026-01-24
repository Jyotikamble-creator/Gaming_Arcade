/**
 * TypeScript type definitions for Reaction Time Game
 */

/**
 * Performance categories based on reaction time
 */
export type ReactionPerformance = 
  | 'elite'
  | 'excellent'
  | 'good'
  | 'average'
  | 'belowAverage'
  | 'slow';

/**
 * Game difficulty (affects timing constraints)
 */
export type ReactionDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';

/**
 * Benchmark for reaction time performance
 */
export interface ReactionBenchmark {
  max: number; // maximum time in ms for this category
  label: string;
  color: string;
  description?: string;
}

/**
 * Individual reaction attempt
 */
export interface ReactionAttempt {
  attemptNumber: number;
  reactionTime: number; // in milliseconds
  timestamp: Date;
  valid: boolean;
  tooEarly?: boolean; // clicked before stimulus
}

/**
 * Reaction time session
 */
export interface ReactionSession {
  sessionId: string;
  userId?: string;
  attempts: ReactionAttempt[];
  currentAttempt: number;
  totalAttempts: number;
  startTime: Date;
  endTime?: Date;
  averageTime?: number;
  bestTime?: number;
  worstTime?: number;
  consistency?: number; // lower is better
  score?: number;
  performance?: ReactionPerformance;
  difficulty: ReactionDifficulty;
  completed: boolean;
  falseStarts: number;
}

/**
 * Reaction time result
 */
export interface ReactionResult {
  sessionId: string;
  score: number;
  averageTime: number;
  bestTime: number;
  worstTime: number;
  consistency: number;
  performance: ReactionPerformance;
  attempts: ReactionAttempt[];
  scoreBreakdown: ScoreBreakdown;
  message: string;
  percentile?: number;
}

/**
 * Score breakdown
 */
export interface ScoreBreakdown {
  baseScore: number;
  consistencyBonus: number;
  bestTimeBonus: number;
  difficultyMultiplier: number;
  penaltyDeduction: number;
  totalScore: number;
}

/**
 * Reaction time statistics
 */
export interface ReactionStats {
  userId: string;
  totalSessions: number;
  totalAttempts: number;
  overallBestTime: number;
  overallAverageTime: number;
  bestScore: number;
  averageScore: number;
  performanceDistribution: Record<ReactionPerformance, number>;
  improvementRate: number; // percentage improvement
  recentSessions: ReactionSessionSummary[];
  averageConsistency: number;
  totalFalseStarts: number;
}

/**
 * Session summary
 */
export interface ReactionSessionSummary {
  sessionId: string;
  score: number;
  averageTime: number;
  bestTime: number;
  performance: ReactionPerformance;
  difficulty: ReactionDifficulty;
  completedAt: Date;
}

/**
 * Request: Start session
 */
export interface StartReactionRequest {
  userId?: string;
  totalAttempts?: number;
  difficulty?: ReactionDifficulty;
}

/**
 * Response: Start session
 */
export interface StartReactionResponse {
  sessionId: string;
  totalAttempts: number;
  difficulty: ReactionDifficulty;
  message: string;
}

/**
 * Request: Record attempt
 */
export interface RecordAttemptRequest {
  sessionId: string;
  reactionTime: number;
  tooEarly?: boolean;
}

/**
 * Response: Record attempt
 */
export interface RecordAttemptResponse {
  attemptNumber: number;
  totalAttempts: number;
  reactionTime: number;
  valid: boolean;
  currentAverage?: number;
  currentBest?: number;
  remaining: number;
  completed: boolean;
}

/**
 * Request: Submit session
 */
export interface SubmitReactionRequest {
  sessionId: string;
}

/**
 * Response: Submit session
 */
export interface SubmitReactionResponse {
  result: ReactionResult;
}

/**
 * Request: Calculate score
 */
export interface CalculateScoreRequest {
  averageTime: number;
  bestTime: number;
  allTimes: number[];
  difficulty?: ReactionDifficulty;
  falseStarts?: number;
}

/**
 * Response: Calculate score
 */
export interface CalculateScoreResponse {
  success: boolean;
  score: number;
  breakdown: ScoreBreakdown;
  performance: ReactionPerformance;
}

/**
 * Response: Get benchmarks
 */
export interface GetBenchmarksResponse {
  success: boolean;
  benchmarks: Record<ReactionPerformance, ReactionBenchmark>;
  difficultyInfo: Record<ReactionDifficulty, DifficultyInfo>;
}

/**
 * Difficulty information
 */
export interface DifficultyInfo {
  name: string;
  description: string;
  minDelay: number; // minimum delay before stimulus (ms)
  maxDelay: number; // maximum delay before stimulus (ms)
  multiplier: number; // score multiplier
}

/**
 * Response: Get stats
 */
export interface GetReactionStatsResponse {
  stats: ReactionStats;
}

/**
 * Response: Get session state
 */
export interface GetSessionStateResponse {
  session: {
    sessionId: string;
    currentAttempt: number;
    totalAttempts: number;
    attempts: ReactionAttempt[];
    currentAverage?: number;
    currentBest?: number;
    completed: boolean;
  };
}

/**
 * Leaderboard entry
 */
export interface ReactionLeaderboardEntry {
  userId: string;
  username: string;
  bestTime: number;
  averageTime: number;
  bestScore: number;
  rank: number;
}

/**
 * Performance comparison
 */
export interface PerformanceComparison {
  userBestTime: number;
  averageBestTime: number;
  percentile: number;
  betterThan: number; // percentage of users
}
