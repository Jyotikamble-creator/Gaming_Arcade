/**
 * API Route: Get user summary statistics
 * GET /api/progress/summary
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { getSummaryStats, calculateUserRank } from '@/lib/progress';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.id;

    // Get summary statistics
    const summary = await getSummaryStats(userId);

    // Calculate user rank
    const rank = calculateUserRank(summary.totalGamesPlayed, summary.totalScore);

    console.log('[PROGRESS] Summary retrieved:', {
      userId,
      totalGames: summary.totalGamesPlayed,
      level: rank.level
    });

    return NextResponse.json({
      ...summary,
      rank
    }, { status: 200 });

  } catch (error) {
    console.error('[PROGRESS] Error fetching summary:', error);
    
    if (error instanceof Error && error.message.includes('jwt')) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}
