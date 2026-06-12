/**
 * API Route: Get current game state
 * GET /api/games/memory/state
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGameState } from '@/lib/games/memory';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required parameter: sessionId' },
        { status: 400 }
      );
    }

    const session = await getGameState(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Calculate time elapsed
    const timeElapsed = session.endTime
      ? session.endTime.getTime() - session.startTime.getTime()
      : Date.now() - session.startTime.getTime();

    // Return cards without values for unmatched/unflipped cards
    const cards = session.cards.map(card => ({
      id: card.id,
      matched: card.matched,
      flipped: card.flipped || false,
      value: card.matched ? card.value : undefined // Only show value if matched
    }));

    console.log('[MEMORY] Game state retrieved:', {
      sessionId,
      moves: session.moves,
      matches: session.matches,
      completed: session.completed
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      cards,
      moves: session.moves,
      matches: session.matches,
      totalPairs: session.totalPairs,
      startTime: session.startTime,
      timeElapsed,
      completed: session.completed,
      score: session.score
    }, { status: 200 });

  } catch (error) {
    console.error('[MEMORY] Error fetching game state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game state' },
      { status: 500 }
    );
  }
}
