/**
 * API Route: Get reaction time session state
 * GET /api/games/reaction-time/state?sessionId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { getReactionSession } from '@/lib/games/reaction-time';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required parameter: sessionId' },
        { status: 400 }
      );
    }

    // Get session
    const session = await getReactionSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    console.log('[REACTION-TIME] Session state retrieved:', {
      sessionId,
      currentAttempt: session.currentAttempt,
      completed: session.completed
    });

    return NextResponse.json({
      session: {
        sessionId: session.sessionId,
        currentAttempt: session.currentAttempt,
        totalAttempts: session.totalAttempts,
        attempts: session.attempts,
        currentAverage: session.averageTime,
        currentBest: session.bestTime,
        completed: session.completed
      }
    }, { status: 200 });

  } catch (error) {
    console.error('[REACTION-TIME] Error fetching session state:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch session state' },
      { status: 500 }
    );
  }
}
