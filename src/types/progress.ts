/**
 * TypeScript type definitions for User Progress and Statistics
 */

/**
 * Game types/names
 */
export type GameType = 
  | 'word-guess'
  | 'word-scramble'
  | 'brain-teaser'
  | 'coding-puzzle'
  | 'emoji-guess'
  | 'math-quiz'
  | 'memory-card'
  | 'number-maze'
  | 'quiz'
  | 'simon-says'
  | 'sliding-puzzle'
  | 'speed-math'
  | 'sudoku'
  | 'typing-test'
  | 'whack-a-mole'
  | 'word-builder'
  | 'hangman'
  | 'reaction-time'
  | 'tower-stacker'
  | 'tic-tac-toe'
  | '2048'
  | 'pixel-art';

/**
 * Recent score entry
 */
export interface RecentScore {
  game: GameType;
  score: number;
  createdAt: Date;
  _id?: string;
}

/**
 * Game statistics for a specific game
 */
export interface GameStats {
  game: GameType;
  totalPlayed: number;
  bestScore: number;
  averageScore: number;
  lastPlayed: Date;
  totalTimeSpent?: number; // in seconds
  completionRate?: number;
}

/**
 * User progress summary
 */
export interface UserProgress {
  userId: string;
  totalGames: number;
  gamesPlayed: Record<GameType, number>;
  bestScores: Record<GameType, number>;
  recentScores: RecentScore[];
  gameStats?: GameStats[];
  achievements?: Achievement[];
  lastActive?: Date;
}

/**
 * Achievement
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  category: 'games' | 'scores' | 'streaks' | 'time' | 'special';
}

/**
 * Progress over time (for charts)
 */
export interface ProgressOverTime {
  date: string;
  gamesPlayed: number;
  averageScore: number;
  totalScore: number;
}

/**
 * User rank/level
 */
export interface UserRank {
  level: number;
  title: string;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  percentToNext: number;
}

/**
 * Game category statistics
 */
export interface CategoryStats {
  category: 'word' | 'math' | 'logic' | 'memory' | 'speed' | 'strategy';
  gamesPlayed: number;
  averageScore: number;
  bestGame: GameType;
  totalTimeSpent: number;
}

/**
 * Streak information
 */
export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: Date;
  streakActive: boolean;
}

/**
 * Performance comparison
 */
export interface PerformanceComparison {
  game: GameType;
  userScore: number;
  averageScore: number;
  percentile: number;
  rank: number;
  totalPlayers: number;
}

/**
 * Request parameters for progress
 */
export interface GetProgressRequest {
  userId?: string;
  includeStats?: boolean;
  includeAchievements?: boolean;
  limit?: number;
}

/**
 * Response for user progress
 */
export interface GetProgressResponse {
  totalGames: number;
  gamesPlayed: Record<string, number>;
  bestScores: Record<string, number>;
  recentScores: RecentScore[];
  gameStats?: GameStats[];
  achievements?: Achievement[];
  streak?: StreakInfo;
  rank?: UserRank;
}

/**
 * Time period for analytics
 */
export type TimePeriod = 'day' | 'week' | 'month' | 'year' | 'all';

/**
 * Analytics request
 */
export interface AnalyticsRequest {
  userId: string;
  period: TimePeriod;
  games?: GameType[];
}

/**
 * Analytics response
 */
export interface AnalyticsResponse {
  period: TimePeriod;
  totalGames: number;
  totalScore: number;
  averageScore: number;
  progressOverTime: ProgressOverTime[];
  topGames: Array<{
    game: GameType;
    count: number;
    percentage: number;
  }>;
  improvement: {
    gamesPlayed: number;
    scoreIncrease: number;
    trend: 'improving' | 'stable' | 'declining';
  };
}

/**
 * Leaderboard entry with user context
 */
export interface UserLeaderboardPosition {
  game: GameType;
  userRank: number;
  userScore: number;
  totalPlayers: number;
  topScore: number;
  percentile: number;
}

/**
 * Summary statistics
 */
export interface SummaryStats {
  totalGamesPlayed: number;
  totalScore: number;
  averageScore: number;
  favoriteGame: GameType;
  bestPerformingGame: GameType;
  totalPlayTime: number; // in seconds
  gamesThisWeek: number;
  streak: StreakInfo;
}
