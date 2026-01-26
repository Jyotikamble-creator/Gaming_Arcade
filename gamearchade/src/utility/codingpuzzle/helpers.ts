// Enhanced Coding Puzzle utility helpers for GameArchade

import type {
  CodingPuzzleConfig,
  CodingPuzzleItem,
  CodingPuzzleCategoryConfig,
  CodingPuzzleGameStats,
  CodingPuzzleGameState,
  CodingPuzzleCategory,
  CodingPuzzleDifficulty,
  CodingPuzzleLanguage,
  CodingPuzzleAnswerType,
  CodingPuzzleFeedback,
  CodingPuzzleError,
  CodingPuzzlePerformance,
  CodingPuzzleValidationResult,
  CodingPuzzleScoreData,
  CodingPuzzleAnswerValidation,
  CodingPuzzleGameMode
} from "@/types/codingpuzzle/codingpuzzle";

/**
 * Coding Puzzle Game Utilities
 */
export namespace CodingPuzzleHelpers {

  /**
   * Game Constants
   */
  export namespace Constants {
    export const DIFFICULTY_POINTS = {
      easy: 10,
      medium: 20,
      hard: 30,
      expert: 50
    };

    export const BONUS_POINTS = {
      noHint: 5,
      streakMultiplier: 2,
      speedBonus: 10,
      perfectScore: 25
    };

    export const DEFAULT_TOTAL_PUZZLES = 10;

    export const LANGUAGES: CodingPuzzleLanguage[] = [
      'javascript', 'python', 'java', 'csharp', 'cpp', 'typescript', 'pseudocode'
    ];

    export const CATEGORIES: CodingPuzzleCategory[] = [
      'patterns', 'codeOutput', 'logic', 'bitwise', 'algorithms', 'dataStructures', 'debugging', 'optimization'
    ];
  }

  /**
   * Puzzle Data Management
   */
  export namespace Puzzles {
    
