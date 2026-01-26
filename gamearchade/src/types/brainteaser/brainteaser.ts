// Enhanced Brain Teaser types for GameArchade

import type { ComponentProps, ReactNode } from 'react';
import type { NextPageParams, NextPageSearchParams } from '@/types/dashboard/dashboard';

/**
 * Core Brain Teaser Types
 */

/**
 * Available shapes for puzzles
 */
export type BrainTeaserShape = 
  | 'circle' 
  | 'square' 
  | 'triangle' 
  | 'diamond' 
  | 'star' 
  | 'hexagon'
  | 'pentagon'
  | 'octagon';

/**
 * Available colors for puzzles
 */
export type BrainTeaserColor = 
  | 'red' 
  | 'blue' 
  | 'green' 
  | 'yellow' 
  | 'purple' 
  | 'orange' 
  | 'pink' 
  | 'cyan'
  | 'violet'
  | 'lime'
  | 'rose'
  | 'amber';

/**
 * Available pattern types
 */
export type BrainTeaserPattern = 
  | 'horizontal' 
  | 'vertical' 
  | 'diagonal' 
  | 'zigzag'
  | 'circular'
  | 'spiral';

/**
 * Puzzle difficulty levels
 */
export type BrainTeaserDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

/**
 * Puzzle types
 */
export type BrainTeaserPuzzleType = 
  | 'match-shape'
  | 'find-odd'
  | 'pattern'
  | 'memory'
  | 'logic'
  | 'sequence';

/**
 * Shape object for puzzles
 */
export interface BrainTeaserShapeObject {
  shape: BrainTeaserShape;
  color: BrainTeaserColor;
  size?: 'small' | 'medium' | 'large';
  rotation?: number;
  pattern?: string;
}

/**
 * Base puzzle interface
 */
export interface BrainTeaserBasePuzzle {
  id: string;
  type: BrainTeaserPuzzleType;
  question: string;
  difficulty: BrainTeaserDifficulty;
  points: number;
  timeLimit?: number;
  hint?: string;
  explanation?: string;
}

/**
 * Match Shape puzzle
 */
export interface BrainTeaserMatchShapePuzzle extends BrainTeaserBasePuzzle {
  type: 'match-shape';
  target: BrainTeaserShapeObject;
  options: BrainTeaserShapeObject[];
  correctAnswer: number;
}

/**
 * Find Odd puzzle
 */
export interface BrainTeaserFindOddPuzzle extends BrainTeaserBasePuzzle {
  type: 'find-odd';
  options: BrainTeaserShapeObject[];
  correctAnswer: number;
  oddReason?: 'shape' | 'color' | 'size' | 'pattern';
}

/**
 * Pattern puzzle
 */
export interface BrainTeaserPatternPuzzle extends BrainTeaserBasePuzzle {
  type: 'pattern';
  pattern: BrainTeaserShapeObject[];
  options: BrainTeaserShapeObject[];
  correctAnswer: number;
  patternType: BrainTeaserPattern;
}

/**
 * Memory puzzle
 */
export interface BrainTeaserMemoryPuzzle extends BrainTeaserBasePuzzle {
  type: 'memory';
  sequence: BrainTeaserShapeObject[];
  showTime: number;
  options: BrainTeaserShapeObject[];
  correctAnswer: number[];
}

/**
 * Logic puzzle
 */
export interface BrainTeaserLogicPuzzle extends BrainTeaserBasePuzzle {
  type: 'logic';
  premise: string;
  options: string[];
  correctAnswer: number;
}

/**
 * Sequence puzzle
 */
export interface BrainTeaserSequencePuzzle extends BrainTeaserBasePuzzle {
  type: 'sequence';
  sequence: (BrainTeaserShapeObject | number | string)[];
  options: (BrainTeaserShapeObject | number | string)[];
  correctAnswer: number;
  sequenceType: 'arithmetic' | 'geometric' | 'fibonacci' | 'custom';
}

/**
 * Union type for all puzzles
 */
export type BrainTeaserPuzzle = 
  | BrainTeaserMatchShapePuzzle
  | BrainTeaserFindOddPuzzle
  | BrainTeaserPatternPuzzle
  | BrainTeaserMemoryPuzzle
  | BrainTeaserLogicPuzzle
  | BrainTeaserSequencePuzzle;

/**
 * Game State Types
 */

/**
 * Game status
 */
export type BrainTeaserGameStatus = 
  | 'idle'
  | 'starting'
  | 'playing'
  | 'paused'
  | 'completed'
  | 'failed';

/**
 * Game mode
 */
export type BrainTeaserGameMode = 
  | 'classic'
  | 'timed'
  | 'endless'
  | 'challenge'
  | 'practice';

/**
 * Feedback types
 */
export interface BrainTeaserFeedback {
  type: 'success' | 'error' | 'hint' | 'warning';
  message: string;
  points?: number;
  explanation?: string;
  duration?: number;
}

/**
 * Game statistics
 */
export interface BrainTeaserGameStats {
  score: number;
  puzzlesSolved: number;
  puzzlesAttempted: number;
  streak: number;
  bestStreak: number;
  accuracy: number;
  averageTime: number;
  totalTime: number;
  hintsUsed: number;
  bonusPoints: number;
}

/**
 * Player performance metrics
 */
export interface BrainTeaserPerformance {
  puzzleTypeStats: Record<BrainTeaserPuzzleType, {
    attempted: number;
    solved: number;
    averageTime: number;
    bestTime: number;
    accuracy: number;
  }>;
  difficultyStats: Record<BrainTeaserDifficulty, {
    attempted: number;
    solved: number;
    averageScore: number;
    bestScore: number;
  }>;
  streakStats: {
    current: number;
    best: number;
    total: number;
  };
  timeStats: {
    totalPlayed: number;
    averageSession: number;
    longestSession: number;
  };
}

