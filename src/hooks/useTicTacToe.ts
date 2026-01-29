// Custom hook for Tic Tac Toe game logic
import { useState, useCallback } from 'react';
import { Board, Player, Winner, GameScores } from '../types/ticTacToe';
import { WINNING_LINES, GAME_CONFIG } from '../utils/ticTacToeUtils';
import { saveScore } from '../api/scoreApi';
import { logger, LogTags } from '../lib/logger';

export interface UseTicTacToeReturn {
  board: Board;
  isXNext: boolean;
  winner: Winner;
  scores: GameScores;
  gamesPlayed: number;
  handleClick: (index: number) => void;
  resetGame: () => void;
  resetScores: () => void;
}

export function useTicTacToe(): UseTicTacToeReturn {
  const [board, setBoard] = useState<Board>(Array(GAME_CONFIG.BOARD_SIZE).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<Winner>(null);
  const [scores, setScores] = useState<GameScores>({ X: 0, O: 0 });
  const [gamesPlayed, setGamesPlayed] = useState<number>(0);

  // Function to calculate the winner
  const calculateWinner = useCallback((squares: Board): Player | null => {
    for (let i = 0; i < WINNING_LINES.length; i++) {
      const [a, b, c] = WINNING_LINES[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a] as Player;
      }
    }
    return null;
  }, []);

  // Function to handle a click
  const handleClick = useCallback((i: number): void => {
    if (board[i] || winner) return;

    const newBoard: Board = board.slice();
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const win = calculateWinner(newBoard);
    if (win) {
      setWinner(win);
      setScores(prev => ({ ...prev, [win]: prev[win] + 1 }));
      setGamesPlayed(prev => prev + 1);
      saveScore({ game: GAME_CONFIG.GAME_NAME, playerName: 'guest', score: GAME_CONFIG.SCORE_PER_WIN }).catch(() => { });
      logger.info('Tic-tac-toe game won', { winner: win, gamesPlayed: gamesPlayed + 1 }, LogTags.SAVE_SCORE);
    } else if (newBoard.every(cell => cell !== null)) {
      setWinner('Draw');
      setGamesPlayed(prev => prev + 1);
      logger.info('Tic-tac-toe game draw', { gamesPlayed: gamesPlayed + 1 }, LogTags.TIC_TAC_TOE);
    }
  }, [board, isXNext, winner, calculateWinner, gamesPlayed]);

  // Function to reset the game
  const resetGame = useCallback((): void => {
    setBoard(Array(GAME_CONFIG.BOARD_SIZE).fill(null));
    setIsXNext(true);
    setWinner(null);
    logger.debug('Tic-tac-toe game reset', {}, LogTags.TIC_TAC_TOE);
  }, []);

  // Function to reset scores
  const resetScores = useCallback((): void => {
    setScores({ X: 0, O: 0 });
    setGamesPlayed(0);
    resetGame();
    logger.info('Tic-tac-toe scores reset', {}, LogTags.TIC_TAC_TOE);
  }, [resetGame]);

  return {
    board,
    isXNext,
    winner,
    scores,
    gamesPlayed,
    handleClick,
    resetGame,
    resetScores
  };
}