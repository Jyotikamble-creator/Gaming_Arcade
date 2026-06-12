/**
 * API Route: Start a new Tic Tac Toe game
 * GET /api/games/tic-tac-toe/start
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Player, Board, Winner } from '@/types/games/tic-tac-toe';

interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Winner;
  gameId: string;
  isAIEnabled?: boolean;
  createdAt: Date;
}

// In-memory game storage (in production, use a database)
const activeGames = new Map<string, GameState>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const isAIEnabled = searchParams.get('ai') === 'true';
    const startingPlayer = (searchParams.get('startingPlayer') || 'X') as Player;
    const userId = searchParams.get('userId');

    // Validate starting player
    if (!['X', 'O'].includes(startingPlayer)) {
      return NextResponse.json(
        { error: 'Invalid starting player. Must be X or O' },
        { status: 400 }
      );
    }

    // Create new game
    const gameId = `ttt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const initialBoard: Board = Array(9).fill(null);

    const gameState: GameState = {
      board: initialBoard,
      currentPlayer: startingPlayer,
      winner: null,
      gameId,
      isAIEnabled,
      createdAt: new Date()
    };

    // Store game state
    activeGames.set(gameId, gameState);

    // Clean up old games (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const [id, game] of activeGames.entries()) {
      if (game.createdAt < oneHourAgo) {
        activeGames.delete(id);
      }
    }

    return NextResponse.json({
      success: true,
      game: {
        board: gameState.board,
        currentPlayer: gameState.currentPlayer,
        winner: gameState.winner,
        gameId: gameState.gameId,
        isAIEnabled: gameState.isAIEnabled,
        availableMoves: [0, 1, 2, 3, 4, 5, 6, 7, 8]
      }
    });
  } catch (error) {
    console.error('Tic Tac Toe Start API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}