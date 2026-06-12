import type { 
  SpeedMathDifficulty,
  SpeedMathOperation,
  ISpeedMathConfig,
  ISpeedMathStats
} from '@/types/games/speed-math';

/**
 * Generate a unique session ID for speed math
 * @returns Unique identifier string
 */
export function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `speedmath_${timestamp}_${random}`;
}

/**
 * Calculate points for a speed math problem
 * @param difficulty - Problem difficulty
 * @param operation - Math operation
 * @returns Base points for the problem
 */
export function calculateSpeedMathPoints(
  difficulty: SpeedMathDifficulty,
  operation: SpeedMathOperation
): number {
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2,
    expert: 3
  };
  
  const operationMultiplier = {
    '+': 1,
    '-': 1.1,
    '*': 1.3,
    '/': 1.5,
    '^': 2,
    '√': 1.8
  };
  
  const basePoints = 10;
  return Math.round(
    basePoints * 
    difficultyMultiplier[difficulty] * 
    operationMultiplier[operation]
  );
}

/**
 * Get difficulty configuration
 * @param difficulty - Difficulty level
 * @returns Configuration for the difficulty
 */
export function getDifficultyConfig(difficulty: SpeedMathDifficulty): ISpeedMathConfig {
  const configs = {
    easy: {
      difficulty: 'easy' as SpeedMathDifficulty,
      operations: ['+', '-'] as SpeedMathOperation[],
      timeLimit: 30,
      questionCount: 10,
      enableStreak: true,
      enableTimer: true,
      pointsPerCorrect: 10,
      streakBonus: 5
    },
    medium: {
      difficulty: 'medium' as SpeedMathDifficulty,
      operations: ['+', '-', '*'] as SpeedMathOperation[],
      timeLimit: 25,
      questionCount: 15,
      enableStreak: true,
      enableTimer: true,
      pointsPerCorrect: 15,
      streakBonus: 8
    },
    hard: {
      difficulty: 'hard' as SpeedMathDifficulty,
      operations: ['+', '-', '*', '/'] as SpeedMathOperation[],
      timeLimit: 20,
      questionCount: 20,
      enableStreak: true,
      enableTimer: true,
      pointsPerCorrect: 20,
      streakBonus: 10
    },
    expert: {
      difficulty: 'expert' as SpeedMathDifficulty,
      operations: ['+', '-', '*', '/', '^', '√'] as SpeedMathOperation[],
      timeLimit: 15,
      questionCount: 25,
      enableStreak: true,
      enableTimer: true,
      pointsPerCorrect: 30,
      streakBonus: 15
    }
  };
  
  return configs[difficulty];
}

/**
 * Select random operation from available operations
 * @param operations - Available operations
 * @returns Randomly selected operation
 */
export function selectRandomOperation(operations: SpeedMathOperation[]): SpeedMathOperation {
  const randomIndex = Math.floor(Math.random() * operations.length);
  return operations[randomIndex];
}

/**
 * Get operation symbol display name
 * @param operation - Math operation
 * @returns Human readable operation name
 */
export function getOperationDisplayName(operation: SpeedMathOperation): string {
  const names = {
    '+': 'Addition',
    '-': 'Subtraction',
    '*': 'Multiplication',
    '/': 'Division',
    '^': 'Exponentiation',
    '√': 'Square Root'
  };
  
  return names[operation];
}

/**
 * Get difficulty color for UI display
 * @param difficulty - Difficulty level
 * @returns CSS color class or hex color
 */
export function getDifficultyColor(difficulty: SpeedMathDifficulty): string {
  const colors = {
    easy: '#22C55E',     // Green
    medium: '#3B82F6',   // Blue
    hard: '#F59E0B',     // Amber
    expert: '#DC2626'    // Red
  };
  
  return colors[difficulty];
}

/**
 * Get difficulty emoji for display
 * @param difficulty - Difficulty level
 * @returns Emoji representing difficulty
 */
export function getDifficultyEmoji(difficulty: SpeedMathDifficulty): string {
  const emojis = {
    easy: '🟢',
    medium: '🔵',
    hard: '🟡',
    expert: '🔴'
  };
  
  return emojis[difficulty];
}

/**
 * Get operation emoji for display
 * @param operation - Math operation
 * @returns Emoji representing operation
 */
export function getOperationEmoji(operation: SpeedMathOperation): string {
  const emojis = {
    '+': '➕',
    '-': '➖',
    '*': '✖️',
    '/': '➗',
    '^': '🔺',
    '√': '√'
  };
  
  return emojis[operation];
}

/**
 * Format time in human readable format
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate accuracy percentage
 * @param correct - Number of correct answers
 * @param total - Total number of answers
 * @returns Accuracy percentage
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Calculate questions per minute
 * @param questions - Number of questions answered
 * @param timeInSeconds - Time taken in seconds
 * @returns Questions per minute
 */
