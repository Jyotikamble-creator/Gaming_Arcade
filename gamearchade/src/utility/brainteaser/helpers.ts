// Enhanced Brain Teaser utility helpers for GameArchade

import type {
  BrainTeaserConfig,
  BrainTeaserPuzzle,
  BrainTeaserMatchShapePuzzle,
  BrainTeaserFindOddPuzzle,
  BrainTeaserPatternPuzzle,
  BrainTeaserMemoryPuzzle,
  BrainTeaserLogicPuzzle,
  BrainTeaserSequencePuzzle,
  BrainTeaserGameStats,
  BrainTeaserGameState,
  BrainTeaserShape,
  BrainTeaserColor,
  BrainTeaserPattern,
  BrainTeaserDifficulty,
  BrainTeaserGameMode,
  BrainTeaserShapeObject,
  BrainTeaserError,
  BrainTeaserPerformance,
  BrainTeaserValidationResult,
  BrainTeaserScoreData
} from "@/types/brainteaser/brainteaser";

/**
 * Brain Teaser Game Utilities
 */
export namespace BrainTeaserHelpers {

  /**
   * Game Constants
   */
  export namespace Constants {
    export const SHAPES: BrainTeaserShape[] = [
      'circle', 'square', 'triangle', 'diamond', 'star', 'hexagon', 'pentagon', 'octagon'
    ];

    export const COLORS: BrainTeaserColor[] = [
      'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan',
      'violet', 'lime', 'rose', 'amber'
    ];

    export const PATTERNS: BrainTeaserPattern[] = [
      'horizontal', 'vertical', 'diagonal', 'zigzag', 'circular', 'spiral'
    ];

    export const DIFFICULTY_SETTINGS = {
      easy: { timeLimit: 90, pointsMultiplier: 1, maxOptions: 4 },
      medium: { timeLimit: 60, pointsMultiplier: 1.5, maxOptions: 5 },
      hard: { timeLimit: 45, pointsMultiplier: 2, maxOptions: 6 },
      expert: { timeLimit: 30, pointsMultiplier: 3, maxOptions: 8 }
    };

    export const MODE_SETTINGS = {
      classic: { puzzleCount: 20, allowSkip: false },
      timed: { timeLimit: 300, allowSkip: true },
      endless: { puzzleCount: Infinity, allowSkip: true },
      challenge: { puzzleCount: 50, allowSkip: false },
      practice: { puzzleCount: 10, allowSkip: true }
    };
  }

  /**
   * Configuration Management
   */
  export namespace Config {
    /**
     * Create default configuration
     */
    export function createDefaultConfig(overrides: Partial<BrainTeaserConfig> = {}): BrainTeaserConfig {
      const defaultConfig: BrainTeaserConfig = {
        mode: 'classic',
        difficulty: 'medium',
        timeLimit: 60,
        maxPuzzles: 20,
        enableHints: true,
        enableTimer: true,
        enableSound: false,
        enableAnimations: true,
        autoAdvance: true,
        showExplanations: true,
        allowSkip: false,
        penaltyForWrong: false,
        streakBonus: true,
        customShapes: Constants.SHAPES,
        customColors: Constants.COLORS
      };

      return { ...defaultConfig, ...overrides };
    }

    /**
     * Validate configuration
     */
    export function validateConfig(config: Partial<BrainTeaserConfig>): BrainTeaserValidationResult {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (config.timeLimit && (config.timeLimit < 10 || config.timeLimit > 600)) {
        errors.push('timeLimit must be between 10 and 600 seconds');
      }

      if (config.maxPuzzles && config.maxPuzzles < 1) {
        errors.push('maxPuzzles must be at least 1');
      }

      if (config.customShapes && config.customShapes.length < 3) {
        warnings.push('customShapes should have at least 3 shapes for optimal puzzle generation');
      }

      if (config.customColors && config.customColors.length < 3) {
        warnings.push('customColors should have at least 3 colors for optimal puzzle generation');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    }
  }

  /**
   * Puzzle Generation
   */
  export namespace Puzzles {
    /**
     * Generate a random shape object
     */
    export function generateRandomShape(
      shapes: BrainTeaserShape[] = Constants.SHAPES,
      colors: BrainTeaserColor[] = Constants.COLORS
    ): BrainTeaserShapeObject {
      return {
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as any,
        rotation: Math.floor(Math.random() * 360)
      };
    }

