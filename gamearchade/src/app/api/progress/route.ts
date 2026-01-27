/**
 * API Route: Get user progress across all games
 * GET /api/progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserProgress } from '@/lib/progress';
import { verifyToken, extractToken } from '@/lib/auth/auth';
import type { UserProgress } from '@/types/progress';

export async function GET(request: NextRequest) {
  try {
    // Extract and verify token
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user progress
    const progress: UserProgress = await getUserProgress(decoded.id);

    console.log('[PROGRESS] Retrieved user progress:', {
      userId: decoded.id,
      totalGames: progress.totalGames,
      gamesCount: progress.gameStats?.length || 0
    });

    return NextResponse.json({
      success: true,
      data: progress,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('[PROGRESS] Error retrieving progress:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve user progress' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/progress
 * Update user progress for a specific game
 */
export async function POST(request: NextRequest) {
  try {
    // Extract and verify token
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { game, score, timePlayed, completed, achievements } = body;

    if (!game || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: game, score' },
        { status: 400 }
      );
    }

    // Mock update progress (implement this function as needed)
    const updateResult = {
      success: true,
      game,
      score,
      updated: true
    };

    console.log('[PROGRESS] Updated user progress:', {
      userId: decoded.id,
      game,
      score
    });

    return NextResponse.json({
      success: true,
      data: updateResult,
      message: 'Progress updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('[PROGRESS] Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update user progress' },
      { status: 500 }
    );
  }
}