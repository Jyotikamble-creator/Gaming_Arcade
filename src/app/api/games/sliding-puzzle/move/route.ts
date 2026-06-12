/**
 * API Route: Handle sliding puzzle moves
 * POST /api/games/sliding-puzzle/move
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateSlidingPuzzleScore } from '@/lib/games/sliding-puzzle';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, piecePosition, direction } = body;

    if (!sessionId || piecePosition === undefined || !direction) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, piecePosition, direction' },
        { status: 400 }
      );
    }

    // Simulate move processing (in a real implementation, you'd fetch from database)
    // For now, return a simple response indicating the move was processed
    const isValidMove = Math.random() > 0.1; // 90% chance of valid move
    const isCompleted = Math.random() > 0.8; // 20% chance of completion

    console.log('[SLIDING-PUZZLE] Move processed:', {
      sessionId,
      piecePosition,
      direction,
      isValidMove,
      isCompleted
    });

    return NextResponse.json({
      sessionId,
      isValidMove,
      isCompleted,
      moveCount: Math.floor(Math.random() * 100) + 20,
      score: isCompleted ? Math.floor(Math.random() * 1000) + 500 : undefined,
      completionTime: isCompleted ? Math.floor(Math.random() * 300) + 60 : undefined
    }, { status: 200 });

  } catch (error) {
    console.error('[SLIDING-PUZZLE] Error processing move:', error);
    return NextResponse.json(
      { error: 'Failed to process move' },
      { status: 500 }
    );
  }
}