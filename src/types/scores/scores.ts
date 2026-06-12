// Score management type definitions

/**
 * Game types available in the arcade
 */
export type GameType = 
  | 'word-guess'
  | 'word-scramble'
  | 'word-builder'
  | 'hangman'
  | 'typing'
  | 'quiz'
  | 'brain-teaser'
  | 'coding-puzzle'
  | 'emoji-guess'
  | 'math-quiz'
  | 'memory-card'
  | 'number-maze'
  | 'reaction-time'
  | 'simon-says'
  | 'sliding-puzzle'
  | 'speed-math'
  | 'sudoku'
  | 'tower-stacker'
  | 'whack-mole'
  | 'game-2048'
  | 'tic-tac-toe'
  | 'music-tiles'
  | 'pixel-art-creator';

/**
 * Score difficulty levels
 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

/**
 * Base score interface
 */
export interface IScore {
  _id: string;
  userId: string;
  username: string;
  game: GameType;
  score: number;
  level?: number;
  difficulty?: DifficultyLevel;
  duration?: number; // in milliseconds
  accuracy?: number; // percentage 0-100
  attempts?: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Score creation payload
 */
export interface ScorePayload {
  game: GameType;
  score: number;
  level?: number;
  difficulty?: DifficultyLevel;
  duration?: number;
  accuracy?: number;
  attempts?: number;
  metadata?: Record<string, any>;
}

/**
 * Score save request
 */
export interface SaveScoreRequest extends ScorePayload {
  userId?: string; // Optional, can be inferred from auth
}

/**
 * Score save response
 */
export interface SaveScoreResponse {
  success: boolean;
  score: IScore;
  rank?: number;
  isPersonalBest: boolean;
  isGlobalBest: boolean;
  message?: string;
}

/**
 * Fetch scores parameters
 */
export interface FetchScoresParams {
  game?: GameType;
  limit?: number;
  offset?: number;
  difficulty?: DifficultyLevel;
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  sortBy?: 'score' | 'date' | 'duration' | 'accuracy';
  sortOrder?: 'asc' | 'desc';
  userId?: string;
}

/**
 * Scores list response
 */
export interface ScoresResponse {
  scores: IScore[];
  total: number;
  hasMore: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    limit: number;
    offset: number;
  };
}

/**
 * My scores parameters
 */
export interface MyScoresParams {
  game?: GameType;
  limit?: number;
  offset?: number;
  difficulty?: DifficultyLevel;
}

/**
 * User progress statistics
 */
export interface UserProgress {
  userId: string;
  username: string;
  totalGames: number;
  totalScore: number;
  averageScore: number;
  gamesPlayed: Record<GameType, number>;
  bestScores: Record<GameType, IScore>;
  achievements: Achievement[];
  stats: {
    totalPlayTime: number; // in milliseconds
    averageAccuracy: number;
    streaks: {
      current: number;
      longest: number;
      lastPlayDate: Date;
    };
    rankings: Record<GameType, number>;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Achievement interface
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'score' | 'streak' | 'accuracy' | 'speed' | 'completion';
  condition: {
    type: 'score_threshold' | 'games_played' | 'streak_count' | 'accuracy_rate';
    value: number;
    game?: GameType;
  };
  unlockedAt: Date;
  progress?: number; // 0-100
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  game: GameType;
  level?: number;
  difficulty?: DifficultyLevel;
  duration?: number;
  accuracy?: number;
  completedAt: Date;
  isCurrentUser?: boolean;
}

/**
 * Leaderboard response
 */
export interface LeaderboardResponse {
  game: GameType;
  timeRange: string;
  difficulty?: DifficultyLevel;
  entries: LeaderboardEntry[];
  userRank?: number;
  total: number;
  updatedAt: Date;
}

/**
 * Score statistics
 */
export interface ScoreStats {
  game: GameType;
  totalPlayers: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  medianScore: number;
  distribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  trends: {
    period: 'day' | 'week' | 'month';
    averageScore: number;
    totalGames: number;
    change: number; // percentage change from previous period
  }[];
}

/**
 * Progress comparison
 */
export interface ProgressComparison {
  current: UserProgress;
  previous?: UserProgress;
  changes: {
    totalGames: number;
    totalScore: number;
    averageScore: number;
    newAchievements: Achievement[];
    improvedGames: GameType[];
  };
  suggestions: string[];
}

/**
 * Score validation result
 */
export interface ScoreValidationResult {
  valid: boolean;
  score?: number;
  errors: string[];
  warnings: string[];
  adjustments?: {
    originalScore: number;
    adjustedScore: number;
    reason: string;
  };
}

/**
 * Score analytics data
 */
export interface ScoreAnalytics {
  game: GameType;
  userId: string;
  performance: {
    averageScore: number;
    bestScore: number;
    recentScores: number[];
    trend: 'improving' | 'declining' | 'stable';
    consistency: number; // 0-100
  };
  gameplay: {
    totalSessions: number;
    averageDuration: number;
    preferredDifficulty?: DifficultyLevel;
    completionRate: number;
  };
  recommendations: {
    difficultyAdjustment?: DifficultyLevel;
    practiceAreas: string[];
    targetScore: number;
  };
}

/**
 * Bulk score operations
 */
export interface BulkScoreOperation {
  operation: 'save' | 'update' | 'delete';
  scores: (SaveScoreRequest | string)[];
  options?: {
    skipValidation?: boolean;
    continueOnError?: boolean;
  };
}

export interface BulkScoreResult {
  success: boolean;
  processed: number;
  failed: number;
  results: {
    success: boolean;
    score?: IScore;
    error?: string;
  }[];
  errors: string[];
}

/**
 * Score export formats
 */
export type ExportFormat = 'json' | 'csv' | 'xlsx' | 'pdf';

export interface ScoreExportRequest {
  format: ExportFormat;
  games?: GameType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeProgress?: boolean;
  includeAchievements?: boolean;
}

export interface ScoreExportResponse {
  success: boolean;
  downloadUrl?: string;
  expiresAt?: Date;
  fileSize?: number;
  error?: string;
}