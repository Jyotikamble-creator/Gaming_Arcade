/**
 * API Route: Validate emoji puzzle answer
 * POST /api/games/emoji/validate
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAnswer, getGameSession, updateSessionWithAttempt } from '@/lib/games/emoji';
import { calculateScore } from '@/utility/games/emoji';
import type { ValidateAnswerRequest } from '@/types/games/emoji';

export async function POST(request: NextRequest) {
  try {
    const body: ValidateAnswerRequest = await request.json();
    const { puzzleId, userAnswer, sessionId, timeTaken = 0 } = body;

    // Validate request body
    if (!puzzleId || !userAnswer || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: puzzleId, userAnswer, sessionId' },
        { status: 400 }
      );
    }

    // Get the game session
    const session = await getGameSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 404 }
      );
    }

    // Check if session is already completed
    if (session.completed) {
      return NextResponse.json(
        { error: 'This puzzle has already been completed' },
        { status: 400 }
      );
    }

    // Validate the answer
    const correctAnswer = session.currentPuzzle.answer;
    const validationResult = validateAnswer(userAnswer, correctAnswer);

    // Calculate score
    const score = validationResult.correct
      ? calculateScore(
          session.attempts.length + 1,
          timeTaken,
          session.difficulty,
          session.hintsUsed
        )
      : 0;

    // Update session with this attempt
    const updatedSession = await updateSessionWithAttempt(
      sessionId,
      userAnswer,
      validationResult.correct,
      timeTaken,
      score
    );

    console.log('[EMOJI] Answer validation:', {
      sessionId,
      puzzleId,
      userAnswer,
      correct: validationResult.correct,
      score
    });

    return NextResponse.json({
      ...validationResult,
      score,
      attempts: updatedSession?.attempts.length || session.attempts.length + 1,
      sessionCompleted: validationResult.correct,
      totalScore: updatedSession?.score || score
    }, { status: 200 });

  } catch (error) {
    console.error('[EMOJI] Error validating answer:', error);
    return NextResponse.json(
      { error: 'Failed to validate answer' },
      { status: 500 }
    );
  }
}
