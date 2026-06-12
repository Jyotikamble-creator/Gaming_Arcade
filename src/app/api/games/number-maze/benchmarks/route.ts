/**
 * API Route: Get difficulty benchmarks for Number Maze
 * GET /api/games/number-maze/benchmarks
 */

import { NextRequest, NextResponse } from 'next/server';
import { DIFFICULTY_BENCHMARKS } from '@/utility/games/number-maze';

export async function GET(request: NextRequest) {
  try {
    console.log('[NUMBER-MAZE] Benchmarks requested');

    return NextResponse.json(DIFFICULTY_BENCHMARKS, { status: 200 });

  } catch (error) {
    console.error('[NUMBER-MAZE] Error fetching benchmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch benchmarks' },
      { status: 500 }
    );
  }
}