    /**
     * Get default puzzle categories with puzzles
     */
    export function getDefaultCategories(): CodingPuzzleCategoryConfig[] {
      return [
        {
          id: 'patterns',
          name: 'Number Patterns',
          description: 'Find the next number in sequences',
          icon: '🔢',
          color: '#3B82F6',
          gradient: 'from-blue-600 to-blue-700',
          unlocked: true,
          difficulty: 'easy',
          puzzles: [
            {
              id: 'patterns-1',
              question: "What comes next in the sequence? 2, 4, 8, 16, 32, ?",
              answer: "64",
              hint: "Each number is multiplied by 2",
              difficulty: 'easy',
              category: 'patterns',
              answerType: 'number',
              points: 10,
              tags: ['sequence', 'multiplication', 'powers'],
              explanation: "This is a geometric sequence where each term is double the previous term.",
              validation: {
                caseSensitive: false,
                trimWhitespace: true,
                allowAlternatives: []
              }
            },
            {
              id: 'patterns-2',
              question: "Complete the pattern: 1, 1, 2, 3, 5, 8, 13, ?",
              answer: "21",
              hint: "Fibonacci sequence - add previous two numbers",
              difficulty: 'medium',
              category: 'patterns',
              answerType: 'number',
              points: 20,
              tags: ['fibonacci', 'addition', 'sequence'],
              explanation: "This is the Fibonacci sequence where each number is the sum of the two preceding ones."
            },
            {
              id: 'patterns-3',
              question: "What's next? 100, 90, 81, 73, 66, ?",
              answer: "60",
              hint: "Subtract 10, then 9, then 8, then 7, then 6...",
              difficulty: 'medium',
              category: 'patterns',
              answerType: 'number',
              points: 20,
              tags: ['arithmetic', 'decreasing', 'pattern'],
              explanation: "Each step subtracts a decreasing number: -10, -9, -8, -7, -6..."
            },
            {
              id: 'patterns-4',
              question: "Find the missing number: 3, 9, 27, 81, ?",
              answer: "243",
              hint: "Each number is multiplied by 3",
              difficulty: 'easy',
              category: 'patterns',
              answerType: 'number',
              points: 10,
              tags: ['powers', 'multiplication', 'geometric'],
              explanation: "This is a geometric sequence with a common ratio of 3."
            },
            {
              id: 'patterns-5',
              question: "Continue the sequence: 1, 4, 9, 16, 25, ?",
              answer: "36",
              hint: "Perfect squares: 1², 2², 3², 4², 5², ?",
              difficulty: 'easy',
              category: 'patterns',
              answerType: 'number',
              points: 10,
              tags: ['squares', 'powers', 'pattern'],
              explanation: "These are perfect squares: 1², 2², 3², 4², 5², 6² = 36"
            }
          ]
        },
        {
          id: 'codeOutput',
          name: 'Code Output',
          description: 'Predict what the code will print',
          icon: '💻',
          color: '#10B981',
          gradient: 'from-green-600 to-green-700',
          unlocked: true,
          difficulty: 'easy',
          puzzles: [
            {
              id: 'output-1',
              question: "What does this print?",
              code: "for i in range(3):\n    print(i * 2)",
              answer: "0 2 4",
              hint: "Loop runs 3 times (0,1,2), each multiplied by 2",
              difficulty: 'easy',
              category: 'codeOutput',
              language: 'python',
              answerType: 'text',
              points: 10,
              tags: ['loops', 'multiplication', 'range'],
              explanation: "The loop iterates through 0, 1, 2 and prints each value multiplied by 2."
            },
            {
              id: 'output-2',
              question: "What's the output?",
              code: "x = 5\ny = x + 3\nprint(x * y)",
              answer: "40",
              hint: "x=5, y=8, so 5*8=40",
              difficulty: 'easy',
              category: 'codeOutput',
              language: 'python',
              answerType: 'number',
              points: 10,
              tags: ['variables', 'arithmetic', 'assignment'],
              explanation: "x is 5, y becomes 8 (5+3), so x*y = 5*8 = 40"
            },
            {
              id: 'output-3',
              question: "Predict the result:",
              code: "list = [1, 2, 3]\nprint(list[1] + list[2])",
              answer: "5",
              hint: "Index 1 is 2, index 2 is 3. 2+3=5",
              difficulty: 'easy',
              category: 'codeOutput',
              language: 'python',
              answerType: 'number',
              points: 10,
              tags: ['arrays', 'indexing', 'addition'],
              explanation: "list[1] is 2, list[2] is 3, so the sum is 5"
            },
            {
              id: 'output-4',
              question: "What prints?",
              code: "count = 0\nfor i in range(5):\n    if i % 2 == 0:\n        count += 1\nprint(count)",
              answer: "3",
              hint: "Count even numbers: 0, 2, 4 (3 total)",
              difficulty: 'medium',
              category: 'codeOutput',
              language: 'python',
              answerType: 'number',
              points: 20,
              tags: ['loops', 'conditionals', 'modulo'],
              explanation: "Counts even numbers in range 0-4: 0, 2, 4 = 3 numbers"
            },
            {
              id: 'output-5',
              question: "Output?",
              code: "result = 1\nfor i in range(1, 4):\n    result *= i\nprint(result)",
              answer: "6",
              hint: "Factorial: 1*1*2*3=6",
              difficulty: 'medium',
              category: 'codeOutput',
              language: 'python',
              answerType: 'number',
              points: 20,
              tags: ['loops', 'multiplication', 'factorial'],
              explanation: "Calculates factorial: 1 * 1 * 2 * 3 = 6"
            }
          ]
        },
        {
          id: 'logic',
          name: 'Logic Puzzles',
          description: 'Solve brain teasers and riddles',
          icon: '🧠',
          color: '#F59E0B',
          gradient: 'from-orange-600 to-orange-700',
          unlocked: true,
          difficulty: 'medium',
          puzzles: [
            {
              id: 'logic-1',
              question: "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?",
              answer: "yes",
              hint: "Follow the chain: Bloops → Razzies → Lazzies",
              difficulty: 'easy',
              category: 'logic',
              answerType: 'text',
              points: 10,
              tags: ['syllogism', 'deduction', 'logic'],
              explanation: "If A→B and B→C, then A→C. This is a valid logical deduction.",
              validation: {
                caseSensitive: false,
                trimWhitespace: true,
                allowAlternatives: ['true', 'correct', 'definitely']
              }
            },
            {
              id: 'logic-2',
              question: "A bat and ball cost $1.10. The bat costs $1 more than the ball. How much does the ball cost? (in cents)",
              answer: "5",
              hint: "If ball = x, bat = x+100, so x + x+100 = 110",
              difficulty: 'hard',
              category: 'logic',
              answerType: 'number',
              points: 30,
              tags: ['algebra', 'word-problem', 'equations'],
              explanation: "Let ball = x cents. Bat = x + 100 cents. Total: x + (x + 100) = 110, so 2x = 10, x = 5 cents."
            },
            {
              id: 'logic-3',
              question: "How many times can you subtract 10 from 100?",
              answer: "1",
              hint: "After first subtraction, it's not 100 anymore",
              difficulty: 'easy',
              category: 'logic',
              answerType: 'number',
              points: 10,
              tags: ['trick-question', 'logic', 'literal'],
              explanation: "You can only subtract 10 from 100 once. After that, you're subtracting from 90."
            },
            {
              id: 'logic-4',
              question: "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
              answer: "5",
              hint: "Each machine makes 1 widget in 5 minutes",
              difficulty: 'medium',
              category: 'logic',
              answerType: 'number',
              points: 20,
              tags: ['ratios', 'proportions', 'rates'],
              explanation: "If 5 machines make 5 widgets in 5 minutes, then 1 machine makes 1 widget in 5 minutes. So 100 machines make 100 widgets in 5 minutes."
            },
            {
              id: 'logic-5',
              question: "What's the minimum number of cuts needed to divide a cake into 8 equal pieces?",
              answer: "3",
              hint: "Cut vertically twice (4 pieces), then horizontally once",
              difficulty: 'medium',
              category: 'logic',
              answerType: 'number',
              points: 20,
              tags: ['geometry', 'optimization', 'spatial'],
              explanation: "Two perpendicular cuts create 4 pieces, then one horizontal cut doubles it to 8 pieces."
            }
          ]
        },
        {
          id: 'bitwise',
          name: 'Bitwise Operations',
          description: 'Binary calculations and shifts',
          icon: '⚡',
          color: '#EF4444',
          gradient: 'from-red-600 to-red-700',
          unlocked: true,
          difficulty: 'hard',
          puzzles: [
            {
              id: 'bitwise-1',
              question: "What is 5 & 3 in binary operation? (AND operation)",
              answer: "1",
              hint: "5=101, 3=011, AND gives 001 = 1",
              difficulty: 'hard',
              category: 'bitwise',
              answerType: 'number',
              points: 30,
              tags: ['bitwise', 'and', 'binary'],
              explanation: "5 in binary is 101, 3 is 011. AND operation: 101 & 011 = 001 = 1",
              examples: [
                {
                  input: "5 = 101, 3 = 011",
                  output: "101 & 011 = 001 = 1"
                }
              ]
            },
            {
              id: 'bitwise-2',
              question: "What is 6 | 3 in binary operation? (OR operation)",
              answer: "7",
              hint: "6=110, 3=011, OR gives 111 = 7",
              difficulty: 'hard',
              category: 'bitwise',
              answerType: 'number',
              points: 30,
              tags: ['bitwise', 'or', 'binary'],
              explanation: "6 in binary is 110, 3 is 011. OR operation: 110 | 011 = 111 = 7"
            },
            {
              id: 'bitwise-3',
              question: "What is 5 ^ 3 in binary operation? (XOR operation)",
              answer: "6",
              hint: "5=101, 3=011, XOR gives 110 = 6",
              difficulty: 'hard',
              category: 'bitwise',
              answerType: 'number',
              points: 30,
              tags: ['bitwise', 'xor', 'binary'],
              explanation: "5 in binary is 101, 3 is 011. XOR operation: 101 ^ 011 = 110 = 6"
            },
            {
              id: 'bitwise-4',
              question: "What is 8 >> 2? (Right shift by 2)",
              answer: "2",
              hint: "8=1000, shift right by 2 gives 10 = 2",
              difficulty: 'hard',
              category: 'bitwise',
              answerType: 'number',
              points: 30,
              tags: ['bitwise', 'shift', 'right-shift'],
              explanation: "8 in binary is 1000. Right shift by 2: 1000 >> 2 = 10 = 2"
            },
            {
              id: 'bitwise-5',
              question: "What is 3 << 2? (Left shift by 2)",
              answer: "12",
              hint: "3=11, shift left by 2 gives 1100 = 12",
              difficulty: 'hard',
              category: 'bitwise',
              answerType: 'number',
              points: 30,
              tags: ['bitwise', 'shift', 'left-shift'],
              explanation: "3 in binary is 11. Left shift by 2: 11 << 2 = 1100 = 12"
            }
          ]
        }
      ];
    }

