import { NextRequest, NextResponse } from 'next/server';
import { getSlidingPuzzleBenchmarks } from '@/lib/games/sliding-puzzle';
import type { ISlidingPuzzleBenchmarks } from '@/types/games/sliding-puzzle';

/**
 * GET /api/sliding-puzzle/benchmarks
 * Get difficulty benchmarks for sliding puzzle game
 */
export async function GET(request: NextRequest) {
  try {
    const benchmarks: ISlidingPuzzleBenchmarks = getSlidingPuzzleBenchmarks();

    return NextResponse.json(benchmarks, { status: 200 });
  } catch (error) {
    console.error('Sliding puzzle benchmarks error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get benchmarks', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}