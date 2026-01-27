/**
 * API Route: Score submissions and retrieval
 * POST /api/scores - Submit a new score
 * GET /api/scores - Get scores/leaderboard with optional filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/auth';
import { createScore, getLeaderboard, validateScoreData } from '@/lib/common/score';

// POST /api/scores
// Body: { game, score, meta?, playerName? }
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { game, score, meta, playerName } = body;

    console.log('[SCORES] Score submission attempt:', { game, score, playerName });

    // Validate score data
    const validation = validateScoreData(game, score, playerName);
    if (!validation.valid) {
      console.warn('[SCORES] Invalid score submission:', { game, score });
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Validate meta if provided
    if (meta && typeof meta !== 'object') {
      console.warn('[SCORES] Invalid meta in score submission');
      return NextResponse.json(
        { error: 'meta must be an object if provided' },
        { status: 400 }
      );
    }

    // Get userId from token (if authenticated)
    const userId = getUserIdFromRequest(request);

    // Create score
    const newScore = await createScore(
      game,
      score,
      userId ? undefined : playerName || 'guest',
      meta || {},
      userId || undefined
    );

    console.log('[SCORES] Score submitted successfully:', {
      id: newScore._id.toString(),
      game,
      score,
    });

    return NextResponse.json(
      { ok: true, score: newScore },
      { status: 201 }
    );
  } catch (error) {
    console.error('[SCORES] Score submission error:', error);
    return NextResponse.json(
      { error: 'server error' },
      { status: 500 }
    );
  }
}

// GET /api/scores?game=word-guess&limit=10
// Query params: game (string), limit (number)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('[SCORES] Fetching scores:', { game, limit });

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Get scores/leaderboard
    const scores = game 
      ? await getLeaderboard(game, limit)
      : await getLeaderboard('word-guess', limit); // Default game

    console.log('[SCORES] Scores fetched:', { count: scores.length, game });

    return NextResponse.json(scores);
  } catch (error) {
    console.error('[SCORES] Fetch scores error:', error);
    return NextResponse.json(
      { error: 'server error' },
      { status: 500 }
    );
  }
}
