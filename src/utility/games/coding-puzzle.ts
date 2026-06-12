// Game-specific utility functions for Coding Puzzle
import { Puzzle, PuzzleWithId, PuzzleCategory, DifficultyLevel } from '@/types/games/coding-puzzle';

/**
 * Puzzle bank for Coding Puzzle game
 * Organized by category
 */
export const PUZZLE_CATEGORIES = {
  patterns: [
    {
      question: "What comes next in the sequence? 2, 4, 8, 16, 32, ?",
      answer: "64",
      hint: "Each number is multiplied by 2",
      difficulty: "easy" as DifficultyLevel,
    },
    {
      question: "Complete the pattern: 1, 1, 2, 3, 5, 8, 13, ?",
      answer: "21",
      hint: "Fibonacci sequence - add previous two numbers",
      difficulty: "medium" as DifficultyLevel,
    },
    {
      question: "What's next? 100, 90, 81, 73, 66, ?",
      answer: "60",
      hint: "Subtract 10, then 9, then 8, then 7, then 6...",
      difficulty: "medium" as DifficultyLevel,
    },
    {
      question: "Find the missing number: 3, 9, 27, 81, ?",
      answer: "243",
      hint: "Each number is multiplied by 3",
      difficulty: "easy" as DifficultyLevel,
    },
    {
      question: "Continue the sequence: 1, 4, 9, 16, 25, ?",
      answer: "36",
      hint: "Perfect squares: 1², 2², 3², 4², 5², ?",
      difficulty: "easy" as DifficultyLevel,
    },
  ],

  codeOutput: [
    {
      question: "What does this print?\nfor i in range(3):\n    print(i * 2)",
      answer: "0 2 4",
      hint: "Loop runs 3 times (0,1,2), each multiplied by 2",
      difficulty: "easy" as DifficultyLevel,
    },
    {
      question: "What's the output?\nx = 5\ny = x + 3\nprint(x * y)",
      answer: "40",
      hint: "x=5, y=8, so 5*8=40",
      difficulty: "easy" as DifficultyLevel,
    },
    {
      question: "Predict the result:\nlist = [1, 2, 3]\nprint(list[1] + list[2])",
      answer: "5",
      hint: "Index 1 is 2, index 2 is 3. 2+3=5",
      difficulty: "easy" as DifficultyLevel,
    },
    {
      question: "What prints?\ncount = 0\nfor i in range(5):\n    if i % 2 == 0:\n        count += 1\nprint(count)",
      answer: "3",
      hint: "Count even numbers: 0, 2, 4 (3 total)",
      difficulty: "medium" as DifficultyLevel,
    },
    {
      question: "Output?\nresult = 1\nfor i in range(1, 4):\n    result *= i\nprint(result)",
      answer: "6",
      hint: "Factorial: 1*1*2*3=6",
      difficulty: "medium" as DifficultyLevel,
    },
  ],

  logic: [
    {
      question: "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?",
      answer: "yes",
      hint: "Follow the chain: Bloops → Razzies → Lazzies",
      difficulty: "easy" as DifficultyLevel,
    },
    {
      question: "A bat and ball cost $1.10. The bat costs $1 more than the ball. How much does the ball cost? (in cents)",
      answer: "5",
      hint: "If ball = x, bat = x+100, so x + x+100 = 110",
      difficulty: "hard" as DifficultyLevel,
    },
    {
      question: "How many times can you subtract 10 from 100?",
      answer: "1",
      hint: "After first subtraction, it's not 100 anymore",
      difficulty: "easy" as DifficultyLevel,
    },
    {
      question: "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
      answer: "5",
      hint: "Each machine makes 1 widget in 5 minutes",
      difficulty: "medium" as DifficultyLevel,
    },
    {
      question: "What's the minimum number of cuts needed to divide a cake into 8 equal pieces?",
      answer: "3",
      hint: "Cut vertically twice (4 pieces), then horizontally once",
      difficulty: "medium" as DifficultyLevel,
    },
  ],

  bitwise: [
    {
      question: "What is 5 & 3 in binary operation? (AND operation)",
      answer: "1",
      hint: "5=101, 3=011, AND gives 001 = 1",
      difficulty: "hard" as DifficultyLevel,
    },
    {
      question: "What is 6 | 3 in binary operation? (OR operation)",
      answer: "7",
      hint: "6=110, 3=011, OR gives 111 = 7",
      difficulty: "hard" as DifficultyLevel,
    },
    {
      question: "What is 5 ^ 3 in binary operation? (XOR operation)",
      answer: "6",
      hint: "5=101, 3=011, XOR gives 110 = 6",
      difficulty: "hard" as DifficultyLevel,
    },
    {
      question: "What is 8 >> 2? (Right shift by 2)",
      answer: "2",
      hint: "8=1000, shift right by 2 gives 10 = 2",
      difficulty: "hard" as DifficultyLevel,
    },
    {
      question: "What is 3 << 2? (Left shift by 2)",
      answer: "12",
      hint: "3=11, shift left by 2 gives 1100 = 12",
      difficulty: "hard" as DifficultyLevel,
    },
  ],
};

