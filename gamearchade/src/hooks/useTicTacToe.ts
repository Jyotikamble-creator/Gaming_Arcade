// Custom hook for Tic Tac Toe game logic
import { useState, useCallback } from 'react';
import { 
  Player, 
  Board, 
  Winner, 
  GameScores, 
  TicTacToeHookReturn 
} from '@/types/games/tic-tac-toe';
import { 
  checkWinner, 
  makeMove, 
  getNextPlayer, 
  GAME_CONFIG 
} from '@/utility/games/tic-tac-toe';

const initialBoard: Board = Array(GAME_CONFIG.BOARD_SIZE).fill(null);
const initialScores: GameScores = { X: 0, O: 0 };

export const useTicTacToe = (): TicTacToeHookReturn => {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<Winner>(null);
  const [scores, setScores] = useState<GameScores>(initialScores);
  const [gamesPlayed, setGamesPlayed] = useState<number>(0);

  const handleClick = useCallback((index: number): void => {
    // Prevent moves if game is over or cell is occupied
    if (winner || board[index]) {
      return;
    }

    const currentPlayer: Player = isXNext ? 'X' : 'O';
    const newBoard = makeMove(board, index, currentPlayer);
    
    setBoard(newBoard);
    
    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setGamesPlayed(prev => prev + 1);
      
      // Update scores if there's a winner (not a draw)
      if (gameWinner !== 'Draw') {
        setScores(prev => ({
          ...prev,
          [gameWinner]: prev[gameWinner] + 1
        }));
      }
    } else {
      setIsXNext(prev => !prev);
    }
  }, [board, isXNext, winner]);

  const resetGame = useCallback((): void => {
    setBoard(initialBoard);
    setIsXNext(true);
    setWinner(null);
  }, []);

  const resetScores = useCallback((): void => {
    setScores(initialScores);
    setGamesPlayed(0);
    resetGame();
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
};