    /**
     * Get puzzles for a specific category
     */
    export function getPuzzlesForCategory(category: CodingPuzzleCategory): CodingPuzzleItem[] {
      const categories = getDefaultCategories();
      const categoryConfig = categories.find(cat => cat.id === category);
      return categoryConfig?.puzzles || [];
    }

    /**
     * Get random puzzle from category
     */
    export function getRandomPuzzle(
      category: CodingPuzzleCategory,
      usedPuzzles: string[] = [],
      difficulty?: CodingPuzzleDifficulty
    ): CodingPuzzleItem | null {
      const puzzles = getPuzzlesForCategory(category);
      let availablePuzzles = puzzles.filter(puzzle => 
        !usedPuzzles.includes(puzzle.id)
      );

      // Filter by difficulty if specified
      if (difficulty) {
        availablePuzzles = availablePuzzles.filter(puzzle => puzzle.difficulty === difficulty);
      }

      if (availablePuzzles.length === 0) {
        return null;
      }

      return availablePuzzles[Math.floor(Math.random() * availablePuzzles.length)];
    }

    /**
     * Validate puzzle answer
     */
    export function validateAnswer(
      puzzle: CodingPuzzleItem,
      userAnswer: string
    ): CodingPuzzleAnswerValidation {
      const { validation = { caseSensitive: false, trimWhitespace: true, allowAlternatives: [] } } = puzzle;
      
      let normalizedAnswer = userAnswer;
      if (validation.trimWhitespace) {
        normalizedAnswer = normalizedAnswer.trim();
      }
      
      let expectedAnswer = String(puzzle.answer);
      if (!validation.caseSensitive) {
        normalizedAnswer = normalizedAnswer.toLowerCase();
        expectedAnswer = expectedAnswer.toLowerCase();
      }

      // Check exact match
      let isCorrect = normalizedAnswer === expectedAnswer;

      // Check alternatives
      if (!isCorrect && validation.allowAlternatives) {
        const alternatives = validation.allowAlternatives.map(alt => 
          validation.caseSensitive ? alt : alt.toLowerCase()
        );
        isCorrect = alternatives.includes(normalizedAnswer);
      }

      // Calculate partial credit for numeric answers
      let partialCredit = 0;
      if (!isCorrect && puzzle.answerType === 'number') {
        const userNum = parseFloat(normalizedAnswer);
        const expectedNum = parseFloat(expectedAnswer);
        
        if (!isNaN(userNum) && !isNaN(expectedNum)) {
          const difference = Math.abs(userNum - expectedNum);
          const tolerance = expectedNum * 0.1; // 10% tolerance
          
          if (difference <= tolerance) {
            partialCredit = Math.max(0, 1 - (difference / tolerance));
          }
        }
      }

      return {
        isCorrect,
        normalizedAnswer,
        explanation: isCorrect ? puzzle.explanation : undefined,
        partialCredit: partialCredit > 0 ? partialCredit : undefined,
        suggestions: isCorrect ? undefined : generateSuggestions(puzzle, normalizedAnswer)
      };
    }

