/**
 * API Route: Get reaction time benchmarks
 * GET /api/games/reaction-time/benchmarks
 */

import { NextRequest, NextResponse } from 'next/server';
import { REACTION_BENCHMARKS, DIFFICULTY_CONFIGS } from '@/utility/games/reaction-time';

export async function GET(request: NextRequest) {
  try {
    console.log('[REACTION-TIME] Benchmarks retrieved');

    return NextResponse.json({
      success: true,
      benchmarks: REACTION_BENCHMARKS,
      difficultyInfo: DIFFICULTY_CONFIGS
    }, { status: 200 });

  } catch (error) {
    console.error('[REACTION-TIME] Error getting benchmarks:', error);
    
    return NextResponse.json(
      { error: 'Failed to get benchmarks' },
      { status: 500 }
    );
  }
}
