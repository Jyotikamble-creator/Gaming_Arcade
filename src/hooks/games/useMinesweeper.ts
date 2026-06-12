"use client";

import { useState, useEffect, useCallback } from 'react';
import type {
  MinesweeperGame,
  MinesweeperDifficulty,
  MinesweeperMoveData,
  MinesweeperResult,
  MinesweeperConfig
} from '@/types/games/minesweeper';
import {
  createMinesweeperGame,
  makeMinesweeperMove
} from '@/lib/games/minesweeper';

export interface UseMinesweeperReturn {
  game: MinesweeperGame | null;
  isLoading: boolean;
  error: string | null;
  gameTime: number;
  startNewGame: (difficulty?: MinesweeperDifficulty, customConfig?: Partial<MinesweeperConfig>) => void;
  makeMove: (move: MinesweeperMoveData) => void;
  resetGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  getGameStats: () => Promise<void>;
}

const initialGame: MinesweeperGame | null = null;

export function useMinesweeper(): UseMinesweeperReturn {
  const [game, setGame] = useState<MinesweeperGame | null>(initialGame);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameTime, setGameTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (game?.status === 'playing' && game.startTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - game.startTime!.getTime()) / 1000);
        setGameTime(elapsed);
      }, 1000);
      setTimerInterval(interval);

      return () => {
        clearInterval(interval);
        setTimerInterval(null);
      };
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  }, [game?.status, game?.startTime]);

  // Start a new game
  const startNewGame = useCallback(async (
    difficulty: MinesweeperDifficulty = 'beginner',
    customConfig?: Partial<MinesweeperConfig>
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API delay for realistic experience
      await new Promise(resolve => setTimeout(resolve, 300));

      const newGame = createMinesweeperGame(difficulty, customConfig);
      setGame(newGame);
      setGameTime(0);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start new game');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Make a move
  const makeMove = useCallback((move: MinesweeperMoveData) => {
    if (!game || game.status !== 'playing' && game.status !== 'ready') return;

    try {
      const { game: updatedGame, result } = makeMinesweeperMove(game, move);
      setGame(updatedGame);

      // Handle game end
      if (result) {
        // Could save result to database here
        console.log('Game ended:', result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make move');
    }
  }, [game]);

  // Reset current game
  const resetGame = useCallback(() => {
    if (!game) return;

    const resetGame = createMinesweeperGame(game.config.difficulty, game.config);
    setGame(resetGame);
    setGameTime(0);
    setError(null);
  }, [game]);

  // Pause game
  const pauseGame = useCallback(() => {
    if (!game || game.status !== 'playing') return;

    const pausedGame = { ...game, status: 'ready' as const };
    setGame(pausedGame);
  }, [game]);

  // Resume game
  const resumeGame = useCallback(() => {
    if (!game || game.status !== 'ready' || !game.startTime) return;

    const resumedGame = { ...game, status: 'playing' as const };
    setGame(resumedGame);
  }, [game]);

  // Get game statistics (placeholder for future API integration)
  const getGameStats = useCallback(async () => {
    try {
      // TODO: Implement API call to get user stats
      console.log('Getting game stats...');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get game stats');
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  return {
    game,
    isLoading,
    error,
    gameTime,
    startNewGame,
    makeMove,
    resetGame,
    pauseGame,
    resumeGame,
    getGameStats
  };
}