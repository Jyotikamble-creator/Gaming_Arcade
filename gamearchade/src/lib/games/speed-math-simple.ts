// Speed Math Game with Difficulty Levels
export type SpeedMathDifficulty = 'easy' | 'medium' | 'hard';

export interface MathProblem {
  id: string;
  question: string;
  answer: number;
  difficulty: SpeedMathDifficulty;
  operation: '+' | '-' | '*';
  num1: number;
  num2: number;
}

export interface MathProblemSet {
  difficulty: SpeedMathDifficulty;
  theme: string;
  problems: MathProblem[];
}

export const MATH_PROBLEM_SETS: Record<SpeedMathDifficulty, MathProblemSet> = {
  easy: {
    difficulty: 'easy',
    theme: '🌱 Beginner',
    problems: [
      { id: 'easy_1', question: '5 + 3 = ?', answer: 8, difficulty: 'easy', operation: '+', num1: 5, num2: 3 },
      { id: 'easy_2', question: '12 - 7 = ?', answer: 5, difficulty: 'easy', operation: '-', num1: 12, num2: 7 },
      { id: 'easy_3', question: '8 + 6 = ?', answer: 14, difficulty: 'easy', operation: '+', num1: 8, num2: 6 },
      { id: 'easy_4', question: '20 - 8 = ?', answer: 12, difficulty: 'easy', operation: '-', num1: 20, num2: 8 },
      { id: 'easy_5', question: '4 + 9 = ?', answer: 13, difficulty: 'easy', operation: '+', num1: 4, num2: 9 },
      { id: 'easy_6', question: '15 - 6 = ?', answer: 9, difficulty: 'easy', operation: '-', num1: 15, num2: 6 },
      { id: 'easy_7', question: '7 + 7 = ?', answer: 14, difficulty: 'easy', operation: '+', num1: 7, num2: 7 },
      { id: 'easy_8', question: '18 - 9 = ?', answer: 9, difficulty: 'easy', operation: '-', num1: 18, num2: 9 },
      { id: 'easy_9', question: '6 + 11 = ?', answer: 17, difficulty: 'easy', operation: '+', num1: 6, num2: 11 },
      { id: 'easy_10', question: '25 - 10 = ?', answer: 15, difficulty: 'easy', operation: '-', num1: 25, num2: 10 },
    ],
  },
  medium: {
    difficulty: 'medium',
    theme: '⚡ Intermediate',
    problems: [
      { id: 'med_1', question: '45 + 28 = ?', answer: 73, difficulty: 'medium', operation: '+', num1: 45, num2: 28 },
      { id: 'med_2', question: '67 - 23 = ?', answer: 44, difficulty: 'medium', operation: '-', num1: 67, num2: 23 },
      { id: 'med_3', question: '12 × 3 = ?', answer: 36, difficulty: 'medium', operation: '*', num1: 12, num2: 3 },
      { id: 'med_4', question: '89 - 34 = ?', answer: 55, difficulty: 'medium', operation: '-', num1: 89, num2: 34 },
      { id: 'med_5', question: '56 + 37 = ?', answer: 93, difficulty: 'medium', operation: '+', num1: 56, num2: 37 },
      { id: 'med_6', question: '8 × 6 = ?', answer: 48, difficulty: 'medium', operation: '*', num1: 8, num2: 6 },
      { id: 'med_7', question: '73 - 45 = ?', answer: 28, difficulty: 'medium', operation: '-', num1: 73, num2: 45 },
      { id: 'med_8', question: '34 + 58 = ?', answer: 92, difficulty: 'medium', operation: '+', num1: 34, num2: 58 },
      { id: 'med_9', question: '11 × 7 = ?', answer: 77, difficulty: 'medium', operation: '*', num1: 11, num2: 7 },
      { id: 'med_10', question: '100 - 47 = ?', answer: 53, difficulty: 'medium', operation: '-', num1: 100, num2: 47 },
    ],
  },
  hard: {
    difficulty: 'hard',
    theme: '🔥 Advanced',
    problems: [
      { id: 'hard_1', question: '234 + 567 = ?', answer: 801, difficulty: 'hard', operation: '+', num1: 234, num2: 567 },
      { id: 'hard_2', question: '789 - 345 = ?', answer: 444, difficulty: 'hard', operation: '-', num1: 789, num2: 345 },
      { id: 'hard_3', question: '23 × 15 = ?', answer: 345, difficulty: 'hard', operation: '*', num1: 23, num2: 15 },
      { id: 'hard_4', question: '567 - 234 = ?', answer: 333, difficulty: 'hard', operation: '-', num1: 567, num2: 234 },
      { id: 'hard_5', question: '456 + 378 = ?', answer: 834, difficulty: 'hard', operation: '+', num1: 456, num2: 378 },
      { id: 'hard_6', question: '19 × 12 = ?', answer: 228, difficulty: 'hard', operation: '*', num1: 19, num2: 12 },
      { id: 'hard_7', question: '876 - 289 = ?', answer: 587, difficulty: 'hard', operation: '-', num1: 876, num2: 289 },
      { id: 'hard_8', question: '345 + 679 = ?', answer: 1024, difficulty: 'hard', operation: '+', num1: 345, num2: 679 },
      { id: 'hard_9', question: '21 × 14 = ?', answer: 294, difficulty: 'hard', operation: '*', num1: 21, num2: 14 },
      { id: 'hard_10', question: '999 - 456 = ?', answer: 543, difficulty: 'hard', operation: '-', num1: 999, num2: 456 },
    ],
  },
};

