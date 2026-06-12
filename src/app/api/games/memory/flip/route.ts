/**
 * API Route: Flip cards in memory game
 * POST /api/games/memory/flip
 */

import { NextRequest, NextResponse } from 'next/server';
import { flipCards, getGameSession } from '@/lib/games/memory';
import { validateFlipRequest, getCardsByIds } from '@/utility/games/memory';
import type { FlipCardRequest } from '@/types/games/memory';

export async function POST(request: NextRequest) {
  try {
    const body: FlipCardRequest = await request.json();
    const { sessionId, cardIds } = body;

    // Validate request
    if (!sessionId || !cardIds || !Array.isArray(cardIds)) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, cardIds' },
        { status: 400 }
      );
    }

    // Get current session to validate
    const currentSession = await getGameSession(sessionId);
    if (!currentSession) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 404 }
      );
    }

    if (currentSession.completed) {
      return NextResponse.json(
        { error: 'Game already completed' },
        { status: 400 }
      );
    }

    // Validate flip request
    const validation = validateFlipRequest(cardIds, currentSession.cards);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Flip the cards
    const { match, session } = await flipCards(sessionId, cardIds);

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to flip cards' },
        { status: 500 }
      );
    }

    // Get the flipped cards with values
    const flippedCards = getCardsByIds(session.cards, cardIds);

    const message = match 
      ? '🎉 Match found!' 
      : '❌ Not a match. Try again!';

    console.log('[MEMORY] Cards flipped:', {
      sessionId,
      cardIds,
      match,
      moves: session.moves,
      matches: session.matches,
      completed: session.completed
    });

    return NextResponse.json({
      match,
      cards: flippedCards.map(c => ({
        id: c.id,
        value: c.value,
        matched: c.matched
      })),
      moves: session.moves,
      matches: session.matches,
      completed: session.completed,
      score: session.score,
      message
    }, { status: 200 });

  } catch (error) {
    console.error('[MEMORY] Error flipping cards:', error);
    return NextResponse.json(
      { error: 'Failed to flip cards' },
      { status: 500 }
    );
  }
}
