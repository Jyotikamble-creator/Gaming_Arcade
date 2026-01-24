/**
 * API Route: Submit completed Number Maze
 * POST /api/games/number-maze/submit
 */

import { NextRequest, NextResponse } from 'next/server';
import { completeMazeSession } from '@/lib/games/number-maze';
import {
  getRating,
  getMessage,
  calculateMoveEfficiency,
  calculateTimeEfficiency,
  calculatePathOptimality
} from '@/utility/games/number-maze';
import type { SubmitMazeRequest } from '@/types/games/number-maze';

export async function POST(request: NextRequest) {
  try {
    const body: SubmitMazeRequest = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required field: sessionId' },
        { status: 400 }
      );
    }

    const session = await completeMazeSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const rating = getRating(session.moveCount, session.timeElapsed);
    const message = getMessage(session.moveCount, session.timeElapsed);
    const moveEfficiency = calculateMoveEfficiency(session.moveCount);
    const timeEfficiency = calculateTimeEfficiency(session.timeElapsed);
    const pathOptimality = calculatePathOptimality(session.moveCount, session.difficulty);

    console.log('[NUMBER-MAZE] Maze submitted:', {
      sessionId,
      success: session.success,
      moves: session.moveCount,
      timeElapsed: session.timeElapsed,
      score: session.score,
      rating
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      completed: session.completed,
      success: session.success,
      moves: session.moveCount,
      timeElapsed: session.timeElapsed,
      score: session.score,
      rating,
      message,
      performance: {
        moveEfficiency,
        timeEfficiency,
        pathOptimality
      }
    }, { status: 200 });

  } catch (error) {
    console.error('[NUMBER-MAZE] Error submitting maze:', error);
    return NextResponse.json(
      { error: 'Failed to submit maze' },
      { status: 500 }
    );
  }
}