    /**
     * Generate Match Shape puzzle
     */
    export function generateMatchShapePuzzle(
      difficulty: BrainTeaserDifficulty = 'medium',
      config?: Partial<BrainTeaserConfig>
    ): BrainTeaserMatchShapePuzzle {
      const settings = Constants.DIFFICULTY_SETTINGS[difficulty];
      const shapes = config?.customShapes || Constants.SHAPES;
      const colors = config?.customColors || Constants.COLORS;

      const target = generateRandomShape(shapes, colors);
      const options: BrainTeaserShapeObject[] = [];
      const correctIndex = Math.floor(Math.random() * Math.min(4, settings.maxOptions));

      // Add correct answer
      options[correctIndex] = { ...target };

      // Add distractors
      for (let i = 0; i < Math.min(4, settings.maxOptions); i++) {
        if (i !== correctIndex) {
          let distractor: BrainTeaserShapeObject;
          
          // Create similar but different options based on difficulty
          switch (difficulty) {
            case 'easy':
              distractor = generateRandomShape(shapes, colors);
              break;
            case 'medium':
              distractor = { ...target };
              if (Math.random() > 0.5) {
                distractor.shape = shapes[Math.floor(Math.random() * shapes.length)];
              } else {
                distractor.color = colors[Math.floor(Math.random() * colors.length)];
              }
              break;
            case 'hard':
            case 'expert':
              distractor = { ...target };
              // Change one property slightly
              const changeProperty = Math.random();
              if (changeProperty < 0.4) {
                distractor.shape = shapes[(shapes.indexOf(target.shape) + 1) % shapes.length];
              } else if (changeProperty < 0.8) {
                distractor.color = colors[(colors.indexOf(target.color) + 1) % colors.length];
              } else {
                distractor.size = target.size === 'small' ? 'medium' : 'small';
              }
              break;
          }
          
          // Ensure it's not identical to target
          if (distractor.shape === target.shape && distractor.color === target.color) {
            distractor.shape = shapes[(shapes.indexOf(target.shape) + 1) % shapes.length];
          }
          
          options[i] = distractor;
        }
      }

      return {
        id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'match-shape',
        question: 'Find the shape that matches the target:',
        difficulty,
        points: Math.floor(10 * settings.pointsMultiplier),
        target,
        options,
        correctAnswer: correctIndex,
        timeLimit: config?.enableTimer ? settings.timeLimit : undefined,
        hint: 'Look for the exact same shape and color combination'
      };
    }

