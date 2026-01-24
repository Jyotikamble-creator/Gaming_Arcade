/**
 * API Route: Calculate score for Number Maze
 * POST /api/games/number-maze/calculate-score
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateScore,
  getRating,
  getMessage,
  calculateMoveEfficiency,
  calculateTimeEfficiency
} from '@/utility/games/number-maze';
import type { CalculateScoreRequest, NumberMazeDifficultyLevel } from '@/types/games/number-maze';

export async function POST(request: NextRequest) {
  try {
    const body: CalculateScoreRequest = await request.json();
    const { moves, timeElapsed, targetNumber = 0, difficulty = 'beginner' } = body;

    // Validate input
    if (!moves || typeof moves !== 'number' || moves < 0) {
      return NextResponse.json(
        { error: 'Moves is required and must be a non-negative number' },
        { status: 400 }
      );
    }

    if (!timeElapsed || typeof timeElapsed !== 'number' || timeElapsed < 0) {
      return NextResponse.json(
        { error: 'Time elapsed is required and must be a non-negative number' },
        { status: 400 }
      );
    }

    // Calculate score and stats
    const score = calculateScore(moves, timeElapsed, targetNumber, difficulty as NumberMazeDifficultyLevel);
    const rating = getRating(moves, timeElapsed);
    const message = getMessage(moves, timeElapsed);
    const moveEfficiency = calculateMoveEfficiency(moves);
    const timeEfficiency = calculateTimeEfficiency(timeElapsed);

    console.log('[NUMBER-MAZE] Score calculated:', {
      moves,
      timeElapsed,
      score,
      rating
    });

    return NextResponse.json({
      score,
      rating,
      message,
      stats: {
        moveEfficiency,
        timeEfficiency
      }
    }, { status: 200 });

  } catch (error) {
    console.error('[NUMBER-MAZE] Error calculating score:', error);
    return NextResponse.json(
      { error: 'Failed to calculate score' },
      { status: 500 }
    );
  }
}
