/**
 * API Route: Start a new emoji puzzle game
 * GET /api/games/emoji/start
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRandomPuzzle, stripAnswer } from '@/utility/games/emoji';
import { createGameSession } from '@/lib/games/emoji';
import type { DifficultyLevel, PuzzleCategory } from '@/types/games/emoji';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty') as DifficultyLevel | null;
    const category = searchParams.get('category') as PuzzleCategory | null;
    const userId = searchParams.get('userId') || undefined;

    // Get a random puzzle with optional filters
    const puzzle = getRandomPuzzle({
      difficulty: difficulty || undefined,
      category: category || undefined
    });

    // Create a game session
    const session = await createGameSession(puzzle, userId, difficulty || undefined);

    console.log('[EMOJI] Serving puzzle:', {
      id: puzzle.id,
      answer: puzzle.answer,
      sessionId: session.sessionId,
      difficulty: puzzle.difficulty,
      category: puzzle.category
    });

    // Return puzzle without answer and session info
    return NextResponse.json({
      sessionId: session.sessionId,
      puzzle: stripAnswer(puzzle),
      startTime: session.startTime,
      difficulty: puzzle.difficulty,
      category: puzzle.category
    }, { status: 200 });

  } catch (error) {
    console.error('[EMOJI] Error starting game:', error);
    return NextResponse.json(
      { error: 'Failed to start emoji puzzle game' },
      { status: 500 }
    );
  }
}
