/**
 * API Route: Make a move in Tic Tac Toe game
 * POST /api/games/tic-tac-toe/move
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkWinner, makeMove, makeAIMove, getAvailableMoves } from '@/utility/games/tic-tac-toe';
import type { Player, Board, Winner } from '@/types/games/tic-tac-toe';

interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Winner;
  gameId: string;
  isAIEnabled?: boolean;
  createdAt: Date;
}

interface MoveRequest {
  gameId: string;
  position: number;
  player: Player;
}

// In-memory game storage (in production, use a database)
const activeGames = new Map<string, GameState>();

export async function POST(request: NextRequest) {
  try {
    const body: MoveRequest = await request.json();
    const { gameId, position, player } = body;

    // Validate input
    if (!gameId || typeof position !== 'number' || !['X', 'O'].includes(player)) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    // Validate position
    if (position < 0 || position > 8) {
      return NextResponse.json(
        { error: 'Position must be between 0 and 8' },
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

    // Check if position is already occupied
    if (game.board[position] !== null) {
      return NextResponse.json(
        { error: 'Position already occupied' },
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
    let aiMovePosition: number | null = null;

    // Handle AI move if enabled and it's AI's turn
    if (game.isAIEnabled && !winner && game.currentPlayer === 'X') {
      game.currentPlayer = 'O';
      aiMovePosition = makeAIMove(newBoard);

      if (aiMovePosition !== null) {
        const aiBoard = makeMove(newBoard, aiMovePosition, 'O');
        const aiWinner = checkWinner(aiBoard);

        game.board = aiBoard;
        game.winner = aiWinner;
        game.currentPlayer = 'X';
        aiMove = aiMovePosition;
      }
    } else {
      game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
    }

    const availableMoves = getAvailableMoves(game.board);

    return NextResponse.json({
      success: true,
      game: {
        board: game.board,
        currentPlayer: game.currentPlayer,
        winner: game.winner,
        gameId: game.gameId,
        aiMove: aiMove,
        availableMoves: availableMoves
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