    /**
     * Generate suggestions for incorrect answers
     */
    function generateSuggestions(puzzle: CodingPuzzleItem, userAnswer: string): string[] {
      const suggestions: string[] = [];
      
      if (puzzle.answerType === 'number') {
        const userNum = parseFloat(userAnswer);
        const expectedNum = parseFloat(String(puzzle.answer));
        
        if (!isNaN(userNum) && !isNaN(expectedNum)) {
          if (userNum > expectedNum) {
            suggestions.push('Your answer is too high');
          } else {
            suggestions.push('Your answer is too low');
          }
        } else if (isNaN(userNum)) {
          suggestions.push('Please enter a valid number');
        }
      }

      return suggestions;
    }
  }

  /**
   * Configuration Management
   */
  export namespace Config {
    /**
     * Create default configuration
     */
    export function createDefaultConfig(overrides: Partial<CodingPuzzleConfig> = {}): CodingPuzzleConfig {
      const defaultConfig: CodingPuzzleConfig = {
        mode: 'single-category',
        selectedCategory: null,
        totalPuzzles: Constants.DEFAULT_TOTAL_PUZZLES,
        enableHints: true,
        enableSkip: true,
        enableTimer: false,
        enableSound: false,
        enableAnimations: true,
        showExplanations: true,
        caseSensitiveAnswers: false,
        allowPartialCredit: true,
        streakBonus: true,
        hintPenalty: true,
        skipPenalty: true,
        difficultyProgression: false,
        randomizeOrder: true,
        language: 'python',
        theme: 'dark'
      };

      return { ...defaultConfig, ...overrides };
    }

