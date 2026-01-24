/**
 * API Route: Get all emoji puzzles (admin/debugging)
 * GET /api/games/emoji/all
 */

import { NextRequest, NextResponse } from 'next/server';
import { EMOJI_PUZZLES, stripAnswer } from '@/utility/games/emoji';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAnswers = searchParams.get('includeAnswers') === 'true';

    // For security, only include answers if explicitly requested
    // In production, you might want to add authentication here
    const puzzles = includeAnswers 
      ? EMOJI_PUZZLES 
      : EMOJI_PUZZLES.map(p => stripAnswer(p));

    console.log('[EMOJI] Returning all puzzles, includeAnswers:', includeAnswers);

    return NextResponse.json({
      puzzles,
      total: EMOJI_PUZZLES.length,
      includeAnswers
    }, { status: 200 });

  } catch (error) {
    console.error('[EMOJI] Error fetching all puzzles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emoji puzzles' },
      { status: 500 }
    );
  }
}
