/**
 * API Route: Submit completed reaction time session
 * POST /api/games/reaction-time/submit
 */

import { NextRequest, NextResponse } from 'next/server';
import { completeReactionSession } from '@/lib/games/reaction-time';
import {
  getPerformanceMessage,
  getPerformanceTips,
  analyzePerformance
} from '@/utility/games/reaction-time';
import type { SubmitReactionRequest, ReactionResult } from '@/types/games/reaction-time';

export async function POST(request: NextRequest) {
  try {
    const body: SubmitReactionRequest = await request.json();

    const { sessionId } = body;

    // Validate input
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required field: sessionId' },
        { status: 400 }
      );
    }

    // Complete session
    const session = await completeReactionSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (!session.averageTime || !session.bestTime || !session.performance) {
      return NextResponse.json(
        { error: 'Session has no valid attempts' },
        { status: 400 }
      );
    }

    // Get valid times for breakdown
    const validAttempts = session.attempts.filter(a => a.valid && !a.tooEarly);
    const allTimes = validAttempts.map(a => a.reactionTime);

    // Prepare result
    const result: ReactionResult = {
      sessionId: session.sessionId,
      score: session.score!,
      averageTime: session.averageTime,
      bestTime: session.bestTime,
      worstTime: session.worstTime!,
      consistency: session.consistency!,
      performance: session.performance,
      attempts: session.attempts,
      scoreBreakdown: {
        baseScore: Math.max(0, Math.round(500 - (session.averageTime - 200) * 0.5)),
        consistencyBonus: Math.max(0, Math.round((1 - session.consistency! / session.averageTime) * 50)),
        bestTimeBonus: session.bestTime < 200 ? 50 : session.bestTime < 250 ? 25 : session.bestTime < 300 ? 10 : 0,
        difficultyMultiplier: 1.25, // Default medium
        penaltyDeduction: session.falseStarts * 10,
        totalScore: session.score!
      },
      message: getPerformanceMessage(session.performance)
    };

    // Get performance analysis
    const analysis = analyzePerformance(
      session.averageTime,
      session.bestTime,
      session.worstTime!,
      session.consistency!
    );

    console.log('[REACTION-TIME] Session completed:', {
      sessionId,
      score: result.score,
      averageTime: result.averageTime,
      performance: result.performance
    });

    return NextResponse.json({
      result,
      tips: getPerformanceTips(session.performance),
      analysis
    }, { status: 200 });

  } catch (error) {
    console.error('[REACTION-TIME] Error submitting session:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit session' },
      { status: 500 }
    );
  }
}
