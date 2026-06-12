/**
 * API Route: Score management
 * GET /api/scores - Get scores with filtering
 * POST /api/scores - Submit new score
 */

import { NextRequest, NextResponse } from 'next/server';
// Note: Import actual functions when implemented
import { verifyToken, extractToken } from '@/lib/auth/auth';
import type { ScoreSubmission } from '@/types/api/client';

/**
 * GET /api/scores
 * Get scores with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const game = searchParams.get('game') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'score';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Get scores (mock implementation)
    const mockScores = [
      {
        id: '1',
        game: game || 'default',
        player: 'Player 1',
        score: 1000,
        userId: userId || undefined,
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockScores,
      filters: { game, userId, limit, sortBy, sortOrder },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('[SCORES] Error retrieving scores:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve scores' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/scores
 * Submit a new score
 */
export async function POST(request: NextRequest) {
  try {
    const body: ScoreSubmission = await request.json();
    const { game, score, meta } = body;

    if (!game || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: game, score' },
        { status: 400 }
      );
    }

    // Get user ID from token (optional)
    let userId: string | undefined;
    const token = extractToken(request);
    if (token) {
      try {
        const decoded = verifyToken(token);
        userId = decoded.id;
      } catch (err) {
        // Allow anonymous scores
        userId = undefined;
      }
    }

    // Submit score (mock implementation)
    const result = {
      success: true,
      id: Date.now().toString(),
      game,
      score,
      player: body.player || 'Anonymous',
      userId,
      meta,
      createdAt: new Date().toISOString()
    };

    console.log('[SCORES] Score submitted:', {
      game,
      score,
      userId,
      scoreId: result.id
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Score submitted successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('[SCORES] Error submitting score:', error);
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}