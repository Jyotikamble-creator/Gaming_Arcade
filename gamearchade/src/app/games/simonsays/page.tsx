import { useAuth } from '@/lib/auth/AuthProvider';
import { useRouter } from 'next/navigation';
// Simon Says Game Page
"use client";

import React, { useEffect, useState, useCallback } from 'react';
// API functions
import { startSimon, submitScore } from '@/lib/api/client';
// Logger
import { logger } from '@/lib/logger';
// Components
import Instructions from '@/components/shared/Instructions';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import SimonSaysStats from '@/components/games/simonsays/SimonSaysStats';
import SimonSaysGrid from '@/components/games/simonsays/SimonSaysGrid';
import SimonSaysGameOverModal from '@/components/games/simonsays/SimonSaysGameOverModal';
import DashboardLayout from '@/components/shared/DashboardLayout';
// Types
import { SimonSaysDifficulty, DIFFICULTY_CONFIG } from '@/types/games/simon-says';

// Simon Says Page Component
export default function SimonSays() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    if (loading) {
      return (
        <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      router.push('/pages/auth');
      return null;
    }
  const [colors, setColors] = useState<string[]>([]);
  const [seq, setSeq] = useState<string[]>([]);
  const [playerSeq, setPlayerSeq] = useState<string[]>([]);
  const [round, setRound] = useState<number>(0);
  const [isShowingSequence, setIsShowingSequence] = useState<boolean>(false);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [difficulty, setDifficulty] = useState<SimonSaysDifficulty | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  // Initialize color list only (don't start game)
  useEffect(() => {
    const initializeColors = async (): Promise<void> => {
      try {
        setIsLoading(true);
        logger.info('Initializing Simon Says colors', {});
        // Just initialize with default colors without starting a game session
        setColors(['red', 'blue', 'green', 'yellow']);
        logger.info('Simon Says colors initialized', { colors: 4 });
      } catch (error) {
        logger.error('Simon Says', 'Failed to initialize colors', { error: error instanceof Error ? error.message : String(error) });
        setColors(['red', 'blue', 'green', 'yellow']);
      } finally {
        setIsLoading(false);
      }
    };

    initializeColors();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Start game with selected difficulty
  const startGameWithDifficulty = (selectedDifficulty: SimonSaysDifficulty): void => {
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
    setSeq([]);
    setPlayerSeq([]);
    setRound(0);
    setGameOver(false);
    setGameWon(false);
    setActiveColor(null);
    setIsShowingSequence(true);

    // Start the first round with the selected difficulty
    setTimeout(() => {
      startFirstRound(selectedDifficulty);
    }, 100);
  };

  // Start the first round
  const startFirstRound = (diff: SimonSaysDifficulty): void => {
    if (!colors || colors.length === 0) {
      logger.error('Simon Says', 'No colors available', {});
      return;
    }

    const diffConfig = DIFFICULTY_CONFIG[diff];
    const next = [colors[Math.floor(Math.random() * colors.length)]];
    setSeq(next);
    setPlayerSeq([]);
    setRound(next.length);

    // Show sequence with animation
    let i = 0;
    const showNext = (): void => {
      if (i < next.length) {
        setActiveColor(next[i]);
        setTimeout(() => {
          setActiveColor(null);
          i++;
          setTimeout(showNext, diffConfig.sequenceSpeed);
        }, diffConfig.colorFlashDuration);
      } else {
        setIsShowingSequence(false);
      }
    };
    setTimeout(showNext, 1000);
  };

  // Restart game
  const restartGame = async (): Promise<void> => {
    try {
      logger.info('Restarting Simon Says game', {});
      setSeq([]);
      setPlayerSeq([]);
      setRound(0);
      setGameOver(false);
      setGameWon(false);
      setActiveColor(null);
      setGameStarted(false);
      setDifficulty(null);
      logger.info('Simon Says restarted');
    } catch (error) {
      logger.error('Simon Says', 'Failed to restart Simon Says', { error: error instanceof Error ? error.message : String(error) });
    }
  };

  // Next round
  const nextRound = useCallback((prev: string[], diff?: SimonSaysDifficulty): void => {
    const useDifficulty = diff || difficulty;
    if (!useDifficulty || !colors.length) {
      return;
    }

    const diffConfig = DIFFICULTY_CONFIG[useDifficulty];
    const next = [...prev, colors[Math.floor(Math.random() * colors.length)]];
    setSeq(next);
    setPlayerSeq([]);
    setRound(next.length);
    setIsShowingSequence(true);

    // Show sequence with animation
    let i = 0;
    const showNext = (): void => {
      if (i < next.length) {
        setActiveColor(next[i]);
        setTimeout(() => {
          setActiveColor(null);
          i++;
          setTimeout(showNext, diffConfig.sequenceSpeed);
        }, diffConfig.colorFlashDuration);
      } else {
        setIsShowingSequence(false);
      }
    };
    setTimeout(showNext, 1000);
  }, [colors, difficulty]);

  // Press button
  const press = useCallback((c: string): void => {
    if (isShowingSequence || gameOver || gameWon || !difficulty) return;

    const diffConfig = DIFFICULTY_CONFIG[difficulty];
    const pos = playerSeq.length;
    const newSeq = [...playerSeq, c];
    setPlayerSeq(newSeq);

    // Visual feedback
    setActiveColor(c);
    setTimeout(() => setActiveColor(null), 200);

    if (seq[pos] !== c) {
      // Wrong sequence
      setGameOver(true);
      const score = (round - 1) * diffConfig.scoreMultiplier * 10;
      try {
        submitScore({ game: 'simon-says', score: Math.round(score), meta: { roundsCompleted: round - 1, difficulty } }).catch((err) => {
          logger.error('Simon Says', 'Failed to submit score', { error: err instanceof Error ? err.message : String(err) });
        });
      } catch (err) {
        logger.error('Simon Says', 'Score submission error', { error: err instanceof Error ? err.message : String(err) });
      }
      logger.info('Simon Says game over - wrong sequence', { score, round, difficulty });
    } else if (newSeq.length === seq.length) {
      // Round completed
      if (newSeq.length === diffConfig.maxRounds) {
        // Game won
        setGameWon(true);
        const score = diffConfig.maxRounds * diffConfig.scoreMultiplier * 10 + 50;
        try {
          submitScore({ game: 'simon-says', score: Math.round(score), meta: { roundsCompleted: diffConfig.maxRounds, difficulty } }).catch((err) => {
            logger.error('Simon Says', 'Failed to submit score', { error: err instanceof Error ? err.message : String(err) });
          });
        } catch (err) {
          logger.error('Simon Says', 'Score submission error', { error: err instanceof Error ? err.message : String(err) });
        }
        logger.info('Simon Says game won', { score, difficulty });
      } else {
        // Next round
        setTimeout(() => nextRound(seq, difficulty), 1000);
      }
    }
  }, [seq, playerSeq, isShowingSequence, gameOver, gameWon, round, difficulty, nextRound]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text">Setting up Simon Says...</p>
        </div>
      </div>
    );
  }

  // Difficulty Selection Screen
  if (!gameStarted) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden flex items-center justify-center">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              {/* Title */}
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  🎮 Simon Says
                </h1>
                <p className="text-gray-300 text-xl mb-4">
                  Repeat the color sequences to advance!
                </p>
                <p className="text-gray-400 text-lg">
                  Select a difficulty level to begin
                </p>
              </div>

              {/* Difficulty Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Easy */}
                <button
                  onClick={() => startGameWithDifficulty('easy')}
                  className="group relative overflow-hidden rounded-xl bg-linear-to-br from-green-500/20 to-emerald-600/20 border border-green-500/50 p-8 hover:border-green-400 hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">🌱</div>
                    <h3 className="text-3xl font-bold text-green-400 mb-3">Easy</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ Slow sequences</li>
                      <li>✓ 8 rounds max</li>
                      <li>✓ 1x score</li>
                    </ul>
                  </div>
                </button>

                {/* Medium */}
                <button
                  onClick={() => startGameWithDifficulty('medium')}
                  className="group relative overflow-hidden rounded-xl bg-linear-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/50 p-8 hover:border-yellow-400 hover:from-yellow-500/30 hover:to-orange-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">⚡</div>
                    <h3 className="text-3xl font-bold text-yellow-400 mb-3">Medium</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ Moderate speed</li>
                      <li>✓ 10 rounds max</li>
                      <li>✓ 1.5x score</li>
                    </ul>
                  </div>
                </button>

                {/* Hard */}
                <button
                  onClick={() => startGameWithDifficulty('hard')}
                  className="group relative overflow-hidden rounded-xl bg-linear-to-br from-red-500/20 to-pink-600/20 border border-red-500/50 p-8 hover:border-red-400 hover:from-red-500/30 hover:to-pink-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">🔥</div>
                    <h3 className="text-3xl font-bold text-red-400 mb-3">Hard</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ Fast sequences</li>
                      <li>✓ 12 rounds max</li>
                      <li>✓ 2x score</li>
                    </ul>
                  </div>
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-white font-semibold mb-4 text-center text-lg">How to Play</h3>
                <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                  <div className="space-y-2">
                    <p>👀 Watch the color sequence carefully</p>
                    <p>🎮 Click the colors in the same order</p>
                  </div>
                  <div className="space-y-2">
                    <p>⭐ Build longer sequences to advance</p>
                    <p>🏆 Complete all rounds to win!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Main render
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
          {/* Header with Progress */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                🎮 Simon Says
              </h1>
              <span className="text-3xl font-bold text-gray-300 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                {round}/{difficulty && DIFFICULTY_CONFIG[difficulty].maxRounds}
              </span>
            </div>
            <p className="text-gray-400 text-lg mb-4">
              Difficulty: <span className="text-white font-semibold capitalize">{difficulty}</span>
            </p>

            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: difficulty ? `${(round / DIFFICULTY_CONFIG[difficulty].maxRounds) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Game Stats */}
          <div className="mb-8">
            <SimonSaysStats
              round={round}
              sequenceLength={seq.length}
              gameStatus={gameWon ? 'Won!' : gameOver ? 'Game Over' : isShowingSequence ? 'Watch...' : 'Your Turn'}
            />
          </div>

          {/* Color Buttons */}
          <div className="mb-8">
            <SimonSaysGrid
              colors={colors}
              activeColor={activeColor}
              isShowingSequence={isShowingSequence}
              gameOver={gameOver}
              gameWon={gameWon}
              onPress={press}
            />
          </div>

          {/* Instructions */}
          <div className="max-w-md mx-auto mb-8">
            <Instructions gameType="word-guess" />
          </div>

          {/* Game Over Modal */}
          {(gameOver || gameWon) && (
            <SimonSaysGameOverModal
              gameWon={gameWon}
              round={round}
              onRestart={restartGame}
            />
          )}

          {/* Leaderboard */}
          <div className="mt-12">
            <Leaderboard gameType="simon-says" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}