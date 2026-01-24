/**
 * API Route: Get reaction time statistics
 * GET /api/games/reaction-time/stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { getUserReactionStats } from '@/lib/games/reaction-time';
import { getImprovementMessage } from '@/utility/games/reaction-time';

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

    // Get statistics
    const stats = await getUserReactionStats(userId);

    // Get improvement message
    const improvementMessage = getImprovementMessage(stats.improvementRate);

    console.log('[REACTION-TIME] Stats retrieved:', {
      userId,
      totalSessions: stats.totalSessions,
      overallBestTime: stats.overallBestTime
    });

    return NextResponse.json({
      stats,
      improvementMessage
    }, { status: 200 });

  } catch (error) {
    console.error('[REACTION-TIME] Error fetching stats:', error);
    
    if (error instanceof Error && error.message.includes('jwt')) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