/**
 * Game configuration
 */
export interface BrainTeaserConfig {
  mode: BrainTeaserGameMode;
  difficulty: BrainTeaserDifficulty;
  timeLimit: number;
  maxPuzzles?: number;
  enableHints: boolean;
  enableTimer: boolean;
  enableSound: boolean;
  enableAnimations: boolean;
  autoAdvance: boolean;
  showExplanations: boolean;
  allowSkip: boolean;
  penaltyForWrong: boolean;
  streakBonus: boolean;
  customShapes?: BrainTeaserShape[];
  customColors?: BrainTeaserColor[];
}

/**
 * Game state
 */
export interface BrainTeaserGameState {
  status: BrainTeaserGameStatus;
  config: BrainTeaserConfig;
  currentPuzzle: BrainTeaserPuzzle | null;
  puzzleIndex: number;
  timeLeft: number;
  timeElapsed: number;
  stats: BrainTeaserGameStats;
  feedback: BrainTeaserFeedback | null;
  isLoading: boolean;
  isPaused: boolean;
  showHint: boolean;
}

/**
 * Component Props Types
 */

/**
 * Brain Teaser page props
 */
export interface BrainTeaserPageProps {
  params?: NextPageParams;
  searchParams?: NextPageSearchParams;
  config?: Partial<BrainTeaserConfig>;
  onGameComplete?: (stats: BrainTeaserGameStats) => void;
  onScoreSubmit?: (score: number, meta: any) => Promise<void>;
  className?: string;
  children?: ReactNode;
}

/**
 * Timer component props
 */
export interface BrainTeaserTimerProps {
  timeLeft: number;
  totalTime: number;
  isPaused?: boolean;
  onTimeUp?: () => void;
  className?: string;
  showProgress?: boolean;
  showWarning?: boolean;
  warningThreshold?: number;
}

/**
 * Stats component props
 */
export interface BrainTeaserStatsProps {
  stats: BrainTeaserGameStats;
  showDetailed?: boolean;
  className?: string;
  variant?: 'compact' | 'detailed' | 'minimal';
}

/**
 * Puzzle display component props
 */
export interface BrainTeaserDisplayProps {
  puzzle: BrainTeaserPuzzle;
  onAnswer: (selectedIndex: number) => void;
  feedback?: BrainTeaserFeedback | null;
  showHint?: boolean;
  isLoading?: boolean;
  className?: string;
}

/**
 * Shape display component props
 */
export interface BrainTeaserShapeDisplayProps {
  shape: BrainTeaserShapeObject;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Completed modal props
 */
export interface BrainTeaserCompletedModalProps {
  stats: BrainTeaserGameStats;
  performance?: BrainTeaserPerformance;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
  onShareScore?: () => void;
  isVisible: boolean;
  className?: string;
}

/**
 * Instructions component props
 */
export interface BrainTeaserInstructionsProps {
  variant?: 'basic' | 'detailed' | 'interactive';
  onStart?: () => void;
  className?: string;
}

/**
 * Settings component props
 */
export interface BrainTeaserSettingsProps {
  config: BrainTeaserConfig;
  onChange: (config: Partial<BrainTeaserConfig>) => void;
  onSave?: () => void;
  onReset?: () => void;
  className?: string;
}

/**
 * API Types
 */

/**
 * Score submission data
 */
export interface BrainTeaserScoreData {
  game: 'brain-teaser';
  score: number;
  meta: {
    puzzlesSolved: number;
    bestStreak: number;
    accuracy: number;
    timeUsed: number;
    difficulty: BrainTeaserDifficulty;
    mode: BrainTeaserGameMode;
    puzzleTypes: Record<BrainTeaserPuzzleType, number>;
  };
}

/**
 * Leaderboard entry
 */
export interface BrainTeaserLeaderboardEntry {
  id: string;
  username: string;
  score: number;
  puzzlesSolved: number;
  accuracy: number;
  bestStreak: number;
  difficulty: BrainTeaserDifficulty;
  mode: BrainTeaserGameMode;
  timestamp: string;
  rank?: number;
}

/**
 * Error Types
 */

/**
 * Brain Teaser specific errors
 */
export type BrainTeaserErrorType = 
  | 'PUZZLE_GENERATION_FAILED'
  | 'INVALID_ANSWER'
  | 'TIME_EXPIRED'
  | 'SCORE_SUBMISSION_FAILED'
  | 'CONFIG_VALIDATION_FAILED'
  | 'COMPONENT_RENDER_FAILED';

/**
 * Brain Teaser error interface
 */
export interface BrainTeaserError {
  type: BrainTeaserErrorType;
  message: string;
  code?: string;
  details?: {
    puzzle?: BrainTeaserPuzzle;
    config?: BrainTeaserConfig;
    stats?: BrainTeaserGameStats;
    error?: any;
  };
}

/**
 * Utility Types
 */

/**
 * Puzzle generator function type
 */
export type BrainTeaserPuzzleGenerator = (
  difficulty: BrainTeaserDifficulty,
  config?: Partial<BrainTeaserConfig>
) => BrainTeaserPuzzle;

/**
 * Scoring function type
 */
export type BrainTeaserScoringFunction = (
  puzzle: BrainTeaserPuzzle,
  timeUsed: number,
  streak: number,
  difficulty: BrainTeaserDifficulty
) => number;

/**
 * Validation result
 */
export interface BrainTeaserValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Export all types for easy importing
 */
export type {
  ComponentProps as BrainTeaserComponentProps
};