    /**
     * Generate Find Odd One puzzle
     */
    export function generateFindOddPuzzle(
      difficulty: BrainTeaserDifficulty = 'medium',
      config?: Partial<BrainTeaserConfig>
    ): BrainTeaserFindOddPuzzle {
      const settings = Constants.DIFFICULTY_SETTINGS[difficulty];
      const shapes = config?.customShapes || Constants.SHAPES;
      const colors = config?.customColors || Constants.COLORS;

      const baseShape = generateRandomShape(shapes, colors);
      const optionsCount = Math.min(5, settings.maxOptions);
      const oddIndex = Math.floor(Math.random() * optionsCount);
      const options: BrainTeaserShapeObject[] = [];
      
      // Determine what makes the odd one different
      const oddProperties: ('shape' | 'color' | 'size')[] = ['shape', 'color'];
      if (difficulty === 'hard' || difficulty === 'expert') {
        oddProperties.push('size');
      }
      const oddProperty = oddProperties[Math.floor(Math.random() * oddProperties.length)];

      // Create options
      for (let i = 0; i < optionsCount; i++) {
        if (i === oddIndex) {
          // The odd one out
          const oddShape = { ...baseShape };
          switch (oddProperty) {
            case 'shape':
              oddShape.shape = shapes[(shapes.indexOf(baseShape.shape) + 1) % shapes.length];
              break;
            case 'color':
              oddShape.color = colors[(colors.indexOf(baseShape.color) + 1) % colors.length];
              break;
            case 'size':
              oddShape.size = baseShape.size === 'small' ? 'large' : 'small';
              break;
          }
          options.push(oddShape);
        } else {
          options.push({ ...baseShape });
        }
      }

      return {
        id: `odd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'find-odd',
        question: 'Find the odd one out:',
        difficulty,
        points: Math.floor(15 * settings.pointsMultiplier),
        options,
        correctAnswer: oddIndex,
        oddReason: oddProperty,
        timeLimit: config?.enableTimer ? settings.timeLimit : undefined,
        hint: `Look for the one with a different ${oddProperty}`
      };
    }

    /**
     * Generate Pattern puzzle
     */
    export function generatePatternPuzzle(
      difficulty: BrainTeaserDifficulty = 'medium',
      config?: Partial<BrainTeaserConfig>
    ): BrainTeaserPatternPuzzle {
      const settings = Constants.DIFFICULTY_SETTINGS[difficulty];
      const shapes = config?.customShapes || Constants.SHAPES;
      const colors = config?.customColors || Constants.COLORS;

      // Create a repeating pattern
      const patternLength = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
      const basePattern: BrainTeaserShapeObject[] = [];

      for (let i = 0; i < patternLength; i++) {
        basePattern.push(generateRandomShape(shapes, colors));
      }

      // Show pattern sequence
      const sequenceLength = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
      const pattern: BrainTeaserShapeObject[] = [];
      
      for (let i = 0; i < sequenceLength; i++) {
        pattern.push({ ...basePattern[i % patternLength] });
      }

      // What comes next?
      const nextShape = { ...basePattern[sequenceLength % patternLength] };

      // Create options
      const options: BrainTeaserShapeObject[] = [nextShape];
      while (options.length < Math.min(4, settings.maxOptions)) {
        const randomShape = generateRandomShape(shapes, colors);
        // Avoid duplicates
        if (!options.some(opt => opt.shape === randomShape.shape && opt.color === randomShape.color)) {
          options.push(randomShape);
        }
      }

      // Shuffle options and find new correct index
      const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
      const correctAnswer = shuffledOptions.findIndex(opt => 
        opt.shape === nextShape.shape && opt.color === nextShape.color
      );

      return {
        id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'pattern',
        question: 'What comes next in the pattern?',
        difficulty,
        points: Math.floor(20 * settings.pointsMultiplier),
        pattern,
        options: shuffledOptions,
        correctAnswer,
        patternType: Constants.PATTERNS[Math.floor(Math.random() * Constants.PATTERNS.length)],
        timeLimit: config?.enableTimer ? settings.timeLimit : undefined,
        hint: 'Look for the repeating sequence in the pattern'
      };
    }

    /**
     * Generate Memory puzzle
     */
    export function generateMemoryPuzzle(
      difficulty: BrainTeaserDifficulty = 'medium',
      config?: Partial<BrainTeaserConfig>
    ): BrainTeaserMemoryPuzzle {
      const settings = Constants.DIFFICULTY_SETTINGS[difficulty];
      const shapes = config?.customShapes || Constants.SHAPES;
      const colors = config?.customColors || Constants.COLORS;

      const sequenceLength = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 6;
      const sequence: BrainTeaserShapeObject[] = [];

      for (let i = 0; i < sequenceLength; i++) {
        sequence.push(generateRandomShape(shapes, colors));
      }

      // Create options including the sequence
      const options: BrainTeaserShapeObject[] = [...sequence];
      while (options.length < Math.min(8, settings.maxOptions)) {
        const randomShape = generateRandomShape(shapes, colors);
        if (!options.some(opt => opt.shape === randomShape.shape && opt.color === randomShape.color)) {
          options.push(randomShape);
        }
      }

      // Shuffle options
      const shuffledOptions = options.sort(() => Math.random() - 0.5);
      
      // Correct answers are indices of sequence items in shuffled options
      const correctAnswer = sequence.map(seqItem =>
        shuffledOptions.findIndex(opt => 
          opt.shape === seqItem.shape && opt.color === seqItem.color
        )
      );

      return {
        id: `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'memory',
        question: 'Select the shapes you saw in the correct order:',
        difficulty,
        points: Math.floor(25 * settings.pointsMultiplier),
        sequence,
        showTime: difficulty === 'easy' ? 5000 : difficulty === 'medium' ? 3000 : 2000,
        options: shuffledOptions,
        correctAnswer,
        timeLimit: config?.enableTimer ? settings.timeLimit : undefined,
        hint: 'Try to remember both the shapes and their order'
      };
    }

    /**
     * Generate random puzzle based on type and difficulty
     */
    export function generateRandomPuzzle(
      difficulty: BrainTeaserDifficulty = 'medium',
      config?: Partial<BrainTeaserConfig>
    ): BrainTeaserPuzzle {
      const puzzleGenerators = [
        generateMatchShapePuzzle,
        generateFindOddPuzzle,
        generatePatternPuzzle
      ];

      if (difficulty === 'hard' || difficulty === 'expert') {
        puzzleGenerators.push(generateMemoryPuzzle);
      }

      const randomGenerator = puzzleGenerators[Math.floor(Math.random() * puzzleGenerators.length)];
      return randomGenerator(difficulty, config);
    }
  }

