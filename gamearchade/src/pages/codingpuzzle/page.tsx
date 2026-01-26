// Enhanced Coding Puzzle page client implementation for GameArchade

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Components
import Instructions from "@/components/shared/Instructions";
import Leaderboard from "@/components/leaderboard/Leaderboard";
import PuzzleDisplay from "@/components/codingpuzzle/PuzzleDisplay";
import PuzzleInput from "@/components/codingpuzzle/PuzzleInput";
import PuzzleStats from "@/components/codingpuzzle/PuzzleStats";
import PuzzleHint from "@/components/codingpuzzle/PuzzleHint";
import PuzzleCompletedModal from "@/components/codingpuzzle/PuzzleCompletedModal";
import AnimatedBackground from "@/components/AnimatedBackground";

// Types
import type {
  CodingPuzzlePageProps,
  CodingPuzzleGameState,
  CodingPuzzleConfig,
  CodingPuzzleCategory,
  CodingPuzzleCategoryConfig,
  CodingPuzzleItem,
  CodingPuzzleFeedback,
  CodingPuzzleGameStats,
  CodingPuzzleError
} from "@/types/codingpuzzle/codingpuzzle";

// Utilities
import { CodingPuzzleHelpers } from "@/utility/codingpuzzle/helpers";

// API
import { GameApiClient } from "@/lib/game/client";

// Hooks
import { useAuth } from "@/hooks/auth/useAuth";

// Logger
import { Logger } from "@/lib/logger/client";

/**
 * Enhanced Coding Puzzle Page Client
 */
export class CodingPuzzlePageClient {
  private static instance: CodingPuzzlePageClient | null = null;
  private logger: Logger;
  private gameApiClient: GameApiClient;
  private config: CodingPuzzleConfig;

  constructor(config: Partial<CodingPuzzleConfig> = {}) {
    this.logger = new Logger({ tag: 'CODING_PUZZLE' });
    this.gameApiClient = GameApiClient.getInstance();
    this.config = CodingPuzzleHelpers.Config.createDefaultConfig(config);
  }

  /**
   * Singleton instance
   */
  static getInstance(config?: Partial<CodingPuzzleConfig>): CodingPuzzlePageClient {
    if (!CodingPuzzlePageClient.instance) {
      CodingPuzzlePageClient.instance = new CodingPuzzlePageClient(config);
    }
    return CodingPuzzlePageClient.instance;
  }

  /**
   * Get default configuration
   */
  getDefaultConfig(): CodingPuzzleConfig {
    return this.config;
  }

  /**
   * Get available categories
   */
  getCategories(): CodingPuzzleCategoryConfig[] {
    return CodingPuzzleHelpers.Puzzles.getDefaultCategories();
  }

  /**
   * Start new game with selected category
   */
  async startGame(category: CodingPuzzleCategory): Promise<CodingPuzzleGameState> {
    this.logger.info('Starting new Coding Puzzle game', { category, config: this.config });

    try {
      const gameConfig = { ...this.config, selectedCategory: category };
      const gameState = CodingPuzzleHelpers.Game.initializeGameState(gameConfig);
      
      // Get first puzzle
      const firstPuzzle = CodingPuzzleHelpers.Puzzles.getRandomPuzzle(
        category,
        gameState.usedPuzzles
      );

      if (!firstPuzzle) {
        throw new Error(`No puzzles available for category: ${category}`);
      }

      gameState.currentPuzzle = firstPuzzle;
      gameState.usedPuzzles = [firstPuzzle.id];
      gameState.status = 'playing';

      this.logger.debug('Game started with first puzzle', { 
        puzzleId: firstPuzzle.id,
        difficulty: firstPuzzle.difficulty 
      });

      return gameState;
    } catch (error) {
      this.logger.error('Failed to start Coding Puzzle game', { error, category });
      throw CodingPuzzleHelpers.Errors.createError(
        'PUZZLE_LOAD_FAILED',
        'Failed to start game',
        { error, category, config: this.config }
      );
    }
  }

