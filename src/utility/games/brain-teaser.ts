// Game-specific utility functions for Brain Teaser
import { Puzzle, PuzzleType, DifficultyLevel } from '@/types/games/brain-teaser';

/**
 * Sample puzzle bank for Brain Teaser game
 * In production, these would come from a database
 */
export const puzzleBank: Puzzle[] = [
  // Match Shape Puzzles (Easy)
  {
    id: 'ms_1',
    type: 'match-shape',
    difficulty: 'easy',
    question: 'Which shape has 4 equal sides?',
    options: ['Triangle', 'Square', 'Pentagon', 'Hexagon'],
    correctAnswer: 'Square',
    points: 10,
    timeLimit: 15,
  },
  {
    id: 'ms_2',
    type: 'match-shape',
    difficulty: 'easy',
    question: 'Which shape has 3 sides?',
    options: ['Circle', 'Triangle', 'Rectangle', 'Octagon'],
    correctAnswer: 'Triangle',
    points: 10,
    timeLimit: 15,
  },
  
  // Find Odd Puzzles (Medium)
  {
    id: 'fo_1',
    type: 'find-odd',
    difficulty: 'medium',
    question: 'Which one is different? 2, 4, 6, 9, 8',
    options: ['2', '4', '9', '8'],
    correctAnswer: '9',
    points: 15,
    timeLimit: 20,
  },
  {
    id: 'fo_2',
    type: 'find-odd',
    difficulty: 'medium',
    question: 'Find the odd one: Apple, Banana, Carrot, Mango',
    options: ['Apple', 'Banana', 'Carrot', 'Mango'],
    correctAnswer: 'Carrot',
    points: 15,
    timeLimit: 20,
  },
  
  // Pattern Puzzles (Hard)
  {
    id: 'pt_1',
    type: 'pattern',
    difficulty: 'hard',
    question: 'Complete the pattern: 2, 4, 8, 16, ?',
    options: ['20', '24', '32', '64'],
    correctAnswer: '32',
    points: 20,
    timeLimit: 30,
  },
  {
    id: 'pt_2',
    type: 'pattern',
    difficulty: 'hard',
    question: 'What comes next? 1, 1, 2, 3, 5, 8, ?',
    options: ['11', '13', '15', '21'],
    correctAnswer: '13',
    points: 20,
    timeLimit: 30,
  },
];

/**
 * Get random puzzle by type
 */
export function getRandomPuzzle(type?: PuzzleType): Puzzle {
  const filtered = type 
    ? puzzleBank.filter(p => p.type === type)
    : puzzleBank;
  
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

/**
 * Get random puzzle by difficulty
 */
export function getPuzzleByDifficulty(difficulty: DifficultyLevel): Puzzle {
  const filtered = puzzleBank.filter(p => p.difficulty === difficulty);
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

/**
 * Get multiple random puzzles
 */
export function getRandomPuzzles(count: number, type?: PuzzleType): Puzzle[] {
  const available = type 
    ? puzzleBank.filter(p => p.type === type)
    : [...puzzleBank];
  
  // Shuffle array
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }
  
  return available.slice(0, Math.min(count, available.length));
}

/**
 * Shuffle options for a puzzle
 */
export function shuffleOptions(options: string[]): string[] {
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get puzzle count by type
 */
export function getPuzzleCountByType(): Record<PuzzleType, number> {
  return {
    'match-shape': puzzleBank.filter(p => p.type === 'match-shape').length,
    'find-odd': puzzleBank.filter(p => p.type === 'find-odd').length,
    'pattern': puzzleBank.filter(p => p.type === 'pattern').length,
  };
}

/**
 * Get puzzle count by difficulty
 */
export function getPuzzleCountByDifficulty(): Record<DifficultyLevel, number> {
  return {
    'easy': puzzleBank.filter(p => p.difficulty === 'easy').length,
    'medium': puzzleBank.filter(p => p.difficulty === 'medium').length,
    'hard': puzzleBank.filter(p => p.difficulty === 'hard').length,
  };
}

/**
 * Validate puzzle structure
 */
export function isValidPuzzle(puzzle: any): puzzle is Puzzle {
  return (
    typeof puzzle === 'object' &&
    typeof puzzle.id === 'string' &&
    ['match-shape', 'find-odd', 'pattern'].includes(puzzle.type) &&
    ['easy', 'medium', 'hard'].includes(puzzle.difficulty) &&
    typeof puzzle.question === 'string' &&
    Array.isArray(puzzle.options) &&
    puzzle.options.length >= 2 &&
    typeof puzzle.correctAnswer === 'string' &&
    typeof puzzle.points === 'number'
  );
}
