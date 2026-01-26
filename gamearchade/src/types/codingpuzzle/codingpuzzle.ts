// Enhanced Coding Puzzle types for GameArchade

import type { ComponentProps, ReactNode } from 'react';
import type { NextPageParams, NextPageSearchParams } from '@/types/dashboard/dashboard';

/**
 * Core Coding Puzzle Types
 */

/**
 * Puzzle categories
 */
export type CodingPuzzleCategory = 
  | 'patterns'
  | 'codeOutput'
  | 'logic'
  | 'bitwise'
  | 'algorithms'
  | 'dataStructures'
  | 'debugging'
  | 'optimization';

/**
 * Puzzle difficulty levels
 */
export type CodingPuzzleDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

/**
 * Programming languages supported
 */
export type CodingPuzzleLanguage = 
  | 'javascript'
  | 'python'
  | 'java'
  | 'csharp'
  | 'cpp'
  | 'typescript'
  | 'pseudocode';

/**
 * Answer types
 */
export type CodingPuzzleAnswerType = 
  | 'text'
  | 'number'
  | 'boolean'
  | 'code'
  | 'multiple-choice'
  | 'array';

/**
 * Individual puzzle interface
 */
export interface CodingPuzzleItem {
  id: string;
  question: string;
  answer: string | number | boolean | string[];
  hint: string;
  difficulty: CodingPuzzleDifficulty;
  category: CodingPuzzleCategory;
  language?: CodingPuzzleLanguage;
  answerType: CodingPuzzleAnswerType;
  explanation?: string;
  code?: string;
  expectedOutput?: string;
  timeLimit?: number;
  points: number;
  tags: string[];
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  multipleChoice?: string[];
  validation?: {
    caseSensitive: boolean;
    trimWhitespace: boolean;
    allowAlternatives: string[];
  };
}

/**
 * Puzzle category configuration
 */
export interface CodingPuzzleCategoryConfig {
  id: CodingPuzzleCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  puzzles: CodingPuzzleItem[];
  unlocked: boolean;
  requiredScore?: number;
  difficulty: CodingPuzzleDifficulty;
}

/**
 * Game State Types
 */

/**
 * Game status
 */
export type CodingPuzzleGameStatus = 
  | 'idle'
  | 'category-selection'
  | 'playing'
  | 'paused'
  | 'completed'
  | 'failed';

/**
 * Game mode
 */
export type CodingPuzzleGameMode = 
  | 'single-category'
  | 'mixed'
  | 'challenge'
  | 'practice'
  | 'timed'
  | 'endless';

/**
 * Feedback types
 */
export interface CodingPuzzleFeedback {
  type: 'success' | 'error' | 'hint' | 'warning' | 'info';
  message: string;
  points?: number;
  explanation?: string;
  duration?: number;
  showNext?: boolean;
}

/**
 * Game statistics
 */
export interface CodingPuzzleGameStats {
  score: number;
  puzzlesSolved: number;
  puzzlesAttempted: number;
  totalPuzzles: number;
  streak: number;
  bestStreak: number;
  accuracy: number;
  hintsUsed: number;
  skippedPuzzles: number;
  averageTime: number;
  totalTime: number;
  bonusPoints: number;
  categoryProgress: Record<CodingPuzzleCategory, {
    solved: number;
    total: number;
    bestScore: number;
  }>;
  difficultyBreakdown: Record<CodingPuzzleDifficulty, {
    attempted: number;
    solved: number;
    accuracy: number;
  }>;
}

/**
 * Player performance metrics
 */
export interface CodingPuzzlePerformance {
  overallStats: {
    totalGamesPlayed: number;
    bestScore: number;
    averageScore: number;
    totalPuzzlesSolved: number;
    favoriteCategory: CodingPuzzleCategory;
    strongestDifficulty: CodingPuzzleDifficulty;
  };
  categoryStats: Record<CodingPuzzleCategory, {
    gamesPlayed: number;
    puzzlesSolved: number;
    averageScore: number;
    bestScore: number;
    accuracy: number;
    averageTime: number;
  }>;
  difficultyStats: Record<CodingPuzzleDifficulty, {
    attempted: number;
    solved: number;
    accuracy: number;
    averageScore: number;
    fastestTime: number;
  }>;
  streakStats: {
    longestStreak: number;
    currentStreak: number;
    streakFrequency: number;
  };
  recentActivity: Array<{
    date: string;
    category: CodingPuzzleCategory;
    score: number;
    puzzlesSolved: number;
    accuracy: number;
  }>;
}

