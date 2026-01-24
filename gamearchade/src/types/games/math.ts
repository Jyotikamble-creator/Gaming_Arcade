/**
 * TypeScript type definitions for Math Quiz Game
 */

/**
 * Mathematical operations
 */
export type MathOperation = '+' | '-' | '*' | '/';

/**
 * Difficulty levels for math questions
 */
export type MathDifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Expert';

/**
 * Question types
 */
export type QuestionType = 'basic' | 'equation' | 'wordProblem' | 'multiStep';

/**
 * Individual math question
 */
export interface MathQuestion {
  id: number;
  q: string;
  options: string[];
  ans: string;
  operation?: MathOperation;
  difficulty?: MathDifficultyLevel;
  type?: QuestionType;
  explanation?: string;
}

/**
 * Math quiz session
 */
export interface MathQuizSession {
  _id?: string;
  userId?: string;
  sessionId: string;
  questions: MathQuestion[];
  answers: UserAnswer[];
  startTime: Date;
  endTime?: Date;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  difficulty: MathDifficultyLevel;
  timeLimit?: number; // in seconds
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User's answer to a question
 */
export interface UserAnswer {
  questionId: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeTaken: number; // milliseconds
  timestamp: Date;
}

/**
 * Quiz configuration
 */
export interface QuizConfig {
  questionCount: number;
  difficulty: MathDifficultyLevel;
  operations?: MathOperation[];
  timeLimit?: number;
  questionType?: QuestionType;
}

/**
 * Request body for generating questions
 */
export interface GenerateQuestionsRequest {
  count?: number;
  difficulty?: MathDifficultyLevel;
  operations?: MathOperation[];
  questionType?: QuestionType;
}

/**
 * Response for generated questions
 */
export interface GenerateQuestionsResponse {
  questions: MathQuestion[];
  sessionId: string;
  difficulty: MathDifficultyLevel;
  totalQuestions: number;
}

/**
 * Request body for submitting answers
 */
export interface SubmitAnswersRequest {
  sessionId: string;
  answers: {
    questionId: number;
    answer: string;
    timeTaken?: number;
  }[];
}

/**
 * Response for submitted answers
 */
export interface SubmitAnswersResponse {
  sessionId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  results: {
    questionId: number;
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;
  }[];
  completed: boolean;
}

/**
 * Request body for validating a single answer
 */
export interface ValidateAnswerRequest {
  sessionId: string;
  questionId: number;
  answer: string;
  timeTaken?: number;
}

/**
 * Response for answer validation
 */
export interface ValidateAnswerResponse {
  correct: boolean;
  correctAnswer: string;
  explanation?: string;
  score: number;
}

/**
 * Math quiz statistics
 */
export interface MathQuizStats {
  totalQuizzesTaken: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  averageScore: number;
  averageTimePerQuestion: number;
  bestScore: number;
  favoriteOperation: MathOperation;
  strengthsByOperation: Record<MathOperation, number>;
  difficultiesMastered: MathDifficultyLevel[];
  currentStreak: number;
  bestStreak: number;
}

/**
 * Operation statistics
 */
export interface OperationStats {
  operation: MathOperation;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  averageTime: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  speed: 'Fast' | 'Average' | 'Slow';
  accuracy: 'High' | 'Medium' | 'Low';
  consistency: 'Consistent' | 'Inconsistent';
  improvement: 'Improving' | 'Stable' | 'Declining';
}

/**
 * Leaderboard entry
 */
export interface MathLeaderboardEntry {
  playerName: string;
  highestScore: number;
  totalQuizzes: number;
  accuracy: number;
  averageScore: number;
  rank: number;
}