    /**
     * Validate configuration
     */
    export function validateConfig(config: Partial<CodingPuzzleConfig>): CodingPuzzleValidationResult {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (config.totalPuzzles && (config.totalPuzzles < 1 || config.totalPuzzles > 50)) {
        errors.push('totalPuzzles must be between 1 and 50');
      }

      if (config.timeLimit && config.timeLimit < 30) {
        warnings.push('timeLimit should be at least 30 seconds for a good experience');
      }

      if (config.selectedCategory && !Constants.CATEGORIES.includes(config.selectedCategory)) {
        errors.push('selectedCategory must be a valid category');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    }
  }

  /**
   * Game Logic
   */
  export namespace Game {
    /**
     * Initialize game state
     */
    export function initializeGameState(config: CodingPuzzleConfig): CodingPuzzleGameState {
      const availablePuzzles = config.selectedCategory ? 
        Puzzles.getPuzzlesForCategory(config.selectedCategory) : [];

      return {
        status: 'idle',
        config,
        currentPuzzle: null,
        puzzleIndex: 0,
        userAnswer: '',
        stats: {
          score: 0,
          puzzlesSolved: 0,
          puzzlesAttempted: 0,
          totalPuzzles: config.totalPuzzles,
          streak: 0,
          bestStreak: 0,
          accuracy: 0,
          hintsUsed: 0,
          skippedPuzzles: 0,
          averageTime: 0,
          totalTime: 0,
          bonusPoints: 0,
          categoryProgress: {},
          difficultyBreakdown: {
            easy: { attempted: 0, solved: 0, accuracy: 0 },
            medium: { attempted: 0, solved: 0, accuracy: 0 },
            hard: { attempted: 0, solved: 0, accuracy: 0 },
            expert: { attempted: 0, solved: 0, accuracy: 0 }
          }
        },
        feedback: null,
        showHint: false,
        usedPuzzles: [],
        availablePuzzles,
        timeElapsed: 0,
        isLoading: false,
        isPaused: false,
        lastAnswerCorrect: false
      };
    }

    /**
     * Calculate score for a correct answer
     */
    export function calculateScore(
      puzzle: CodingPuzzleItem,
      timeUsed: number,
      streak: number,
      hintUsed: boolean,
      config: CodingPuzzleConfig
    ): number {
      let points = Constants.DIFFICULTY_POINTS[puzzle.difficulty];

      // Hint penalty
      if (hintUsed && config.hintPenalty) {
        points = Math.max(1, points - Constants.BONUS_POINTS.noHint);
      } else if (!hintUsed) {
        points += Constants.BONUS_POINTS.noHint;
      }

      // Streak bonus
      if (config.streakBonus && streak >= 3) {
        points += Math.floor(streak / 3) * Constants.BONUS_POINTS.streakMultiplier;
      }

      // Speed bonus (if answered quickly)
      if (timeUsed <= 10) {
        points += Constants.BONUS_POINTS.speedBonus;
      }

      return Math.floor(points);
    }