/**
 * Game configuration
 */
export interface CodingPuzzleConfig {
  mode: CodingPuzzleGameMode;
  selectedCategory: CodingPuzzleCategory | null;
  totalPuzzles: number;
  enableHints: boolean;
  enableSkip: boolean;
  timeLimit?: number;
  enableTimer: boolean;
  enableSound: boolean;
  enableAnimations: boolean;
  showExplanations: boolean;
  caseSensitiveAnswers: boolean;
  allowPartialCredit: boolean;
  streakBonus: boolean;
  hintPenalty: boolean;
  skipPenalty: boolean;
  difficultyProgression: boolean;
  randomizeOrder: boolean;
  language: CodingPuzzleLanguage;
  theme: 'dark' | 'light' | 'auto';
}

/**
 * Game state
 */
export interface CodingPuzzleGameState {
  status: CodingPuzzleGameStatus;
  config: CodingPuzzleConfig;
  currentPuzzle: CodingPuzzleItem | null;
  puzzleIndex: number;
  userAnswer: string;
  stats: CodingPuzzleGameStats;
  feedback: CodingPuzzleFeedback | null;
  showHint: boolean;
  usedPuzzles: string[];
  availablePuzzles: CodingPuzzleItem[];
  timeLeft?: number;
  timeElapsed: number;
  isLoading: boolean;
  isPaused: boolean;
  lastAnswerCorrect: boolean;
}

/**
 * Component Props Types
 */

/**
 * Coding Puzzle page props
 */
export interface CodingPuzzlePageProps {
  params?: NextPageParams;
  searchParams?: NextPageSearchParams;
  config?: Partial<CodingPuzzleConfig>;
  customCategories?: CodingPuzzleCategoryConfig[];
  onGameComplete?: (stats: CodingPuzzleGameStats) => void;
  onScoreSubmit?: (score: number, meta: any) => Promise<void>;
  className?: string;
  children?: ReactNode;
}

/**
 * Category selection props
 */