  /**
   * Game Logic
   */
  export namespace Game {
    /**
     * Initialize game state
     */
    export function initializeGameState(config: BrainTeaserConfig): BrainTeaserGameState {
      return {
        status: 'idle',
        config,
        currentPuzzle: null,
        puzzleIndex: 0,
        timeLeft: config.timeLimit,
        timeElapsed: 0,
        stats: {
          score: 0,
          puzzlesSolved: 0,
          puzzlesAttempted: 0,
          streak: 0,
          bestStreak: 0,
          accuracy: 0,
          averageTime: 0,
          totalTime: 0,
          hintsUsed: 0,
          bonusPoints: 0
        },
        feedback: null,
        isLoading: false,
        isPaused: false,
        showHint: false
      };
    }

    /**
     * Calculate score for a correct answer
     */
    export function calculateScore(
      puzzle: BrainTeaserPuzzle,
      timeUsed: number,
      streak: number,
      difficulty: BrainTeaserDifficulty
    ): number {
      const basePoints = puzzle.points;
      const timeBonus = Math.max(0, Math.floor((puzzle.timeLimit || 30) - timeUsed));
      const streakBonus = streak >= 3 ? Math.floor(streak / 3) * 5 : 0;
      const difficultyMultiplier = Constants.DIFFICULTY_SETTINGS[difficulty].pointsMultiplier;

      return Math.floor((basePoints + timeBonus + streakBonus) * difficultyMultiplier);
    }

    /**
     * Update game stats after answer
     */
    export function updateStats(
      stats: BrainTeaserGameStats,
      puzzle: BrainTeaserPuzzle,
      isCorrect: boolean,
      timeUsed: number,
      points: number = 0
    ): BrainTeaserGameStats {
      const newStats = { ...stats };
      
      newStats.puzzlesAttempted += 1;
      newStats.totalTime += timeUsed;
      
      if (isCorrect) {
        newStats.puzzlesSolved += 1;
        newStats.score += points;
        newStats.streak += 1;
        newStats.bestStreak = Math.max(newStats.bestStreak, newStats.streak);
      } else {
        newStats.streak = 0;
      }

      newStats.accuracy = (newStats.puzzlesSolved / newStats.puzzlesAttempted) * 100;
      newStats.averageTime = newStats.totalTime / newStats.puzzlesAttempted;

      return newStats;
    }

    /**
     * Check if game should end
     */
    export function shouldEndGame(
      state: BrainTeaserGameState,
      config: BrainTeaserConfig
    ): boolean {
      if (state.timeLeft <= 0) return true;
      if (config.maxPuzzles && state.puzzleIndex >= config.maxPuzzles) return true;
      return false;
    }
  }

  /**
   * Scoring and Analytics
   */
  export namespace Analytics {
    /**
     * Generate performance analytics
     */
    export function generatePerformance(
      puzzleHistory: Array<{ puzzle: BrainTeaserPuzzle; correct: boolean; timeUsed: number; score: number }>
    ): BrainTeaserPerformance {
      const puzzleTypeStats = {} as any;
      const difficultyStats = {} as any;

      // Initialize stats
      Constants.SHAPES.forEach(type => {
        puzzleTypeStats[type] = {
          attempted: 0,
          solved: 0,
          averageTime: 0,
          bestTime: Infinity,
          accuracy: 0
        };
      });

      Object.keys(Constants.DIFFICULTY_SETTINGS).forEach(difficulty => {
        difficultyStats[difficulty] = {
          attempted: 0,
          solved: 0,
          averageScore: 0,
          bestScore: 0
        };
      });

      // Calculate stats
      let totalStreaks = 0;
      let currentStreak = 0;
      let bestStreak = 0;

      puzzleHistory.forEach(entry => {
        const { puzzle, correct, timeUsed, score } = entry;
        
        // Puzzle type stats
        const typeStats = puzzleTypeStats[puzzle.type];
        if (typeStats) {
          typeStats.attempted += 1;
          if (correct) {
            typeStats.solved += 1;
            typeStats.bestTime = Math.min(typeStats.bestTime, timeUsed);
          }
          typeStats.averageTime = (typeStats.averageTime * (typeStats.attempted - 1) + timeUsed) / typeStats.attempted;
          typeStats.accuracy = (typeStats.solved / typeStats.attempted) * 100;
        }

        // Difficulty stats
        const diffStats = difficultyStats[puzzle.difficulty];
        if (diffStats) {
          diffStats.attempted += 1;
          if (correct) {
            diffStats.solved += 1;
            diffStats.bestScore = Math.max(diffStats.bestScore, score);
          }
          diffStats.averageScore = (diffStats.averageScore * (diffStats.attempted - 1) + score) / diffStats.attempted;
        }

        // Streak stats
        if (correct) {
          currentStreak += 1;
          bestStreak = Math.max(bestStreak, currentStreak);
        } else {
          if (currentStreak > 0) {
            totalStreaks += 1;
          }
          currentStreak = 0;
        }
      });

      const totalTime = puzzleHistory.reduce((sum, entry) => sum + entry.timeUsed, 0);

      return {
        puzzleTypeStats,
        difficultyStats,
        streakStats: {
          current: currentStreak,
          best: bestStreak,
          total: totalStreaks
        },
        timeStats: {
          totalPlayed: totalTime,
          averageSession: totalTime / Math.max(1, puzzleHistory.length),
          longestSession: Math.max(...puzzleHistory.map(entry => entry.timeUsed), 0)
        }
      };
    }

