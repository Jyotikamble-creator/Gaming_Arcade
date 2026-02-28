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
import AnimatedBackground from '@/components/AnimatedBackground';

// Simon Says Page Component
export default function SimonSays(): JSX.Element {
  const [colors, setColors] = useState<string[]>([]);
  const [seq, setSeq] = useState<string[]>([]);
  const [playerSeq, setPlayerSeq] = useState<string[]>([]);
  const [round, setRound] = useState<number>(0);
  const [isShowingSequence, setIsShowingSequence] = useState<boolean>(false);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize game
  useEffect(() => {
    const initializeGame = async (): Promise<void> => {
      try {
        setIsLoading(true);
        logger.info('Starting Simon Says game', {});
        const r = await startSimon();
        setColors(r.data.colors || ['red', 'blue', 'green', 'yellow']);
        setSeq([]);
        setPlayerSeq([]);
        setRound(0);
        setGameOver(false);
        setGameWon(false);
        setActiveColor(null);
        nextRound([]);
        logger.info('Simon Says initialized', { colors: r.data.colors?.length || 4 });
      } catch (error) {
        logger.error('Failed to start Simon Says', error, {});
        setColors(['red', 'blue', 'green', 'yellow']);
        nextRound([]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGame();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Restart game
  const restartGame = async (): Promise<void> => {
    try {
      setIsLoading(true);
      logger.info('Restarting Simon Says game', {});
      const r = await startSimon();
      setColors(r.data.colors || ['red', 'blue', 'green', 'yellow']);
      setSeq([]);
      setPlayerSeq([]);
      setRound(0);
      setGameOver(false);
      setGameWon(false);
      setActiveColor(null);
      nextRound([]);
      logger.info('Simon Says restarted', { colors: r.data.colors?.length || 4 });
    } catch (error) {
      logger.error('Failed to restart Simon Says', error, {});
      setColors(['red', 'blue', 'green', 'yellow']);
      nextRound([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Next round
  const nextRound = useCallback((prev: string[]): void => {
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
          setTimeout(showNext, 300);
        }, 600);
      } else {
        setIsShowingSequence(false);
      }
    };
    setTimeout(showNext, 1000);
  }, [colors]);

  // Press button
  const press = useCallback((c: string): void => {
    if (isShowingSequence || gameOver || gameWon) return;

    const pos = playerSeq.length;
    const newSeq = [...playerSeq, c];
    setPlayerSeq(newSeq);

    // Visual feedback
    setActiveColor(c);
    setTimeout(() => setActiveColor(null), 200);

    if (seq[pos] !== c) {
      // Wrong sequence
      setGameOver(true);
      const score = round - 1;
      submitScore({ game: 'simon-says', score, meta: { roundsCompleted: round - 1 } });
      logger.info('Simon Says game over - wrong sequence', { score, round });
    } else if (newSeq.length === seq.length) {
      // Round completed
      if (newSeq.length === 10) {
        // Game won
        setGameWon(true);
        submitScore({ game: 'simon-says', score: 100, meta: { roundsCompleted: 10 } });
        logger.info('Simon Says game won', { score: 100 });
      } else {
        // Next round
        setTimeout(() => nextRound(seq), 1000);
      }
    }
  }, [seq, playerSeq, isShowingSequence, gameOver, gameWon, round, nextRound]);

  // Render
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

  // Main render
  return (
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">≡ƒÄ» Simon Says</h1>
          <p className="text-subtle-text">Repeat the color sequence to advance!</p>
        </div>

        {/* Game Stats */}
        <SimonSaysStats
          round={round}
          sequenceLength={seq.length}
          gameStatus={gameWon ? 'Won!' : gameOver ? 'Game Over' : isShowingSequence ? 'Watch...' : 'Your Turn'}
        />

        {/* Color Buttons */}
        <SimonSaysGrid
          colors={colors}
          activeColor={activeColor}
          isShowingSequence={isShowingSequence}
          gameOver={gameOver}
          gameWon={gameWon}
          onPress={press}
        />

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="simon-says" />
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
          <Leaderboard game="simon-says" />
        </div>
      </div>
    </div>
  );
}