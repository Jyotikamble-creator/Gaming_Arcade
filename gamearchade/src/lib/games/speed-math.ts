import type { 
  ISpeedMathProblem,
  SpeedMathOperation,
  SpeedMathDifficulty,
  SpeedMathProblemRequest,
  SpeedMathBatchRequest,
  SpeedMathBatchResponse,
  SpeedMathValidationRequest,
  SpeedMathValidationResponse,
  ISpeedMathSession,
  ISpeedMathConfig
} from '@/types/games/speed-math';
import { 
  generateUniqueId,
  calculateSpeedMathPoints,
  getDifficultyConfig,
  selectRandomOperation
} from '@/utility/games/speed-math';

/**
 * Generate a single speed math problem
 * @param request - Problem generation parameters
 * @returns Generated math problem
 */
export function generateSpeedMathProblem(request: SpeedMathProblemRequest = {}): ISpeedMathProblem {
  const { difficulty = 'medium', operations, timeLimit } = request;
  const config = getDifficultyConfig(difficulty);
  
  // Select operation
  const availableOps = operations || config.operations;
  const operation = selectRandomOperation(availableOps);
  
  let operand1: number, operand2: number, answer: number;

  switch (operation) {
    case '+':
      [operand1, operand2] = generateAdditionProblem(difficulty);
      answer = operand1 + operand2;
      break;
    case '-':
      [operand1, operand2] = generateSubtractionProblem(difficulty);
      answer = operand1 - operand2;
      break;
    case '*':
      [operand1, operand2] = generateMultiplicationProblem(difficulty);
      answer = operand1 * operand2;
      break;
    case '/':
      [operand1, operand2, answer] = generateDivisionProblem(difficulty);
      break;
    case '^':
      [operand1, operand2] = generateExponentProblem(difficulty);
      answer = Math.pow(operand1, operand2);
      break;
    case '√':
      [operand1, operand2] = generateSquareRootProblem(difficulty);
      answer = operand2; // operand2 is the answer for sqrt
      break;
    default:
      [operand1, operand2] = generateAdditionProblem(difficulty);
      answer = operand1 + operand2;
  }

  const question = operation === '√' ? `√${operand1}` : `${operand1} ${operation} ${operand2}`;

  return {
    question,
    answer,
    operation,
    operand1,
    operand2,
    difficulty,
    timeLimit: timeLimit || config.timeLimit,
    points: calculateSpeedMathPoints(difficulty, operation)
  };
}

/**
 * Generate multiple speed math problems
 * @param request - Batch generation parameters
 * @returns Batch of math problems
 */
export function generateSpeedMathBatch(request: SpeedMathBatchRequest): SpeedMathBatchResponse {
  const { difficulty = 'medium', count = 10, operations } = request;
  const problems: ISpeedMathProblem[] = [];
  const sessionId = generateUniqueId();

  for (let i = 0; i < count; i++) {
    const problem = generateSpeedMathProblem({ difficulty, operations });
    problems.push(problem);
  }

  return {
    problems,
    difficulty,
    count,
    sessionId
  };
}

/**
 * Validate speed math answer
 * @param request - Validation parameters
 * @returns Validation result with scoring
 */
export function validateSpeedMathAnswer(request: SpeedMathValidationRequest): SpeedMathValidationResponse {
  const { question, userAnswer, correctAnswer, timeElapsed = 0 } = request;
  
  const isCorrect = parseInt(userAnswer.toString()) === parseInt(correctAnswer.toString());
  const points = isCorrect ? calculateSpeedMathPoints('medium', '+') : 0; // Basic points calculation
  
  // Calculate time bonus/penalty
  let timeBonus = 0;
  if (isCorrect && timeElapsed > 0) {
    // Faster answers get bonus points
    if (timeElapsed <= 3) timeBonus = 10;
    else if (timeElapsed <= 5) timeBonus = 5;
    else if (timeElapsed <= 10) timeBonus = 2;
  }

  return {
    isCorrect,
    userAnswer: parseInt(userAnswer.toString()),
    correctAnswer: parseInt(correctAnswer.toString()),
    question,
    timeElapsed,
    points: points + timeBonus
  };
}

/**
 * Create a new speed math session
 * @param config - Game configuration
 * @param userId - Optional user ID
 * @param playerName - Optional player name
 * @returns New game session
 */
export function createSpeedMathSession(
  config: ISpeedMathConfig,
  userId?: string,
  playerName?: string
): ISpeedMathSession {
  const sessionId = generateUniqueId();

  return {
    sessionId,
    userId,
    playerName,
    difficulty: config.difficulty,
    startTime: new Date(),
    totalQuestions: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    totalScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageTime: 0,
    timeElapsed: 0,
    isCompleted: false,
    problems: [],
    answers: []
  };
}

// Helper functions for problem generation