    /**
     * Create score submission data
     */
    export function createScoreData(
      stats: BrainTeaserGameStats,
      config: BrainTeaserConfig,
      puzzleTypeBreakdown: Record<string, number>
    ): BrainTeaserScoreData {
      return {
        game: 'brain-teaser',
        score: stats.score,
        meta: {
          puzzlesSolved: stats.puzzlesSolved,
          bestStreak: stats.bestStreak,
          accuracy: stats.accuracy,
          timeUsed: stats.totalTime,
          difficulty: config.difficulty,
          mode: config.mode,
          puzzleTypes: puzzleTypeBreakdown as any
        }
      };
    }
  }

  /**
   * Validation and Error Handling
   */
  export namespace Validation {
    /**
     * Validate puzzle answer
     */
    export function validateAnswer(
      puzzle: BrainTeaserPuzzle,
      answer: number | number[]
    ): { isCorrect: boolean; explanation?: string } {
      if (puzzle.type === 'memory') {
        const memoryPuzzle = puzzle as BrainTeaserMemoryPuzzle;
        const expectedAnswers = memoryPuzzle.correctAnswer;
        const userAnswers = Array.isArray(answer) ? answer : [answer];
        
        const isCorrect = expectedAnswers.length === userAnswers.length &&
          expectedAnswers.every((val, index) => val === userAnswers[index]);
        
        return {
          isCorrect,
          explanation: isCorrect 
            ? 'Perfect! You remembered the sequence correctly!'
            : `The correct sequence was: ${expectedAnswers.map(i => memoryPuzzle.options[i]?.shape).join(', ')}`
        };
      } else {
        const singleAnswer = Array.isArray(answer) ? answer[0] : answer;
        const isCorrect = singleAnswer === puzzle.correctAnswer;
        
        return {
          isCorrect,
          explanation: isCorrect 
            ? 'Correct answer!'
            : puzzle.explanation || 'Try again!'
        };
      }
    }

    /**
     * Create error
     */
    export function createError(
      type: BrainTeaserError['type'],
      message: string,
      details?: any
    ): BrainTeaserError {
      return {
        type,
        message,
        code: type.toLowerCase().replace(/_/g, '-'),
        details
      };
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
    export function getDifficultyColor(difficulty: BrainTeaserDifficulty): string {
      const colors = {
        easy: '#22C55E',
        medium: '#F59E0B',
        hard: '#EF4444',
        expert: '#8B5CF6'
      };
      return colors[difficulty];
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
     * Generate unique ID
     */
    export function generateId(prefix: string = 'bt'): string {
      return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Calculate accuracy percentage
     */
    export function calculateAccuracy(correct: number, total: number): number {
      return total > 0 ? Math.round((correct / total) * 100) : 0;
    }

    /**
     * Get streak message
     */
    export function getStreakMessage(streak: number): string {
      if (streak >= 10) return '🔥 On Fire!';
      if (streak >= 5) return '⚡ Hot Streak!';
      if (streak >= 3) return '✨ Great Job!';
      return '';
    }
  }
}