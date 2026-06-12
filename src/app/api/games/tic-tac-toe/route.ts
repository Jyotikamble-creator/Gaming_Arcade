/**
 * API Route: Tic Tac Toe game operations
 * GET/POST /api/games/tic-tac-toe
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkWinner, makeMove, getAvailableMoves, makeAIMove } from '@/utility/games/tic-tac-toe';
import type { Player, Board, Winner } from '@/types/games/tic-tac-toe';

interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Winner;
  gameId: string;
  isAIEnabled?: boolean;
}

interface MoveRequest {
  gameId: string;
  position: number;
  player: Player;
  isAI?: boolean;
}

// In-memory game storage (in production, use a database)
const activeGames = new Map<string, GameState>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    const game = activeGames.get(gameId);
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      game: {
        board: game.board,
        currentPlayer: game.currentPlayer,
        winner: game.winner,
        gameId: game.gameId,
        isAIEnabled: game.isAIEnabled
      }
    });
  } catch (error) {
    console.error('Tic Tac Toe API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MoveRequest = await request.json();
    const { gameId, position, player, isAI = false } = body;

    // Validate input
    if (!gameId || typeof position !== 'number' || !['X', 'O'].includes(player)) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    const game = activeGames.get(gameId);
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Check if game is already over
    if (game.winner) {
      return NextResponse.json(
        { error: 'Game is already finished' },
        { status: 400 }
      );
    }

    // Check if it's the correct player's turn
    if (game.currentPlayer !== player) {
      return NextResponse.json(
        { error: 'Not your turn' },
        { status: 400 }
      );
    }

    // Check if position is valid
    if (position < 0 || position > 8 || game.board[position] !== null) {
      return NextResponse.json(
        { error: 'Invalid move' },
        { status: 400 }
      );
    }

    // Make the move
    const newBoard = makeMove(game.board, position, player);
    const winner = checkWinner(newBoard);

    // Update game state
    game.board = newBoard;
    game.winner = winner;

    let aiMove: number | null = null;

    // Handle AI move if enabled and it's AI's turn
    if (isAI && !winner && game.currentPlayer === 'X') {
      game.currentPlayer = 'O';
      aiMove = makeAIMove(newBoard);

      if (aiMove !== null) {
        const aiBoard = makeMove(newBoard, aiMove, 'O');
        const aiWinner = checkWinner(aiBoard);

        game.board = aiBoard;
        game.winner = aiWinner;
        game.currentPlayer = 'X';
      }
    } else {
      game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
    }

    return NextResponse.json({
      success: true,
      game: {
        board: game.board,
        currentPlayer: game.currentPlayer,
        winner: game.winner,
        gameId: game.gameId,
        aiMove: aiMove
      }
    });
  } catch (error) {
    console.error('Tic Tac Toe Move API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}