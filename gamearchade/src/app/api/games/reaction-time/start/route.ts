/**
 * API Route: Start a new reaction time session
 * POST /api/games/reaction-time/start
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { createReactionSession } from '@/lib/games/reaction-time';
import type { StartReactionRequest, ReactionDifficulty } from '@/types/games/reaction-time';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body: StartReactionRequest = await request.json();

    const {
      totalAttempts = 5,
      difficulty = 'medium'
    } = body;

    // Validate number of attempts
    if (totalAttempts < 3 || totalAttempts > 20) {
      return NextResponse.json(
        { error: 'Total attempts must be between 3 and 20' },
        { status: 400 }
      );
    }

    // Get user ID from token (optional)
    let userId: string | undefined;
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        userId = decoded?.id;
      } catch (err) {
        // Non-authenticated session allowed
        userId = undefined;
      }
    }

    // Create session
    const sessionId = uuidv4();
    const session = await createReactionSession({
      sessionId,
      userId,
      totalAttempts,
      startTime: new Date(),
      difficulty: difficulty as ReactionDifficulty
    });

    console.log('[REACTION-TIME] Session started:', {
      sessionId,
      userId,
      totalAttempts,
      difficulty
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      totalAttempts,
      difficulty,
      message: 'Click when the stimulus appears. React as fast as possible!'
    }, { status: 201 });

  } catch (error) {
    console.error('[REACTION-TIME] Error starting session:', error);
    
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    );
  }
}