  /**
   * Process answer submission
   */
  async processAnswer(
    gameState: CodingPuzzleGameState,
    userAnswer: string,
    timeUsed: number
  ): Promise<{
    newState: CodingPuzzleGameState;
    feedback: CodingPuzzleFeedback;
    isCorrect: boolean;
  }> {
    if (!gameState.currentPuzzle) {
      throw CodingPuzzleHelpers.Errors.createError(
        'INVALID_ANSWER',
        'No current puzzle to answer'
      );
    }

    const puzzle = gameState.currentPuzzle;
    const validation = CodingPuzzleHelpers.Puzzles.validateAnswer(puzzle, userAnswer);
    const isCorrect = validation.isCorrect;

    this.logger.info('Processing answer', {
      puzzleId: puzzle.id,
      category: puzzle.category,
      difficulty: puzzle.difficulty,
      isCorrect,
      timeUsed,
      currentStreak: gameState.stats.streak
    });

    // Calculate score if correct
    let points = 0;
    if (isCorrect) {
      points = CodingPuzzleHelpers.Game.calculateScore(
        puzzle,
        timeUsed,
        gameState.stats.streak,
        gameState.showHint,
        gameState.config
      );
    }

    // Update stats
    const updatedStats = CodingPuzzleHelpers.Game.updateStats(
      gameState.stats,
      puzzle,
      isCorrect,
      timeUsed,
      points,
      gameState.showHint,
      false
    );

    // Create feedback
    const feedback: CodingPuzzleFeedback = {
      type: isCorrect ? 'success' : 'error',
      message: isCorrect 
        ? `Correct! +${points} points` 
        : 'Incorrect! Try again.',
      points: isCorrect ? points : undefined,
      explanation: validation.explanation,
      duration: 2000,
      showNext: isCorrect
    };

    // Add streak message
    if (isCorrect && updatedStats.streak >= 3) {
      feedback.message += ` ${CodingPuzzleHelpers.Utils.getStreakMessage(updatedStats.streak)}`;
    }

    // Update game state
    const newState: CodingPuzzleGameState = {
      ...gameState,
      stats: updatedStats,
      puzzleIndex: gameState.puzzleIndex + (isCorrect ? 1 : 0),
      feedback,
      timeElapsed: gameState.timeElapsed + timeUsed,
      lastAnswerCorrect: isCorrect,
      userAnswer: isCorrect ? '' : userAnswer
    };

    return { newState, feedback, isCorrect };
  }

  /**
   * Skip current puzzle
   */
  async skipPuzzle(
    gameState: CodingPuzzleGameState,
    timeUsed: number
  ): Promise<CodingPuzzleGameState> {
    if (!gameState.currentPuzzle) {
      throw CodingPuzzleHelpers.Errors.createError(
        'INVALID_ANSWER',
        'No current puzzle to skip'
      );
    }

    this.logger.info('Skipping puzzle', {
      puzzleId: gameState.currentPuzzle.id,
      timeUsed
    });

    // Update stats
    const updatedStats = CodingPuzzleHelpers.Game.updateStats(
      gameState.stats,
      gameState.currentPuzzle,
      false,
      timeUsed,
      0,
      gameState.showHint,
      true
    );

    // Create feedback
    const feedback: CodingPuzzleFeedback = {
      type: 'warning',
      message: 'Puzzle skipped',
      duration: 1000,
      showNext: true
    };

    return {
      ...gameState,
      stats: updatedStats,
      puzzleIndex: gameState.puzzleIndex + 1,
      feedback,
      timeElapsed: gameState.timeElapsed + timeUsed,
      userAnswer: '',
      showHint: false
    };
  }

  /**
   * Generate next puzzle
   */
  async generateNextPuzzle(gameState: CodingPuzzleGameState): Promise<CodingPuzzleItem | null> {
    if (!gameState.config.selectedCategory) {
      throw CodingPuzzleHelpers.Errors.createError(
        'CATEGORY_NOT_FOUND',
        'No category selected'
      );
    }

    try {
      const nextPuzzle = CodingPuzzleHelpers.Puzzles.getRandomPuzzle(
        gameState.config.selectedCategory,
        gameState.usedPuzzles
      );

      if (nextPuzzle) {
        this.logger.debug('Generated next puzzle', {
          puzzleId: nextPuzzle.id,
          difficulty: nextPuzzle.difficulty,
          puzzleIndex: gameState.puzzleIndex
        });
      } else {
        this.logger.debug('No more puzzles available');
      }

      return nextPuzzle;
    } catch (error) {
      this.logger.error('Failed to generate next puzzle', { error });
      throw CodingPuzzleHelpers.Errors.createError(
        'PUZZLE_GENERATION_FAILED',
        'Failed to generate next puzzle',
        { error, gameState }
      );
    }
  }

