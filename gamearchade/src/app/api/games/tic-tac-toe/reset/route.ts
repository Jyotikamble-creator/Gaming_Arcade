/**
 * API Route: Reset Tic Tac Toe game
 * POST /api/games/tic-tac-toe/reset
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

interface ResetRequest {
  gameId: string;
  startingPlayer?: Player;
  keepAI?: boolean;
}

// In-memory game storage (in production, use a database)
const activeGames = new Map<string, GameState>();

export async function POST(request: NextRequest) {
  try {
    const body: ResetRequest = await request.json();
    const { gameId, startingPlayer = 'X', keepAI = true } = body;

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    // Validate starting player
    if (!['X', 'O'].includes(startingPlayer)) {
      return NextResponse.json(
        { error: 'Invalid starting player. Must be X or O' },
        { status: 400 }
      );
    }

    const existingGame = activeGames.get(gameId);

    if (!existingGame) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Reset the game state
    const resetGameState: GameState = {
      board: Array(9).fill(null),
      currentPlayer: startingPlayer,
      winner: null,
      gameId: gameId,
      isAIEnabled: keepAI ? existingGame.isAIEnabled : false,
      createdAt: new Date()
    };

    // Update the game
    activeGames.set(gameId, resetGameState);

    return NextResponse.json({
      success: true,
      game: {
        board: resetGameState.board,
        currentPlayer: resetGameState.currentPlayer,
        winner: resetGameState.winner,
        gameId: resetGameState.gameId,
        isAIEnabled: resetGameState.isAIEnabled,
        availableMoves: [0, 1, 2, 3, 4, 5, 6, 7, 8]
      },
      message: 'Game reset successfully'
    });
  } catch (error) {
    console.error('Tic Tac Toe Reset API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}