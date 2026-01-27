/**
 * API Route: Get user analytics over time
 * GET /api/progress/analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { getProgressOverTime } from '@/lib/progress';
import { formatTimePeriod } from '@/utility/progress';
import type { TimePeriod } from '@/types/progress';

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || 'week') as TimePeriod;

    // Validate period
    const validPeriods: TimePeriod[] = ['day', 'week', 'month', 'year', 'all'];
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be one of: day, week, month, year, all' },
        { status: 400 }
      );
    }

    // Get progress over time
    const progressData = await getProgressOverTime(userId, period);

    // Calculate summary statistics
    const totalGames = progressData.reduce((sum, d) => sum + d.gamesPlayed, 0);
    const totalScore = progressData.reduce((sum, d) => sum + d.totalScore, 0);
    const averageScore = totalGames > 0 
      ? Math.round(totalScore / totalGames)
      : 0;

    // Calculate improvement trend
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (progressData.length >= 2) {
      const firstHalf = progressData.slice(0, Math.floor(progressData.length / 2));
      const secondHalf = progressData.slice(Math.floor(progressData.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, d) => sum + d.averageScore, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, d) => sum + d.averageScore, 0) / secondHalf.length;
      
      const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;
      if (percentChange > 5) trend = 'improving';
      else if (percentChange < -5) trend = 'declining';
    }

    console.log('[PROGRESS] Analytics retrieved:', {
      userId,
      period,
      totalGames
    });

    return NextResponse.json({
      period,
      periodLabel: formatTimePeriod(period),
      totalGames,
      totalScore,
      averageScore,
      progressOverTime: progressData,
      improvement: {
        gamesPlayed: totalGames,
        scoreIncrease: 0, // TODO: Calculate actual increase
        trend
      }
    }, { status: 200 });

  } catch (error) {
    console.error('[PROGRESS] Error fetching analytics:', error);
    
    if (error instanceof Error && error.message.includes('jwt')) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