export function calculateQuestionsPerMinute(questions: number, timeInSeconds: number): number {
  if (timeInSeconds === 0) return 0;
  return Math.round((questions / timeInSeconds) * 60);
}

/**
 * Get performance rating based on accuracy and speed
 * @param accuracy - Accuracy percentage
 * @param qpm - Questions per minute
 * @returns Performance rating
 */
export function getPerformanceRating(accuracy: number, qpm: number): string {
  if (accuracy >= 95 && qpm >= 20) return 'Math Genius';
  if (accuracy >= 90 && qpm >= 15) return 'Expert';
  if (accuracy >= 80 && qpm >= 10) return 'Advanced';
  if (accuracy >= 70 && qpm >= 8) return 'Intermediate';
  if (accuracy >= 60 && qpm >= 5) return 'Beginner';
  return 'Novice';
}

/**
 * Get streak bonus multiplier
 * @param streak - Current streak count
 * @returns Bonus multiplier
 */
export function getStreakMultiplier(streak: number): number {
  if (streak >= 20) return 3;
  if (streak >= 15) return 2.5;
  if (streak >= 10) return 2;
  if (streak >= 5) return 1.5;
  return 1;
}

/**
 * Calculate time bonus points
 * @param timeElapsed - Time taken to answer
 * @param timeLimit - Maximum time allowed
 * @returns Bonus points for speed
 */
export function calculateTimeBonus(timeElapsed: number, timeLimit: number): number {
  if (timeElapsed >= timeLimit) return 0;
  
  const speedRatio = (timeLimit - timeElapsed) / timeLimit;
  return Math.round(speedRatio * 10); // Max 10 bonus points
}

/**
 * Validate math expression answer
 * @param expression - Math expression string
 * @param answer - User's answer
 * @returns True if answer is correct
 */
export function validateMathAnswer(expression: string, answer: number): boolean {
  try {
    // Parse and evaluate the expression safely
    const result = evaluateMathExpression(expression);
    return Math.abs(result - answer) < 0.001; // Allow for floating point errors
  } catch {
    return false;
  }
}

/**
 * Safely evaluate math expression
 * @param expression - Math expression string
 * @returns Calculated result
 */
export function evaluateMathExpression(expression: string): number {
  // Remove whitespace and validate characters
  const cleanExpression = expression.replace(/\s/g, '');
  const validChars = /^[0-9+\-*/^√().\s]+$/;
  
  if (!validChars.test(cleanExpression)) {
    throw new Error('Invalid characters in expression');
  }
  
  // Handle square root
  let processedExpression = cleanExpression.replace(/√(\d+)/g, 'Math.sqrt($1)');
  
  // Handle exponentiation
  processedExpression = processedExpression.replace(/(\d+)\^(\d+)/g, 'Math.pow($1,$2)');
  
  // Evaluate safely (Note: In production, use a proper math parser)
  return Function(`"use strict"; return (${processedExpression})`)();
}

/**
 * Generate hint for math problem
 * @param operand1 - First operand
 * @param operand2 - Second operand
 * @param operation - Math operation
 * @returns Helpful hint string
 */
export function generateMathHint(
  operand1: number, 
  operand2: number, 
  operation: SpeedMathOperation
): string {
  switch (operation) {
    case '+':
      return `Think: ${operand1} + ${operand2} = ?`;
    case '-':
      return `Think: ${operand1} - ${operand2} = ?`;
    case '*':
      return `Think: ${operand1} times ${operand2} = ?`;
    case '/':
      return `Think: ${operand1} divided by ${operand2} = ?`;
    case '^':
      return `Think: ${operand1} to the power of ${operand2} = ?`;
    case '√':
      return `Think: What number multiplied by itself equals ${operand1}?`;
    default:
      return `Solve: ${operand1} ${operation} ${operand2}`;
  }
}

/**
 * Get recommended difficulty based on performance
 * @param accuracy - Current accuracy percentage
 * @param averageTime - Average time per question
 * @param currentDifficulty - Current difficulty level
 * @returns Recommended difficulty level
 */
export function getRecommendedDifficulty(
  accuracy: number,
  averageTime: number,
  currentDifficulty: SpeedMathDifficulty
): SpeedMathDifficulty {
  // If accuracy is high and time is fast, suggest harder difficulty
  if (accuracy >= 90 && averageTime <= 5) {
    const levels: SpeedMathDifficulty[] = ['easy', 'medium', 'hard', 'expert'];
    const currentIndex = levels.indexOf(currentDifficulty);
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  }
  
  // If accuracy is low, suggest easier difficulty
  if (accuracy < 60) {
    const levels: SpeedMathDifficulty[] = ['easy', 'medium', 'hard', 'expert'];
    const currentIndex = levels.indexOf(currentDifficulty);
    return levels[Math.max(currentIndex - 1, 0)];
  }
  
  return currentDifficulty;
}