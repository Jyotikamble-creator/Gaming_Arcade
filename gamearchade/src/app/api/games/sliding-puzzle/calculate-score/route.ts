import { NextRequest, NextResponse } from 'next/server';
import { calculateSlidingPuzzleScore } from '@/lib/games/sliding-puzzle';
import type { 
  SlidingPuzzleScoreRequest, 
  SlidingPuzzleScoreResponse 
} from '@/types/games/sliding-puzzle';

/**
 * POST /api/sliding-puzzle/calculate-score
 * Calculate score based on performance metrics
 */
export async function POST(request: NextRequest) {
  try {
    const body: SlidingPuzzleScoreRequest = await request.json();
    const { moves, timeElapsed, difficulty, puzzleSize } = body;

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

    // Calculate score using lib function
    const scoreResult: SlidingPuzzleScoreResponse = calculateSlidingPuzzleScore({
      moves,
      timeElapsed,
      difficulty,
      puzzleSize
    });

    return NextResponse.json(scoreResult, { status: 200 });
  } catch (error) {
    console.error('Sliding puzzle score calculation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to calculate score', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}