export interface CodingPuzzleCategorySelectionProps {
  categories: CodingPuzzleCategoryConfig[];
  onCategorySelect: (category: CodingPuzzleCategory) => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Puzzle display props
 */
export interface CodingPuzzleDisplayProps {
  puzzle: CodingPuzzleItem;
  puzzleNumber: number;
  totalPuzzles: number;
  showCode?: boolean;
  language?: CodingPuzzleLanguage;
  className?: string;
}

/**
 * Puzzle input props
 */
export interface CodingPuzzleInputProps {
  puzzle: CodingPuzzleItem;
  userAnswer: string;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  onSkip?: () => void;
  onToggleHint?: () => void;
  showHint: boolean;
  feedback?: CodingPuzzleFeedback | null;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Stats component props
 */
export interface CodingPuzzleStatsProps {
  stats: CodingPuzzleGameStats;
  showDetailed?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Hint component props
 */
export interface CodingPuzzleHintProps {
  hint: string;
  puzzle: CodingPuzzleItem;
  isVisible: boolean;
  onClose?: () => void;
  className?: string;
}

/**
 * Completed modal props
 */
export interface CodingPuzzleCompletedModalProps {
  stats: CodingPuzzleGameStats;
  performance?: CodingPuzzlePerformance;
  category: CodingPuzzleCategory;
  isVisible: boolean;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
  onChangeCategory: () => void;
  onShareScore?: () => void;
  className?: string;
}

/**
 * Code display props
 */
export interface CodingPuzzleCodeDisplayProps {
  code: string;
  language: CodingPuzzleLanguage;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  readOnly?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
}

/**
 * Progress indicator props
 */
export interface CodingPuzzleProgressProps {
  current: number;
  total: number;
  category: CodingPuzzleCategory;
  streak?: number;
  className?: string;
}

/**
 * API Types
 */

/**
 * Score submission data
 */
export interface CodingPuzzleScoreData {
  game: 'coding-puzzle';
  score: number;
  meta: {
    puzzlesSolved: number;
    category: CodingPuzzleCategory;
    bestStreak: number;
    accuracy: number;
    hintsUsed: number;
    skippedPuzzles: number;
    totalTime: number;
    difficulty: CodingPuzzleDifficulty[];
    languages: CodingPuzzleLanguage[];
    mode: CodingPuzzleGameMode;
  };
}

/**
 * Leaderboard entry
 */
export interface CodingPuzzleLeaderboardEntry {
  id: string;
  username: string;
  score: number;
  puzzlesSolved: number;
  category: CodingPuzzleCategory;
  accuracy: number;
  bestStreak: number;
  difficulty: CodingPuzzleDifficulty;
  timestamp: string;
  rank?: number;
}

/**
 * Puzzle analytics
 */
export interface CodingPuzzleAnalytics {
  puzzleId: string;
  attempts: number;
  successes: number;
  averageTime: number;
  hintsRequested: number;
  skips: number;
  difficulty: CodingPuzzleDifficulty;
  category: CodingPuzzleCategory;
}

/**
 * Error Types
 */

/**
 * Coding Puzzle specific errors
 */
export type CodingPuzzleErrorType = 
  | 'PUZZLE_LOAD_FAILED'
  | 'INVALID_ANSWER'
  | 'CATEGORY_NOT_FOUND'
  | 'SCORE_SUBMISSION_FAILED'
  | 'CONFIG_VALIDATION_FAILED'
  | 'PUZZLE_GENERATION_FAILED'
  | 'ANSWER_VALIDATION_FAILED';

/**
 * Coding Puzzle error interface
 */
export interface CodingPuzzleError {
  type: CodingPuzzleErrorType;
  message: string;
  code?: string;
  details?: {
    puzzle?: CodingPuzzleItem;
    category?: CodingPuzzleCategory;
    config?: CodingPuzzleConfig;
    stats?: CodingPuzzleGameStats;
    error?: any;
  };
}

/**
 * Utility Types
 */

/**
 * Answer validation result
 */
export interface CodingPuzzleAnswerValidation {
  isCorrect: boolean;
  normalizedAnswer: string;
  explanation?: string;
  partialCredit?: number;
  suggestions?: string[];
}

/**
 * Puzzle filter options
 */
export interface CodingPuzzleFilter {
  categories?: CodingPuzzleCategory[];
  difficulties?: CodingPuzzleDifficulty[];
  languages?: CodingPuzzleLanguage[];
  tags?: string[];
  minPoints?: number;
  maxPoints?: number;
}

/**
 * Puzzle search options
 */
export interface CodingPuzzleSearchOptions {
  query?: string;
  filter?: CodingPuzzleFilter;
  sortBy?: 'difficulty' | 'points' | 'category' | 'recent';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Game session data
 */
export interface CodingPuzzleGameSession {
  sessionId: string;
  startTime: string;
  endTime?: string;
  config: CodingPuzzleConfig;
  puzzles: Array<{
    puzzle: CodingPuzzleItem;
    userAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
    hintsUsed: number;
    attempts: number;
  }>;
  finalStats: CodingPuzzleGameStats;
}

/**
 * Progress tracking
 */
export interface CodingPuzzleProgress {
  userId: string;
  totalPuzzlesSolved: number;
  categoriesUnlocked: CodingPuzzleCategory[];
  achievements: string[];
  currentLevel: number;
  experiencePoints: number;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    earnedDate: string;
  }>;
  streakHistory: Array<{
    date: string;
    streak: number;
    category: CodingPuzzleCategory;
  }>;
}

/**
 * Validation result
 */
export interface CodingPuzzleValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Export all types for easy importing
 */
export type {
  ComponentProps as CodingPuzzleComponentProps
};