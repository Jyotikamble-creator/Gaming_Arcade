/**
 * Utility functions and question generation for Math Quiz Game
 */

import type {
  MathQuestion,
  MathOperation,
  MathDifficultyLevel,
  QuestionType,
  QuizConfig
} from '@/types/games/math';

/**
 * Generate a simple math question
 */
export function generateMathQuestion(
  id: number = 1,
  operation?: MathOperation,
  difficulty: MathDifficultyLevel = 'Easy'
): MathQuestion {
  const operations: MathOperation[] = operation ? [operation] : ['+', '-', '*'];
  const op = operations[Math.floor(Math.random() * operations.length)];

  let a: number, b: number, ans: number;
  const difficultyMultiplier = getDifficultyMultiplier(difficulty);

  switch (op) {
    case '+':
      a = Math.floor(Math.random() * (50 * difficultyMultiplier)) + 1;
      b = Math.floor(Math.random() * (50 * difficultyMultiplier)) + 1;
      ans = a + b;
      break;

    case '-':
      a = Math.floor(Math.random() * (50 * difficultyMultiplier)) + 10;
      b = Math.floor(Math.random() * a) + 1;
      ans = a - b;
      break;

    case '*':
      a = Math.floor(Math.random() * (10 * difficultyMultiplier)) + 1;
      b = Math.floor(Math.random() * (10 * difficultyMultiplier)) + 1;
      ans = a * b;
      break;

    case '/':
      b = Math.floor(Math.random() * (10 * difficultyMultiplier)) + 1;
      ans = Math.floor(Math.random() * (10 * difficultyMultiplier)) + 1;
      a = b * ans; // Ensure clean division
      break;

    default:
      a = 1;
      b = 1;
      ans = 2;
  }

  const q = `${a} ${op} ${b} = ?`;
  const options = generateOptions(ans, difficulty);

  return {
    id,
    q,
    options: options.map(String),
    ans: ans.toString(),
    operation: op,
    difficulty,
    type: 'basic'
  };
}

/**
 * Get difficulty multiplier
 */
function getDifficultyMultiplier(difficulty: MathDifficultyLevel): number {
  switch (difficulty) {
    case 'Easy':
      return 1;
    case 'Medium':
      return 2;
    case 'Hard':
      return 3;
    case 'Expert':
      return 5;
    default:
      return 1;
  }
}

/**
 * Generate answer options for multiple choice
 */
function generateOptions(correctAnswer: number, difficulty: MathDifficultyLevel): number[] {
  const options = new Set<number>([correctAnswer]);
  const range = difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 20 : 30;

  while (options.size < 4) {
    const offset = Math.floor(Math.random() * range) - Math.floor(range / 2);
    const wrongAnswer = correctAnswer + offset;
    if (wrongAnswer !== correctAnswer && wrongAnswer >= 0) {
      options.add(wrongAnswer);
    }
  }

  // Shuffle options
  return Array.from(options).sort(() => Math.random() - 0.5);
}

/**
 * Generate multiple math questions
 */
export function generateQuestions(config: QuizConfig): MathQuestion[] {
  const questions: MathQuestion[] = [];

  for (let i = 0; i < config.questionCount; i++) {
    const operation = config.operations
      ? config.operations[Math.floor(Math.random() * config.operations.length)]
      : undefined;

    questions.push(generateMathQuestion(i + 1, operation, config.difficulty));
  }

  return questions;
}

/**
 * Validate an answer
 */
export function validateAnswer(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer.trim() === correctAnswer.trim();
}

/**
 * Calculate quiz score
 */
export function calculateQuizScore(
  correctAnswers: number,
  totalQuestions: number,
  timeTaken: number,
  timeLimit?: number
): number {
  const accuracy = (correctAnswers / totalQuestions) * 100;
  let timeBonus = 0;

  if (timeLimit) {
    const timeInSeconds = timeTaken / 1000;
    const timeRemaining = timeLimit - timeInSeconds;
    if (timeRemaining > 0) {
      timeBonus = (timeRemaining / timeLimit) * 10;
    }
  }

  return Math.min(100, Math.round(accuracy + timeBonus));
}

/**
 * Get difficulty color for UI
 */
export function getDifficultyColor(difficulty: MathDifficultyLevel): string {
  switch (difficulty) {
    case 'Easy':
      return 'text-green-600';
    case 'Medium':
      return 'text-yellow-600';
    case 'Hard':
      return 'text-orange-600';
    case 'Expert':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get operation symbol emoji
 */
export function getOperationEmoji(operation: MathOperation): string {
  const emojis: Record<MathOperation, string> = {
    '+': '➕',
    '-': '➖',
    '*': '✖️',
    '/': '➗'
  };
  return emojis[operation] || '🔢';
}

/**
 * Format time in seconds to readable string
 */
export function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Get performance rating
 */
export function getPerformanceRating(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Great';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Practice';
}

/**
 * Get grade based on score
 */
export function getGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 55) return 'C';
  if (score >= 50) return 'C-';
  return 'F';
}

/**
 * Shuffle array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate explanation for an answer
 */
export function generateExplanation(question: MathQuestion): string {
  const parts = question.q.split(' ');
  const a = parseInt(parts[0]);
  const op = parts[1];
  const b = parseInt(parts[2]);
  const ans = parseInt(question.ans);

  switch (op) {
    case '+':
      return `${a} plus ${b} equals ${ans}`;
    case '-':
      return `${a} minus ${b} equals ${ans}`;
    case '*':
      return `${a} multiplied by ${b} equals ${ans}`;
    case '/':
      return `${a} divided by ${b} equals ${ans}`;
    default:
      return `The answer is ${ans}`;
  }
}

/**
 * Validate quiz configuration
 */
export function validateQuizConfig(config: Partial<QuizConfig>): QuizConfig {
  return {
    questionCount: Math.min(Math.max(config.questionCount || 10, 1), 50),
    difficulty: config.difficulty || 'Easy',
    operations: config.operations || ['+', '-', '*'],
    timeLimit: config.timeLimit && config.timeLimit > 0 ? config.timeLimit : undefined,
    questionType: config.questionType || 'basic'
  };
}

/**
 * Get recommended difficulty based on past performance
 */
export function getRecommendedDifficulty(averageScore: number): MathDifficultyLevel {
  if (averageScore >= 90) return 'Expert';
  if (averageScore >= 75) return 'Hard';
  if (averageScore >= 60) return 'Medium';
  return 'Easy';
}
