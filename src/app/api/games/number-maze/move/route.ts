/**
 * API Route: Make a move in Number Maze
 * POST /api/games/number-maze/move
 */

import { NextRequest, NextResponse } from 'next/server';
import { makeMove } from '@/lib/games/number-maze';
import { validateMove } from '@/utility/games/number-maze';
import type { MakeMoveRequest, MazeOperation } from '@/types/games/number-maze';

export async function POST(request: NextRequest) {
  try {
    const body: MakeMoveRequest = await request.json();
    const { sessionId, operation, operand } = body;

    // Validate request
    if (!sessionId || !operation) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, operation' },
        { status: 400 }
      );
    }

    // Get current session to validate move
    const { getMazeSession } = await import('@/lib/games/number-maze');
    const currentSession = await getMazeSession(sessionId);

    if (!currentSession) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 404 }
      );
    }

    if (currentSession.completed) {
      return NextResponse.json(
        { error: 'Maze already completed' },
        { status: 400 }
      );
    }

    // Validate the move
    const validation = validateMove(
      currentSession.currentNumber,
      operation as MazeOperation,
      operand
    );

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Make the move
    const { success, session } = await makeMove(sessionId, operation as MazeOperation, operand);

    if (!success || !session) {
      return NextResponse.json(
        { error: 'Failed to make move' },
        { status: 500 }
      );
    }

    const reachedTarget = session.currentNumber === session.targetNumber;
    const timeElapsed = Math.floor((Date.now() - session.startTime.getTime()) / 1000);

    const message = reachedTarget
      ? '🎯 Congratulations! You reached the target!'
      : session.currentNumber > session.targetNumber
      ? '⚠️ Overshot! Try to get back to the target.'
      : '➡️ Keep going! You\'re getting closer.';

    console.log('[NUMBER-MAZE] Move made:', {
      sessionId,
      operation,
      operand,
      currentNumber: session.currentNumber,
      targetNumber: session.targetNumber,
      reachedTarget
    });

    return NextResponse.json({
      success: true,
      currentNumber: session.currentNumber,
      targetNumber: session.targetNumber,
      moveCount: session.moveCount,
      completed: session.completed,
      reachedTarget,
      message,
      timeElapsed
    }, { status: 200 });

  } catch (error) {
    console.error('[NUMBER-MAZE] Error making move:', error);
    return NextResponse.json(
      { error: 'Failed to make move' },
      { status: 500 }
    );
  }
}