/**
 * Get random puzzle from a specific category
 */
export function getRandomPuzzle(category: PuzzleCategory): PuzzleWithId {
  const puzzles = PUZZLE_CATEGORIES[category];
  const randomIndex = Math.floor(Math.random() * puzzles.length);
  const puzzle = puzzles[randomIndex];

  return {
    id: `${category}_${randomIndex}`,
    ...puzzle,
    category,
    points: getDifficultyPoints(puzzle.difficulty),
    timeLimit: getDifficultyTimeLimit(puzzle.difficulty),
  };
}

/**
 * Get all available categories
 */
export function getAllCategories() {
  return Object.keys(PUZZLE_CATEGORIES).map((key) => ({
    id: key as PuzzleCategory,
    name: formatCategoryName(key),
    count: PUZZLE_CATEGORIES[key as PuzzleCategory].length,
    description: getCategoryDescription(key as PuzzleCategory),
  }));
}

/**
 * Get puzzles by difficulty
 */
export function getPuzzlesByDifficulty(
  category: PuzzleCategory,
  difficulty: DifficultyLevel
): PuzzleWithId[] {
  const puzzles = PUZZLE_CATEGORIES[category];
  return puzzles
    .filter((p) => p.difficulty === difficulty)
    .map((p, index) => ({
      id: `${category}_${difficulty}_${index}`,
      ...p,
      category,
      points: getDifficultyPoints(p.difficulty),
      timeLimit: getDifficultyTimeLimit(p.difficulty),
    }));
}

/**
 * Get difficulty-based points
 */
function getDifficultyPoints(difficulty: DifficultyLevel): number {
  const points: Record<DifficultyLevel, number> = {
    easy: 10,
    medium: 20,
    hard: 30,
  };
  return points[difficulty];
}

/**
 * Get difficulty-based time limit
 */
function getDifficultyTimeLimit(difficulty: DifficultyLevel): number {
  const timeLimit: Record<DifficultyLevel, number> = {
    easy: 30,
    medium: 60,
    hard: 90,
  };
  return timeLimit[difficulty];
}

/**
 * Format category name for display
 */
function formatCategoryName(category: string): string {
  const names: Record<string, string> = {
    patterns: 'Pattern Recognition',
    codeOutput: 'Code Output',
    logic: 'Logic Puzzles',
    bitwise: 'Bitwise Operations',
  };
  return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Get category description
 */
function getCategoryDescription(category: PuzzleCategory): string {
  const descriptions: Record<PuzzleCategory, string> = {
    patterns: 'Find patterns and complete sequences',
    codeOutput: 'Predict what code will output',
    logic: 'Solve logical reasoning problems',
    bitwise: 'Master binary operations',
  };
  return descriptions[category];
}

/**
 * Validate if category exists
 */
export function isValidCategory(category: string): category is PuzzleCategory {
  return category in PUZZLE_CATEGORIES;
}

/**
 * Get total puzzle count
 */
export function getTotalPuzzleCount(): number {
  return Object.values(PUZZLE_CATEGORIES).reduce(
    (total, puzzles) => total + puzzles.length,
    0
  );
}

/**
 * Get puzzle count by category
 */
export function getPuzzleCountByCategory(): Record<PuzzleCategory, number> {
  return {
    patterns: PUZZLE_CATEGORIES.patterns.length,
    codeOutput: PUZZLE_CATEGORIES.codeOutput.length,
    logic: PUZZLE_CATEGORIES.logic.length,
    bitwise: PUZZLE_CATEGORIES.bitwise.length,
  };
}

/**
 * Shuffle puzzles array
 */
export function shufflePuzzles(puzzles: PuzzleWithId[]): PuzzleWithId[] {
  const shuffled = [...puzzles];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