/**
 * Get a random problem from specified difficulty level
 */
export function getRandomProblemByDifficulty(difficulty: SpeedMathDifficulty) {
  const problemSet = MATH_PROBLEM_SETS[difficulty];
  if (!problemSet) {
    console.error(`[SPEED_MATH] Invalid difficulty: ${difficulty}`);
    return getRandomProblemByDifficulty('medium');
  }

  const problems = problemSet.problems;
  if (!problems || problems.length === 0) {
    console.error(`[SPEED_MATH] No problems found for difficulty: ${difficulty}`);
    return {
      id: 'default',
      question: '1 + 1 = ?',
      answer: 2,
      difficulty,
      operation: '+' as const,
      num1: 1,
      num2: 1,
    };
  }

  return problems[Math.floor(Math.random() * problems.length)];
}

/**
 * Get 5 unique problems for a round
 */
export function getProblemSequenceForRound(difficulty: SpeedMathDifficulty, count: number = 5) {
  const problemSet = MATH_PROBLEM_SETS[difficulty];
  if (!problemSet) {
    console.error(`[SPEED_MATH] Invalid difficulty: ${difficulty}`);
    return [];
  }

  const problems = [...problemSet.problems];
  const selectedProblems = [];
  const actualCount = Math.min(count, problems.length);

  for (let i = 0; i < actualCount; i++) {
    const randomIndex = Math.floor(Math.random() * problems.length);
    const selectedProblem = problems[randomIndex];

    selectedProblems.push(selectedProblem);
    problems.splice(randomIndex, 1);
  }

  return selectedProblems;
}

/**
 * Calculate score based on difficulty, attempts, and time spent
 */
export function calculateSpeedMathScore(
  difficulty: SpeedMathDifficulty,
  attempts: number,
  timeSpentSeconds: number
): number {
  const difficultyMultiplier = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  const multiplier = difficultyMultiplier[difficulty] || 1;
  const baseScore = 100;
  const penaltyPerAttempt = 10;
  const timeBonus = Math.max(0, 30 - timeSpentSeconds) / 3; // Bonus for speed (max 10 on 30s)

  const score = (baseScore * multiplier) - (attempts * penaltyPerAttempt) + timeBonus;

  return Math.max(score, 10);
}

/**
 * Check if an answer is correct
 */
export function validateMathAnswer(userAnswer: string, correctAnswer: number): boolean {
  try {
    const parsed = parseInt(userAnswer.trim(), 10);
    return parsed === correctAnswer;
  } catch {
    return false;
  }
}
