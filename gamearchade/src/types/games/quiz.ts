/**
 * TypeScript type definitions for Quiz Game
 */

/**
 * Quiz difficulty levels
 */
export type QuizDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

/**
 * Quiz categories
 */
export type QuizCategory = 
  | 'general'
  | 'science'
  | 'history'
  | 'geography'
  | 'mathematics'
  | 'programming'
  | 'arts'
  | 'sports'
  | 'literature'
  | 'technology';

/**
 * Quiz question
 */
export interface QuizQuestion {
  id: number;
  q: string; // question text
  options: string[]; // array of 4 options
  ans: string; // correct answer
  category: QuizCategory;
  difficulty: QuizDifficulty;
  explanation?: string;
  points?: number;
  timeLimit?: number; // in seconds
}

/**
 * Quiz question without answer (for client)
 */
export interface QuizQuestionSafe {
  id: number;
  q: string;
  options: string[];
  category: QuizCategory;
  difficulty: QuizDifficulty;
  points?: number;
  timeLimit?: number;
}

/**
 * User's answer to a question
 */
export interface QuizAnswer {
  questionId: number;
  selectedAnswer: string;
  timeSpent: number; // in seconds
  correct?: boolean;
  pointsEarned?: number;
}

/**
 * Quiz session
 */
export interface QuizSession {
  sessionId: string;
  userId?: string;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  currentQuestionIndex: number;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  category?: QuizCategory;
  difficulty?: QuizDifficulty;
  completed: boolean;
  timeLimit?: number; // total time limit in seconds
  bonusPoints?: number;
  accuracy?: number;
}

/**
 * Quiz result
 */
export interface QuizResult {
  sessionId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  duration: number;
  performance: QuizPerformance;
  answers: QuizAnswer[];
  bonusPoints: number;
  perfectBonus: number;
  speedBonus: number;
  grade: QuizGrade;
}

/**
 * Quiz performance rating
 */
export type QuizPerformance = 
  | 'Quiz Master'
  | 'Excellent'
  | 'Very Good'
  | 'Good'
  | 'Average'
  | 'Below Average'
  | 'Needs Improvement';

/**
 * Quiz grade
 */
export type QuizGrade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';

/**
 * Quiz statistics
 */
export interface QuizStats {
  userId: string;
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
  overallAccuracy: number;
  averageScore: number;
  bestScore: number;
  averageTimePerQuestion: number;
  perfectQuizzes: number;
  categoryStats: CategoryPerformance[];
  difficultyStats: DifficultyPerformance[];
  recentQuizzes: QuizSessionSummary[];
  favoriteCategory: QuizCategory;
  strongestCategory: QuizCategory;
  weakestCategory: QuizCategory;
}

/**
 * Category performance
 */
export interface CategoryPerformance {
  category: QuizCategory;
  quizzesPlayed: number;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  averageScore: number;
  averageTime: number;
}

/**
 * Difficulty performance
 */
export interface DifficultyPerformance {
  difficulty: QuizDifficulty;
  quizzesPlayed: number;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  averageScore: number;
}

/**
 * Quiz session summary
 */
export interface QuizSessionSummary {
  sessionId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  duration: number;
  category?: QuizCategory;
  difficulty?: QuizDifficulty;
  completedAt: Date;
}

/**
 * Quiz configuration
 */
export interface QuizConfig {
  numberOfQuestions: number;
  category?: QuizCategory;
  difficulty?: QuizDifficulty;
  timeLimit?: number; // in seconds
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
}

/**
 * Request: Start quiz
 */
export interface StartQuizRequest {
  userId?: string;
  numberOfQuestions?: number;
  category?: QuizCategory;
  difficulty?: QuizDifficulty;
  timeLimit?: number;
  shuffleQuestions?: boolean;
}

/**
 * Response: Start quiz
 */
export interface StartQuizResponse {
  sessionId: string;
  questions: QuizQuestionSafe[];
  totalQuestions: number;
  timeLimit?: number;
  category?: QuizCategory;
  difficulty?: QuizDifficulty;
}

/**
 * Request: Submit answer
 */
export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: number;
  selectedAnswer: string;
  timeSpent: number;
}

/**
 * Response: Submit answer
 */
export interface SubmitAnswerResponse {
  correct: boolean;
  correctAnswer: string;
  explanation?: string;
  pointsEarned: number;
  currentScore: number;
  questionNumber: number;
  totalQuestions: number;
  nextQuestionId?: number;
}

/**
 * Request: Submit quiz
 */
export interface SubmitQuizRequest {
  sessionId: string;
  answers: Omit<QuizAnswer, 'correct' | 'pointsEarned'>[];
}

/**
 * Response: Submit quiz
 */
export interface SubmitQuizResponse {
  result: QuizResult;
  message: string;
}

/**
 * Request: Get questions
 */
export interface GetQuestionsRequest {
  category?: QuizCategory;
  difficulty?: QuizDifficulty;
  limit?: number;
  includeAnswers?: boolean;
}

/**
 * Response: Get questions
 */
export interface GetQuestionsResponse {
  questions: QuizQuestionSafe[] | QuizQuestion[];
  total: number;
  category?: QuizCategory;
  difficulty?: QuizDifficulty;
}

/**
 * Response: Get quiz stats
 */
export interface GetQuizStatsResponse {
  stats: QuizStats;
}

/**
 * Response: Get session state
 */
export interface GetSessionStateResponse {
  session: {
    sessionId: string;
    currentQuestionIndex: number;
    totalQuestions: number;
    score: number;
    correctAnswers: number;
    answeredQuestions: number;
    timeElapsed: number;
    completed: boolean;
  };
  currentQuestion?: QuizQuestionSafe;
}

/**
 * Leaderboard entry
 */
export interface QuizLeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  accuracy: number;
  totalQuizzes: number;
  rank: number;
}