    /**
     * Update game statistics
     */
    export function updateStats(
      stats: CodingPuzzleGameStats,
      puzzle: CodingPuzzleItem,
      isCorrect: boolean,
      timeUsed: number,
      points: number = 0,
      hintUsed: boolean = false,
      skipped: boolean = false
    ): CodingPuzzleGameStats {
      const newStats = { ...stats };
      
      newStats.puzzlesAttempted += 1;
      newStats.totalTime += timeUsed;

      if (skipped) {
        newStats.skippedPuzzles += 1;
        newStats.streak = 0;
      } else if (isCorrect) {
        newStats.puzzlesSolved += 1;
        newStats.score += points;
        newStats.streak += 1;
        newStats.bestStreak = Math.max(newStats.bestStreak, newStats.streak);
      } else {
        newStats.streak = 0;
      }

      if (hintUsed) {
        newStats.hintsUsed += 1;
      }

      // Update difficulty breakdown
      const diffStats = newStats.difficultyBreakdown[puzzle.difficulty];
      diffStats.attempted += 1;
      if (isCorrect && !skipped) {
        diffStats.solved += 1;
      }
      diffStats.accuracy = (diffStats.solved / diffStats.attempted) * 100;

      // Update overall accuracy
      newStats.accuracy = (newStats.puzzlesSolved / newStats.puzzlesAttempted) * 100;
      newStats.averageTime = newStats.totalTime / newStats.puzzlesAttempted;

      return newStats;
    }

    /**
     * Check if game should end
     */
    export function shouldEndGame(state: CodingPuzzleGameState): boolean {
      return state.puzzleIndex >= state.config.totalPuzzles ||
             state.availablePuzzles.length === 0;
    }
  }

  /**
   * Analytics and Performance
   */
  export namespace Analytics {
    /**
     * Generate performance analytics
     */
    export function generatePerformance(
      gameHistory: Array<{
        config: CodingPuzzleConfig;
        stats: CodingPuzzleGameStats;
        timestamp: string;
      }>
    ): CodingPuzzlePerformance {
      const overallStats = {
        totalGamesPlayed: gameHistory.length,
        bestScore: Math.max(...gameHistory.map(g => g.stats.score), 0),
        averageScore: gameHistory.reduce((sum, g) => sum + g.stats.score, 0) / Math.max(1, gameHistory.length),
        totalPuzzlesSolved: gameHistory.reduce((sum, g) => sum + g.stats.puzzlesSolved, 0),
        favoriteCategory: 'patterns' as CodingPuzzleCategory, // TODO: Calculate from data
        strongestDifficulty: 'easy' as CodingPuzzleDifficulty // TODO: Calculate from data
      };

      // Initialize category stats
      const categoryStats = {} as any;
      Constants.CATEGORIES.forEach(cat => {
        categoryStats[cat] = {
          gamesPlayed: 0,
          puzzlesSolved: 0,
          averageScore: 0,
          bestScore: 0,
          accuracy: 0,
          averageTime: 0
        };
      });

      // Initialize difficulty stats
      const difficultyStats = {
        easy: { attempted: 0, solved: 0, accuracy: 0, averageScore: 0, fastestTime: Infinity },
        medium: { attempted: 0, solved: 0, accuracy: 0, averageScore: 0, fastestTime: Infinity },
        hard: { attempted: 0, solved: 0, accuracy: 0, averageScore: 0, fastestTime: Infinity },
        expert: { attempted: 0, solved: 0, accuracy: 0, averageScore: 0, fastestTime: Infinity }
      };

      const streakStats = {
        longestStreak: Math.max(...gameHistory.map(g => g.stats.bestStreak), 0),
        currentStreak: gameHistory[gameHistory.length - 1]?.stats.streak || 0,
        streakFrequency: 0 // TODO: Calculate
      };

      const recentActivity = gameHistory.slice(-10).map(game => ({
        date: game.timestamp,
        category: game.config.selectedCategory || 'patterns',
        score: game.stats.score,
        puzzlesSolved: game.stats.puzzlesSolved,
        accuracy: game.stats.accuracy
      }));

      return {
        overallStats,
        categoryStats,
        difficultyStats,
        streakStats,
        recentActivity
      };
    }

