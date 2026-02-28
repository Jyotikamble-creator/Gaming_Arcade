/**
 * API Route: Get quiz statistics
 * GET /api/games/quiz/stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/auth';
import { getUserQuizStats } from '@/lib/games/quiz';

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
    const stats = await getUserQuizStats(userId);

    console.log('[QUIZ] Stats retrieved:', {
      userId,
      totalQuizzes: stats.totalQuizzes,
      overallAccuracy: stats.overallAccuracy
    });

    return NextResponse.json({ stats }, { status: 200 });

  } catch (error) {
    console.error('[QUIZ] Error fetching stats:', error);
    
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
