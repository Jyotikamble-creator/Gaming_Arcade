/**
 * API Route: Start a new memory card game
 * GET /api/games/memory/start
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCards, stripCardValues } from '@/utility/games/memory';
import { createGameSession } from '@/lib/games/memory';
import type { MemoryDifficultyLevel, CardTheme } from '@/types/games/memory';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const difficulty = (searchParams.get('difficulty') || 'Easy') as MemoryDifficultyLevel;
    const theme = (searchParams.get('theme') || 'fruits') as CardTheme;
    const userId = searchParams.get('userId') || undefined;
    const timeLimit = searchParams.get('timeLimit')
      ? parseInt(searchParams.get('timeLimit')!)
      : undefined;

    // Generate shuffled cards
    const cards = generateCards(difficulty, theme);

    // Create game session
    const session = await createGameSession(cards, difficulty, theme, userId, timeLimit);

    // Strip values from cards for client (prevent cheating)
    const clientCards = stripCardValues(cards);

    console.log('[MEMORY] New game started:', {
      sessionId: session.sessionId,
      difficulty,
      theme,
      totalPairs: session.totalPairs,
      cardCount: cards.length
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      cards: clientCards,
      totalPairs: session.totalPairs,
      difficulty,
      theme,
      startTime: session.startTime,
      timeLimit
    }, { status: 200 });

  } catch (error) {
    console.error('[MEMORY] Error starting game:', error);
    return NextResponse.json(
      { error: 'Failed to start memory game' },
      { status: 500 }
    );
  }
}
