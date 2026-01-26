// Enhanced Brain Teaser page client implementation for GameArchade

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Components
import Instructions from "@/components/shared/Instructions";
import Leaderboard from "@/components/leaderboard/Leaderboard";
import BrainTeaserStats from "@/components/brainteaser/BrainTeaserStats";
import BrainTeaserDisplay from "@/components/brainteaser/BrainTeaserDisplay";
import BrainTeaserTimer from "@/components/brainteaser/BrainTeaserTimer";
import BrainTeaserCompletedModal from "@/components/brainteaser/BrainTeaserCompletedModal";
import AnimatedBackground from "@/components/AnimatedBackground";

// Types
import type {
  BrainTeaserPageProps,
  BrainTeaserGameState,
  BrainTeaserConfig,
  BrainTeaserPuzzle,
  BrainTeaserFeedback,
  BrainTeaserGameStats,
  BrainTeaserError
} from "@/types/brainteaser/brainteaser";

// Utilities
import { BrainTeaserHelpers } from "@/utility/brainteaser/helpers";

// API
import { GameApiClient } from "@/lib/game/client";

// Hooks
import { useAuth } from "@/hooks/auth/useAuth";

// Logger
import { Logger } from "@/lib/logger/client";

/**
 * Enhanced Brain Teaser Page Client
 */
export class BrainTeaserPageClient {
  private static instance: BrainTeaserPageClient | null = null;
  private logger: Logger;
  private gameApiClient: GameApiClient;
  private config: BrainTeaserConfig;

  constructor(config: Partial<BrainTeaserConfig> = {}) {
    this.logger = new Logger({ tag: 'BRAIN_TEASER' });
    this.gameApiClient = GameApiClient.getInstance();
    this.config = BrainTeaserHelpers.Config.createDefaultConfig(config);
  }

  /**
   * Singleton instance
   */
  static getInstance(config?: Partial<BrainTeaserConfig>): BrainTeaserPageClient {
    if (!BrainTeaserPageClient.instance) {
      BrainTeaserPageClient.instance = new BrainTeaserPageClient(config);
    }
    return BrainTeaserPageClient.instance;
  }

  /**
   * Get default configuration
   */
  getDefaultConfig(): BrainTeaserConfig {
    return this.config;
  }

  /**
   * Start new game
   */
  async startGame(): Promise<BrainTeaserGameState> {
    this.logger.info('Starting new Brain Teaser game', { config: this.config });

    try {
      const gameState = BrainTeaserHelpers.Game.initializeGameState(this.config);
      gameState.status = 'starting';
      
      // Generate first puzzle
      const firstPuzzle = BrainTeaserHelpers.Puzzles.generateRandomPuzzle(
        this.config.difficulty,
        this.config
      );

      gameState.currentPuzzle = firstPuzzle;
      gameState.status = 'playing';

      this.logger.debug('Game started with first puzzle', { 
        puzzle: firstPuzzle.type, 
        difficulty: firstPuzzle.difficulty 
      });

      return gameState;
    } catch (error) {
      this.logger.error('Failed to start Brain Teaser game', { error });
      throw BrainTeaserHelpers.Validation.createError(
        'PUZZLE_GENERATION_FAILED',
        'Failed to start game',
        { error, config: this.config }
      );
    }
  }

  /**
   * Process answer
   */
  async processAnswer(
    gameState: BrainTeaserGameState,
    answer: number | number[],
    timeUsed: number
  ): Promise<{
    newState: BrainTeaserGameState;
    feedback: BrainTeaserFeedback;
    isCorrect: boolean;
  }> {
    if (!gameState.currentPuzzle) {
      throw BrainTeaserHelpers.Validation.createError(
        'INVALID_ANSWER',
        'No current puzzle to answer'
      );
    }

    const puzzle = gameState.currentPuzzle;
    const validation = BrainTeaserHelpers.Validation.validateAnswer(puzzle, answer);
    const isCorrect = validation.isCorrect;

    this.logger.info('Processing answer', {
      puzzleId: puzzle.id,
      puzzleType: puzzle.type,
      isCorrect,
      timeUsed,
      currentStreak: gameState.stats.streak
    });

    // Calculate score if correct
    let points = 0;
    if (isCorrect) {
      points = BrainTeaserHelpers.Game.calculateScore(
        puzzle,
        timeUsed,
        gameState.stats.streak,
        this.config.difficulty
      );
    }

    // Update stats
    const updatedStats = BrainTeaserHelpers.Game.updateStats(
      gameState.stats,
      puzzle,
      isCorrect,
      timeUsed,
      points
    );

    // Create feedback
    const feedback: BrainTeaserFeedback = {
      type: isCorrect ? 'success' : 'error',
      message: isCorrect 
        ? `Correct! +${points} points` 
        : 'Wrong answer!',
      points: isCorrect ? points : undefined,
      explanation: validation.explanation,
      duration: 2000
    };

    // Add streak message
    if (isCorrect && updatedStats.streak >= 3) {
      feedback.message += ` ${BrainTeaserHelpers.Utils.getStreakMessage(updatedStats.streak)}`;
    }

    // Update game state
    const newState: BrainTeaserGameState = {
      ...gameState,
      stats: updatedStats,
      puzzleIndex: gameState.puzzleIndex + 1,
      feedback,
      timeElapsed: gameState.timeElapsed + timeUsed
    };

    return { newState, feedback, isCorrect };
  }

