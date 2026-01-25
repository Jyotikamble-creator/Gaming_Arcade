/**
 * API Route: Get authenticated user's scores
 * GET /api/scores/me?game=word-guess
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/auth';
import { getUserScores } from '@/lib/common/score';

export async function GET(request: NextRequest) {
  try {
    // Get userId from token
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      console.warn('[SCORES] Unauthorized access to /me');
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game') || undefined;

    console.log('[SCORES] Fetching user scores:', { userId, game });

    // Get user's scores
    const scores = await getUserScores(userId, game);

    console.log('[SCORES] User scores fetched:', {
      userId,
      count: scores.length,
    });

    return NextResponse.json(scores);
  } catch (error) {
    console.error('[SCORES] Fetch user scores error:', error);
    return NextResponse.json(
      { error: 'server error' },
      { status: 500 }
    );
  }
}
