/**
 * API Route: Calculate reaction time score
 * POST /api/games/reaction-time/calculate-score
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateScore, getPerformanceCategory } from '@/utility/games/reaction-time';
import type { CalculateScoreRequest, ReactionDifficulty } from '@/types/games/reaction-time';

export async function POST(request: NextRequest) {
  try {
    const body: CalculateScoreRequest = await request.json();

    const { averageTime, bestTime, allTimes, difficulty = 'medium', falseStarts = 0 } = body;

    // Validate input
    if (!averageTime || !bestTime || !allTimes || !Array.isArray(allTimes)) {
      return NextResponse.json(
        { error: 'Missing required fields: averageTime, bestTime, allTimes' },
        { status: 400 }
      );
    }

    if (allTimes.length === 0) {
      return NextResponse.json(
        { error: 'allTimes array cannot be empty' },
        { status: 400 }
      );
    }

    // Calculate score
    const { score, breakdown } = calculateScore(
      averageTime,
      bestTime,
      allTimes,
      difficulty as ReactionDifficulty,
      falseStarts
    );

    // Get performance category
    const performance = getPerformanceCategory(averageTime);

    console.log('[REACTION-TIME] Score calculated:', {
      averageTime,
      bestTime,
      score,
      performance
    });

    return NextResponse.json({
      success: true,
      score,
      breakdown,
      performance
    }, { status: 200 });

  } catch (error) {
    console.error('[REACTION-TIME] Error calculating score:', error);
    
    return NextResponse.json(
      { error: 'Failed to calculate score' },
      { status: 500 }
    );
  }
}
