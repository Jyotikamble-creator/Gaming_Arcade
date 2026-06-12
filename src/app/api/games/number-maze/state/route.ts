/**
 * API Route: Get game state for Number Maze
 * GET /api/games/number-maze/state
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMazeSession } from '@/lib/games/number-maze';
import { generateHint } from '@/utility/games/number-maze';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const includeHint = searchParams.get('hint') === 'true';

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required parameter: sessionId' },
        { status: 400 }
      );
    }

    const session = await getMazeSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const timeElapsed = session.endTime
      ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000)
      : Math.floor((Date.now() - session.startTime.getTime()) / 1000);

    const hint = includeHint 
      ? generateHint(session.currentNumber, session.targetNumber)
      : undefined;

    console.log('[NUMBER-MAZE] Game state retrieved:', {
      sessionId,
      currentNumber: session.currentNumber,
      moveCount: session.moveCount
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      startNumber: session.startNumber,
      targetNumber: session.targetNumber,
      currentNumber: session.currentNumber,
      moveCount: session.moveCount,
      timeElapsed,
      completed: session.completed,
      success: session.success,
      moveHistory: session.moves,
      hint
    }, { status: 200 });

  } catch (error) {
    console.error('[NUMBER-MAZE] Error fetching game state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game state' },
      { status: 500 }
    );
  }
}
