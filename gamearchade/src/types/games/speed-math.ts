/**
 * Speed Math Game Types
 * Defines interfaces for speed math game functionality
 */

// Math operations supported in the game
export type SpeedMathOperation = '+' | '-' | '*' | '/' | '^' | '√';

// Difficulty levels
export type SpeedMathDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

// Math problem structure
export interface ISpeedMathProblem {
  question: string;
  answer: number;
  operation: SpeedMathOperation;
  operand1: number;
  operand2: number;
  difficulty: SpeedMathDifficulty;
  timeLimit?: number; // seconds
  points?: number;
}

// Problem generation request
export interface SpeedMathProblemRequest {
  difficulty?: SpeedMathDifficulty;
  operations?: SpeedMathOperation[];
  timeLimit?: number;
}

// Problem generation response
export interface SpeedMathProblemResponse {
  problem: ISpeedMathProblem;
  sessionId?: string;
}

// Batch problem request
export interface SpeedMathBatchRequest {
  difficulty?: SpeedMathDifficulty;
  count?: number;
  operations?: SpeedMathOperation[];
}

// Batch problem response
export interface SpeedMathBatchResponse {
  problems: ISpeedMathProblem[];
  difficulty: SpeedMathDifficulty;
  count: number;
  sessionId?: string;
}

// Answer validation request
export interface SpeedMathValidationRequest {
  question: string;
  userAnswer: number;
  correctAnswer: number;
  timeElapsed?: number;
  sessionId?: string;
}

// Answer validation response
export interface SpeedMathValidationResponse {
  isCorrect: boolean;
  userAnswer: number;
  correctAnswer: number;
  question: string;
  timeElapsed?: number;
  points?: number;
  streak?: number;
  accuracy?: number;
}

// Game session data
export interface ISpeedMathSession {
  sessionId: string;
  userId?: string;
  playerName?: string;
  difficulty: SpeedMathDifficulty;
  startTime: Date;
  endTime?: Date;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalScore: number;
  currentStreak: number;
  longestStreak: number;
  averageTime: number;
  timeElapsed: number;
  isCompleted: boolean;
  problems: ISpeedMathProblem[];
  answers: ISpeedMathAnswer[];
}

// Individual answer record
export interface ISpeedMathAnswer {
  problemIndex: number;
  question: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeElapsed: number;
  points: number;
  timestamp: Date;
}

// Game statistics
export interface ISpeedMathStats {
  totalSessions: number;
  totalQuestions: number;
  totalCorrectAnswers: number;
  averageAccuracy: number;
  averageScore: number;
  averageTime: number;
  longestStreak: number;
  bestScore: number;
  fastestTime: number;
  difficultyBreakdown: Record<SpeedMathDifficulty, {
    sessions: number;
    accuracy: number;
    averageScore: number;
    averageTime: number;
  }>;
  operationBreakdown: Record<SpeedMathOperation, {
    attempts: number;
    accuracy: number;
    averageTime: number;
  }>;
}

// Leaderboard entry
export interface ISpeedMathLeaderboard {
  rank: number;
  playerName: string;
  userId?: string;
  score: number;
  accuracy: number;
  totalQuestions: number;
  averageTime: number;
  longestStreak: number;
  difficulty: SpeedMathDifficulty;
  completedAt: Date;
}

// Game configuration
export interface ISpeedMathConfig {
  difficulty: SpeedMathDifficulty;
  operations: SpeedMathOperation[];
  timeLimit: number;
  questionCount: number;
  enableStreak: boolean;
  enableTimer: boolean;
  pointsPerCorrect: number;
  streakBonus: number;
}

// Performance metrics
export interface ISpeedMathPerformance {
  wpm: number; // questions per minute
  accuracy: number;
  consistency: number;
  improvement: number;
  strengths: SpeedMathOperation[];
  weaknesses: SpeedMathOperation[];
  recommendedDifficulty: SpeedMathDifficulty;
}

export default ISpeedMathProblem;