  /**
   * Generate next puzzle
   */
  async generateNextPuzzle(gameState: BrainTeaserGameState): Promise<BrainTeaserPuzzle> {
    try {
      const nextPuzzle = BrainTeaserHelpers.Puzzles.generateRandomPuzzle(
        this.config.difficulty,
        this.config
      );

      this.logger.debug('Generated next puzzle', {
        puzzleId: nextPuzzle.id,
        type: nextPuzzle.type,
        puzzleIndex: gameState.puzzleIndex
      });

      return nextPuzzle;
    } catch (error) {
      this.logger.error('Failed to generate next puzzle', { error });
      throw BrainTeaserHelpers.Validation.createError(
        'PUZZLE_GENERATION_FAILED',
        'Failed to generate next puzzle',
        { error, gameState }
      );
    }
  }

  /**
   * End game and submit score
   */
  async endGame(gameState: BrainTeaserGameState): Promise<void> {
    try {
      const finalStats = gameState.stats;
      const puzzleTypeBreakdown = this.calculatePuzzleTypeBreakdown(gameState);
      
      const scoreData = BrainTeaserHelpers.Analytics.createScoreData(
        finalStats,
        this.config,
        puzzleTypeBreakdown
      );

      this.logger.info('Ending Brain Teaser game', {
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
      this.logger.error('Failed to submit Brain Teaser score', { error });
      // Don't throw here - game should end even if score submission fails
    }
  }

  /**
   * Calculate puzzle type breakdown
   */
  private calculatePuzzleTypeBreakdown(gameState: BrainTeaserGameState): Record<string, number> {
    // This would need to be tracked throughout the game
    // For now, return empty breakdown
    return {};
  }
}

/**
 * Main Brain Teaser Component
 */
export function GameBrainTeaserPage({
  config: configOverride,
  onGameComplete,
  onScoreSubmit,
  className,
  children
}: BrainTeaserPageProps = {}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const client = useMemo(() => 
    BrainTeaserPageClient.getInstance(configOverride), 
    [configOverride]
  );
  
  // Game state
  const [gameState, setGameState] = useState<BrainTeaserGameState | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState<BrainTeaserError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Configuration
  const config = useMemo(() => 
    client.getDefaultConfig(), 
    [client]
  );

  // Start game handler
  const handleStartGame = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newGameState = await client.startGame();
      setGameState(newGameState);
      setTimeLeft(config.timeLimit);
      
    } catch (error: any) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [client, config.timeLimit]);

  // Answer handler
  const handleAnswer = useCallback(async (selectedIndex: number) => {
    if (!gameState || !gameState.currentPuzzle || gameState.feedback) return;

    try {
      const timeUsed = Math.max(1, config.timeLimit - timeLeft);
      const result = await client.processAnswer(gameState, selectedIndex, timeUsed);
      
      setGameState(result.newState);

      // Generate next puzzle after feedback delay
      if (result.isCorrect) {
        setTimeout(async () => {
          try {
            const nextPuzzle = await client.generateNextPuzzle(result.newState);
            setGameState(prev => prev ? {
              ...prev,
              currentPuzzle: nextPuzzle,
              feedback: null
            } : prev);
          } catch (error: any) {
            setError(error);
          }
        }, 2000);
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
  }, [gameState, client, config.timeLimit, timeLeft]);

  // Timer countdown
  useEffect(() => {
    if (!gameState || gameState.status !== 'playing' || gameState.isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          
          // End game
          setGameState(prevState => {
            if (prevState) {
              const finalState = { ...prevState, status: 'completed' as const };
              client.endGame(finalState).catch(error => {
                console.error('Failed to end game:', error);
              });
              onGameComplete?.(finalState.stats);
              return finalState;
            }
            return prevState;
          });
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, client, onGameComplete]);

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
          <h1 className="text-5xl font-bold text-white mb-2">🧠 Brain Teasers</h1>
          <p className="text-gray-300">Test your visual reasoning and pattern recognition!</p>
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
            <Instructions gameType="brain-teaser" />
          </motion.div>
        )}

        {/* Start Button */}
        {(!gameState || gameState.status === 'idle') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 shadow-2xl text-center">
              <button
                onClick={handleStartGame}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold text-xl py-6 px-12 rounded-xl transition-all duration-200 shadow-lg hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Starting...' : 'Start Challenge'}
              </button>
              <p className="mt-4 text-gray-400">
                Solve as many puzzles as you can in {config.timeLimit} seconds!
              </p>
            </div>
          </motion.div>
        )}

        {/* Game Screen */}
        {gameState && gameState.status === 'playing' && gameState.currentPuzzle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            {/* Timer */}
            <BrainTeaserTimer 
              timeLeft={timeLeft} 
              totalTime={config.timeLimit}
              isPaused={gameState.isPaused}
              showWarning={timeLeft <= 10}
              warningThreshold={10}
            />

            {/* Stats */}
            <BrainTeaserStats
              stats={gameState.stats}
              showDetailed={true}
              variant="detailed"
            />

            {/* Puzzle Display */}
            <BrainTeaserDisplay
              puzzle={gameState.currentPuzzle}
              onAnswer={handleAnswer}
              feedback={gameState.feedback}
              showHint={gameState.showHint}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {/* Completed Modal */}
        {gameState && gameState.status === 'completed' && (
          <BrainTeaserCompletedModal
            stats={gameState.stats}
            onPlayAgain={handleStartGame}
            onBackToMenu={() => router.push('/dashboard')}
            isVisible={true}
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
            <Leaderboard game="brain-teaser" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

/**
 * Legacy Brain Teaser component for backward compatibility
 */
export default function BrainTeaser() {
  return <GameBrainTeaserPage />;
}

/**
 * Export client class and components
 */
export { BrainTeaserPageClient };