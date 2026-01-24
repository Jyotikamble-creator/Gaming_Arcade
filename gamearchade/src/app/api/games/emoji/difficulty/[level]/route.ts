/**
 * API Route: Get emoji puzzle by difficulty level
 * GET /api/games/emoji/difficulty/[level]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRandomPuzzle, stripAnswer } from '@/utility/games/emoji';
import { createGameSession } from '@/lib/games/emoji';
import type { DifficultyLevel } from '@/types/games/emoji';

interface RouteParams {
  params: Promise<{
    level: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { level } = await context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    // Validate difficulty level
    const validDifficulties: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];
    const difficulty = validDifficulties.find(
      d => d.toLowerCase() === level.toLowerCase()
    );

    if (!difficulty) {
      return NextResponse.json(
        { 
          error: 'Invalid difficulty level',
          validLevels: validDifficulties 
        },
        { status: 400 }
      );
    }

    // Get a random puzzle of the specified difficulty
    const puzzle = getRandomPuzzle({ difficulty });

    // Create a game session
    const session = await createGameSession(puzzle, userId, difficulty);

    console.log(`[EMOJI] Serving ${difficulty} puzzle:`, {
      id: puzzle.id,
      answer: puzzle.answer,
      sessionId: session.sessionId
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
    console.error('[EMOJI] Error fetching puzzle by difficulty:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emoji puzzle' },
      { status: 500 }
    );
  }
}