  /**
   * End game and submit score
   */
  async endGame(gameState: CodingPuzzleGameState): Promise<void> {
    try {
      if (!gameState.config.selectedCategory) {
        throw new Error('No category selected');
      }

      const finalStats = gameState.stats;
      
      const scoreData = CodingPuzzleHelpers.Analytics.createScoreData(
        finalStats,
        gameState.config,
        gameState.config.selectedCategory
      );

      this.logger.info('Ending Coding Puzzle game', {
        category: gameState.config.selectedCategory,
        score: finalStats.score,
        puzzlesSolved: finalStats.puzzlesSolved,
        accuracy: finalStats.accuracy,
        bestStreak: finalStats.bestStreak
      });

      await this.gameApiClient.submitScore(scoreData);
      
      this.logger.info('Score submitted successfully', { 
        score: finalStats.score 
      });

    } catch (error) {
      this.logger.error('Failed to submit Coding Puzzle score', { error });
      // Don't throw here - game should end even if score submission fails
    }
  }
}

/**
 * Category Selection Component
 */
function CategorySelection({ 
  categories, 
  onCategorySelect, 
  isLoading 
}: {
  categories: CodingPuzzleCategoryConfig[];
  onCategorySelect: (category: CodingPuzzleCategory) => void;
  isLoading?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose a Puzzle Type</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              disabled={isLoading || !category.unlocked}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-gradient-to-br ${category.gradient} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-8 px-6 rounded-xl transition-all duration-200 shadow-lg`}
            >
              <div className="text-4xl mb-3">{category.icon}</div>
              <div className="text-xl mb-2">{category.name}</div>
              <div className="text-sm opacity-80">{category.description}</div>
              {!category.unlocked && (
                <div className="text-xs mt-2 bg-black/20 rounded px-2 py-1">
                  {category.requiredScore ? `Unlock at ${category.requiredScore} points` : 'Locked'}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Main Coding Puzzle Component
 */
export function GameCodingPuzzlePage({
  config: configOverride,
  customCategories,
  onGameComplete,
  onScoreSubmit,
  className,
  children
}: CodingPuzzlePageProps = {}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const client = useMemo(() => 
    CodingPuzzlePageClient.getInstance(configOverride), 
    [configOverride]
  );
  
  // Game state
  const [gameState, setGameState] = useState<CodingPuzzleGameState | null>(null);
  const [categories] = useState<CodingPuzzleCategoryConfig[]>(
    customCategories || client.getCategories()
  );
  const [error, setError] = useState<CodingPuzzleError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Configuration
  const config = useMemo(() => 
    client.getDefaultConfig(), 
    [client]
  );

  // Start game handler
  const handleCategorySelect = useCallback(async (category: CodingPuzzleCategory) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newGameState = await client.startGame(category);
      setGameState(newGameState);
      
    } catch (error: any) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  // Answer submission handler
  const handleSubmit = useCallback(async () => {
    if (!gameState || !gameState.currentPuzzle || !gameState.userAnswer.trim()) return;

    try {
      const timeUsed = 5; // TODO: Track actual time
      const result = await client.processAnswer(gameState, gameState.userAnswer, timeUsed);
      
      setGameState(result.newState);

      // Handle next puzzle or game completion
      if (result.isCorrect) {
        const shouldEnd = CodingPuzzleHelpers.Game.shouldEndGame(result.newState);
        
        if (shouldEnd) {
          setTimeout(async () => {
            const finalState = { ...result.newState, status: 'completed' as const };
            setGameState(finalState);
            await client.endGame(finalState);
            onGameComplete?.(finalState.stats);
          }, 2000);
        } else {
          setTimeout(async () => {
            try {
              const nextPuzzle = await client.generateNextPuzzle(result.newState);
              if (nextPuzzle) {
                setGameState(prev => prev ? {
                  ...prev,
                  currentPuzzle: nextPuzzle,
                  usedPuzzles: [...prev.usedPuzzles, nextPuzzle.id],
                  feedback: null,
                  showHint: false
                } : prev);
              }
            } catch (error: any) {
              setError(error);
            }
          }, 2000);
        }
      } else {
        setTimeout(() => {
          setGameState(prev => prev ? {
            ...prev,
            feedback: null
          } : prev);
        }, 2000);
      }

    } catch (error: any) {
      setError(error);
    }
  }, [gameState, client, onGameComplete]);

  // Skip puzzle handler
  const handleSkip = useCallback(async () => {
    if (!gameState || !gameState.currentPuzzle) return;

    try {
      const timeUsed = 2;
      const skippedState = await client.skipPuzzle(gameState, timeUsed);
      
      const shouldEnd = CodingPuzzleHelpers.Game.shouldEndGame(skippedState);
      
      if (shouldEnd) {
        const finalState = { ...skippedState, status: 'completed' as const };
        setGameState(finalState);
        await client.endGame(finalState);
        onGameComplete?.(finalState.stats);
      } else {
        const nextPuzzle = await client.generateNextPuzzle(skippedState);
        if (nextPuzzle) {
          setGameState({
            ...skippedState,
            currentPuzzle: nextPuzzle,
            usedPuzzles: [...skippedState.usedPuzzles, nextPuzzle.id]
          });
        }
      }

    } catch (error: any) {
      setError(error);
    }
  }, [gameState, client, onGameComplete]);

  // Toggle hint handler
  const handleToggleHint = useCallback(() => {
    setGameState(prev => prev ? {
      ...prev,
      showHint: !prev.showHint
    } : prev);
  }, []);

  // Answer change handler
  const handleAnswerChange = useCallback((answer: string) => {
    setGameState(prev => prev ? {
      ...prev,
      userAnswer: answer
    } : prev);
  }, []);

  // Play again handler
  const handlePlayAgain = useCallback(() => {
    if (gameState?.config.selectedCategory) {
      handleCategorySelect(gameState.config.selectedCategory);
    }
  }, [gameState, handleCategorySelect]);

  // Back to menu handler
  const handleBackToMenu = useCallback(() => {
    setGameState(null);
    setError(null);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Custom children override
  if (children) {
    return (
      <div className={`min-h-screen text-light-text relative overflow-hidden ${className || ''}`}>
        <AnimatedBackground />
        <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen text-light-text relative overflow-hidden ${className || ''}`}>
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-2">🧩 Coding Puzzle Solver</h1>
          <p className="text-gray-300">Test your programming logic and pattern recognition!</p>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg max-w-2xl mx-auto"
            >
              <p className="text-red-400 text-center">{error.message}</p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setError(null)}
                  className="text-red-300 hover:text-red-100 text-sm px-4 py-2 border border-red-500/30 rounded transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        {(!gameState || gameState.status === 'idle') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-md mx-auto mb-8"
          >
            <Instructions gameType="coding-puzzle" />
          </motion.div>
        )}

        {/* Category Selection */}
        {(!gameState || gameState.status === 'idle') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <CategorySelection
              categories={categories}
              onCategorySelect={handleCategorySelect}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {/* Game Screen */}
        {gameState && gameState.status === 'playing' && gameState.currentPuzzle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            {/* Stats */}
            <PuzzleStats
              stats={gameState.stats}
              showDetailed={true}
              compact={false}
            />

            {/* Puzzle Display */}
            <PuzzleDisplay
              puzzle={gameState.currentPuzzle}
              puzzleNumber={gameState.puzzleIndex + 1}
              totalPuzzles={config.totalPuzzles}
              showCode={Boolean(gameState.currentPuzzle.code)}
              language={gameState.currentPuzzle.language}
            />

            {/* Hint */}
            {gameState.showHint && (
              <PuzzleHint
                hint={gameState.currentPuzzle.hint}
                puzzle={gameState.currentPuzzle}
                isVisible={gameState.showHint}
                onClose={handleToggleHint}
              />
            )}

            {/* Input */}
            <PuzzleInput
              puzzle={gameState.currentPuzzle}
              userAnswer={gameState.userAnswer}
              onAnswerChange={handleAnswerChange}
              onSubmit={handleSubmit}
              onSkip={config.enableSkip ? handleSkip : undefined}
              onToggleHint={config.enableHints ? handleToggleHint : undefined}
              showHint={gameState.showHint}
              feedback={gameState.feedback}
              isSubmitting={isLoading}
            />
          </motion.div>
        )}

        {/* Completed Modal */}
        {gameState && gameState.status === 'completed' && gameState.config.selectedCategory && (
          <PuzzleCompletedModal
            stats={gameState.stats}
            category={gameState.config.selectedCategory}
            isVisible={true}
            onPlayAgain={handlePlayAgain}
            onBackToMenu={handleBackToMenu}
            onChangeCategory={handleBackToMenu}
          />
        )}

        {/* Leaderboard */}
        {(!gameState || gameState.status === 'idle') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12"
          >
            <Leaderboard game="coding-puzzle" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

/**
 * Legacy Coding Puzzle component for backward compatibility
 */
export default function CodingPuzzle() {
  return <GameCodingPuzzlePage />;
}

/**
 * Export client class and components
 */
export { CodingPuzzlePageClient, CategorySelection };