    /**
     * Create score submission data
     */
    export function createScoreData(
      stats: CodingPuzzleGameStats,
      config: CodingPuzzleConfig,
      category: CodingPuzzleCategory
    ): CodingPuzzleScoreData {
      return {
        game: 'coding-puzzle',
        score: stats.score,
        meta: {
          puzzlesSolved: stats.puzzlesSolved,
          category,
          bestStreak: stats.bestStreak,
          accuracy: stats.accuracy,
          hintsUsed: stats.hintsUsed,
          skippedPuzzles: stats.skippedPuzzles,
          totalTime: stats.totalTime,
          difficulty: Object.entries(stats.difficultyBreakdown)
            .filter(([_, data]) => data.attempted > 0)
            .map(([diff]) => diff) as CodingPuzzleDifficulty[],
          languages: [config.language],
          mode: config.mode
        }
      };
    }
  }

  /**
   * Error Handling
   */
  export namespace Errors {
    /**
     * Create error
     */
    export function createError(
      type: CodingPuzzleError['type'],
      message: string,
      details?: any
    ): CodingPuzzleError {
      return {
        type,
        message,
        code: type.toLowerCase().replace(/_/g, '-'),
        details
      };
    }

    /**
     * Handle puzzle loading error
     */
    export function handlePuzzleLoadError(category: CodingPuzzleCategory, error: any): CodingPuzzleError {
      return createError(
        'PUZZLE_LOAD_FAILED',
        `Failed to load puzzles for category: ${category}`,
        { category, error }
      );
    }

    /**
     * Handle score submission error
     */
    export function handleScoreSubmissionError(score: number, error: any): CodingPuzzleError {
      return createError(
        'SCORE_SUBMISSION_FAILED',
        'Failed to submit score',
        { score, error }
      );
    }
  }

  /**
   * Utility Functions
   */
  export namespace Utils {
    /**
     * Format time in MM:SS format
     */
    export function formatTime(seconds: number): string {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Get difficulty color
     */
    export function getDifficultyColor(difficulty: CodingPuzzleDifficulty): string {
      const colors = {
        easy: '#22C55E',
        medium: '#F59E0B',
        hard: '#EF4444',
        expert: '#8B5CF6'
      };
      return colors[difficulty];
    }

    /**
     * Get category theme
     */
    export function getCategoryTheme(category: CodingPuzzleCategory): { icon: string; color: string; gradient: string } {
      const themes = {
        patterns: { icon: '🔢', color: '#3B82F6', gradient: 'from-blue-600 to-blue-700' },
        codeOutput: { icon: '💻', color: '#10B981', gradient: 'from-green-600 to-green-700' },
        logic: { icon: '🧠', color: '#F59E0B', gradient: 'from-orange-600 to-orange-700' },
        bitwise: { icon: '⚡', color: '#EF4444', gradient: 'from-red-600 to-red-700' },
        algorithms: { icon: '🔄', color: '#8B5CF6', gradient: 'from-purple-600 to-purple-700' },
        dataStructures: { icon: '🏗️', color: '#14B8A6', gradient: 'from-teal-600 to-teal-700' },
        debugging: { icon: '🐛', color: '#EC4899', gradient: 'from-pink-600 to-pink-700' },
        optimization: { icon: '⚙️', color: '#6B7280', gradient: 'from-gray-600 to-gray-700' }
      };
      return themes[category] || themes.patterns;
    }

    /**
     * Calculate accuracy percentage
     */
    export function calculateAccuracy(correct: number, total: number): number {
      return total > 0 ? Math.round((correct / total) * 100) : 0;
    }

    /**
     * Generate unique ID
     */
    export function generateId(prefix: string = 'cp'): string {
      return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
     * Get streak message
     */
    export function getStreakMessage(streak: number): string {
      if (streak >= 10) return '🔥 Coding Master!';
      if (streak >= 5) return '⚡ On Fire!';
      if (streak >= 3) return '✨ Great Streak!';
      return '';
    }

    /**
     * Format score with commas
     */
    export function formatScore(score: number): string {
      return score.toLocaleString();
    }
  }
}