function generateAdditionProblem(difficulty: SpeedMathDifficulty): [number, number] {
  switch (difficulty) {
    case 'easy':
      return [
        Math.floor(Math.random() * 20) + 1,
        Math.floor(Math.random() * 20) + 1
      ];
    case 'medium':
      return [
        Math.floor(Math.random() * 50) + 1,
        Math.floor(Math.random() * 50) + 1
      ];
    case 'hard':
      return [
        Math.floor(Math.random() * 100) + 50,
        Math.floor(Math.random() * 100) + 50
      ];
    case 'expert':
      return [
        Math.floor(Math.random() * 500) + 100,
        Math.floor(Math.random() * 500) + 100
      ];
    default:
      return [Math.floor(Math.random() * 50) + 1, Math.floor(Math.random() * 50) + 1];
  }
}

function generateSubtractionProblem(difficulty: SpeedMathDifficulty): [number, number] {
  let a: number, b: number;
  
  switch (difficulty) {
    case 'easy':
      a = Math.floor(Math.random() * 30) + 10;
      b = Math.floor(Math.random() * a) + 1;
      break;
    case 'medium':
      a = Math.floor(Math.random() * 100) + 20;
      b = Math.floor(Math.random() * a) + 1;
      break;
    case 'hard':
      a = Math.floor(Math.random() * 200) + 50;
      b = Math.floor(Math.random() * a) + 1;
      break;
    case 'expert':
      a = Math.floor(Math.random() * 1000) + 100;
      b = Math.floor(Math.random() * a) + 1;
      break;
    default:
      a = Math.floor(Math.random() * 100) + 20;
      b = Math.floor(Math.random() * a) + 1;
  }
  
  return [a, b];
}

function generateMultiplicationProblem(difficulty: SpeedMathDifficulty): [number, number] {
  switch (difficulty) {
    case 'easy':
      return [
        Math.floor(Math.random() * 10) + 1,
        Math.floor(Math.random() * 10) + 1
      ];
    case 'medium':
      return [
        Math.floor(Math.random() * 12) + 1,
        Math.floor(Math.random() * 12) + 1
      ];
    case 'hard':
      return [
        Math.floor(Math.random() * 20) + 5,
        Math.floor(Math.random() * 20) + 5
      ];
    case 'expert':
      return [
        Math.floor(Math.random() * 50) + 10,
        Math.floor(Math.random() * 25) + 5
      ];
    default:
      return [Math.floor(Math.random() * 12) + 1, Math.floor(Math.random() * 12) + 1];
  }
}

function generateDivisionProblem(difficulty: SpeedMathDifficulty): [number, number, number] {
  let divisor: number, answer: number, dividend: number;
  
  switch (difficulty) {
    case 'easy':
      divisor = Math.floor(Math.random() * 10) + 2;
      answer = Math.floor(Math.random() * 10) + 1;
      break;
    case 'medium':
      divisor = Math.floor(Math.random() * 12) + 2;
      answer = Math.floor(Math.random() * 15) + 1;
      break;
    case 'hard':
      divisor = Math.floor(Math.random() * 20) + 3;
      answer = Math.floor(Math.random() * 25) + 1;
      break;
    case 'expert':
      divisor = Math.floor(Math.random() * 50) + 5;
      answer = Math.floor(Math.random() * 50) + 1;
      break;
    default:
      divisor = Math.floor(Math.random() * 12) + 2;
      answer = Math.floor(Math.random() * 15) + 1;
  }
  
  dividend = divisor * answer;
  return [dividend, divisor, answer];
}

function generateExponentProblem(difficulty: SpeedMathDifficulty): [number, number] {
  switch (difficulty) {
    case 'easy':
      return [
        Math.floor(Math.random() * 5) + 2,
        Math.floor(Math.random() * 3) + 2
      ];
    case 'medium':
      return [
        Math.floor(Math.random() * 8) + 2,
        Math.floor(Math.random() * 4) + 2
      ];
    case 'hard':
      return [
        Math.floor(Math.random() * 12) + 2,
        Math.floor(Math.random() * 4) + 2
      ];
    case 'expert':
      return [
        Math.floor(Math.random() * 15) + 3,
        Math.floor(Math.random() * 5) + 2
      ];
    default:
      return [Math.floor(Math.random() * 8) + 2, Math.floor(Math.random() * 4) + 2];
  }
}

function generateSquareRootProblem(difficulty: SpeedMathDifficulty): [number, number] {
  let base: number;
  
  switch (difficulty) {
    case 'easy':
      base = Math.floor(Math.random() * 5) + 1; // 1-5
      break;
    case 'medium':
      base = Math.floor(Math.random() * 10) + 1; // 1-10
      break;
    case 'hard':
      base = Math.floor(Math.random() * 15) + 1; // 1-15
      break;
    case 'expert':
      base = Math.floor(Math.random() * 20) + 1; // 1-20
      break;
    default:
      base = Math.floor(Math.random() * 10) + 1;
  }
  
  const square = base * base;
  return [square, base]; // [square, square_root]
}