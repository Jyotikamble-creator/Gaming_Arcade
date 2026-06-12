/**
 * API Route: Get AI move for Tic Tac Toe
 * POST /api/games/tic-tac-toe/ai-move
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkWinner, makeMove, makeAIMove, getAvailableMoves } from '@/utility/games/tic-tac-toe';
import type { Board, Winner } from '@/types/games/tic-tac-toe';

interface AIMoveRequest {
  board: Board;
  aiPlayer?: 'X' | 'O';
}

export async function POST(request: NextRequest) {
  try {
    const body: AIMoveRequest = await request.json();
    const { board, aiPlayer = 'O' } = body;

    // Validate input
    if (!board || !Array.isArray(board) || board.length !== 9) {
      return NextResponse.json(
        { error: 'Invalid board. Must be an array of 9 elements' },
        { status: 400 }
      );
    }

    if (!['X', 'O'].includes(aiPlayer)) {
      return NextResponse.json(
        { error: 'Invalid AI player. Must be X or O' },
        { status: 400 }
      );
    }

    // Check if game is already over
    const currentWinner = checkWinner(board);
    if (currentWinner) {
      return NextResponse.json(
        { error: 'Game is already finished' },
        { status: 400 }
      );
    }

    // Check if there are available moves
    const availableMoves = getAvailableMoves(board);
    if (availableMoves.length === 0) {
      return NextResponse.json(
        { error: 'No available moves' },
        { status: 400 }
      );
    }

    // Get AI move
    const aiMove = makeAIMove(board);

    if (aiMove === null) {
      return NextResponse.json(
        { error: 'No valid AI move found' },
        { status: 500 }
      );
    }

    // Make the AI move
    const newBoard = makeMove(board, aiMove, aiPlayer);
    const winner = checkWinner(newBoard);
    const remainingMoves = getAvailableMoves(newBoard);

    return NextResponse.json({
      success: true,
      move: aiMove,
      board: newBoard,
      winner: winner,
      availableMoves: remainingMoves,
      aiPlayer: aiPlayer
    });
  } catch (error) {
    console.error('Tic Tac Toe AI Move API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}