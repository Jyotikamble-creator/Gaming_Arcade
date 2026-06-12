/**
 * API Route: Complete a memory game session
 * POST /api/games/memory/complete
 */

import { NextRequest, NextResponse } from 'next/server';
import { completeGameSession, calculatePerformanceMetrics } from '@/lib/games/memory';
import { getBadge } from '@/utility/games/memory';
import type { CompleteGameRequest } from '@/types/games/memory';

export async function POST(request: NextRequest) {
  try {
    const body: CompleteGameRequest = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required field: sessionId' },
        { status: 400 }
      );
    }

    const session = await completeGameSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const timeTaken = session.endTime
      ? session.endTime.getTime() - session.startTime.getTime()
      : 0;

    const performance = calculatePerformanceMetrics(session);
    const badge = getBadge(session.moves, session.totalPairs, timeTaken);

    console.log('[MEMORY] Game completed:', {
      sessionId,
      moves: session.moves,
      matches: session.matches,
      score: session.score,
      timeTaken,
      performance: performance.rating
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      completed: session.completed,
      moves: session.moves,
      matches: session.matches,
      totalPairs: session.totalPairs,
      timeTaken,
      score: session.score,
      performance: performance.rating,
      badge,
      metrics: {
        efficiency: performance.efficiency,
        speed: performance.speed,
        accuracy: performance.accuracy
      }
    }, { status: 200 });

  } catch (error) {
    console.error('[MEMORY] Error completing game:', error);
    return NextResponse.json(
      { error: 'Failed to complete game' },
      { status: 500 }
    );
  }
}
