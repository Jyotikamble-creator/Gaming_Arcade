/**
 * API Route: Record a reaction time attempt
 * POST /api/games/reaction-time/attempt
 */

import { NextRequest, NextResponse } from 'next/server';
import { recordAttempt } from '@/lib/games/reaction-time';
import { validateReactionTime } from '@/utility/games/reaction-time';
import type { RecordAttemptRequest } from '@/types/games/reaction-time';

export async function POST(request: NextRequest) {
  try {
    const body: RecordAttemptRequest = await request.json();

    const { sessionId, reactionTime, tooEarly = false } = body;

    // Validate input
    if (!sessionId || reactionTime === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, reactionTime' },
        { status: 400 }
      );
    }

    // Validate reaction time
    const validation = validateReactionTime(reactionTime);
    const valid = validation.valid && !tooEarly;

    // Record attempt
    const session = await recordAttempt(sessionId, {
      reactionTime,
      valid,
      tooEarly
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const remaining = session.totalAttempts - session.currentAttempt;
    const completed = session.currentAttempt >= session.totalAttempts;

    console.log('[REACTION-TIME] Attempt recorded:', {
      sessionId,
      attemptNumber: session.currentAttempt,
      reactionTime,
      valid,
      remaining
    });

    return NextResponse.json({
      attemptNumber: session.currentAttempt,
      totalAttempts: session.totalAttempts,
      reactionTime,
      valid,
      currentAverage: session.averageTime,
      currentBest: session.bestTime,
      remaining,
      completed
    }, { status: 200 });

  } catch (error) {
    console.error('[REACTION-TIME] Error recording attempt:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to record attempt' },
      { status: 500 }
    );
  }
}
