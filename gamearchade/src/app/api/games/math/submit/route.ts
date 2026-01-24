/**
 * API Route: Submit answers to math quiz
 * POST /api/games/math/submit
 */

import { NextRequest, NextResponse } from 'next/server';
import { submitMultipleAnswers, completeQuizSession } from '@/lib/games/math';
import type { SubmitAnswersRequest } from '@/types/games/math';

export async function POST(request: NextRequest) {
  try {
    const body: SubmitAnswersRequest = await request.json();
    const { sessionId, answers } = body;

    // Validate request
    if (!sessionId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, answers' },
        { status: 400 }
      );
    }

    // Submit all answers
    const session = await submitMultipleAnswers(sessionId, answers);

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session ID or session already completed' },
        { status: 404 }
      );
    }

    // Complete the session if not already complete
    if (!session.completed) {
      await completeQuizSession(sessionId);
    }

    // Prepare results
    const results = session.answers.map(answer => ({
      questionId: answer.questionId,
      correct: answer.isCorrect,
      userAnswer: answer.userAnswer,
      correctAnswer: answer.correctAnswer
    }));

    const accuracy = session.totalQuestions > 0
      ? (session.correctAnswers / session.totalQuestions) * 100
      : 0;

    console.log('[MATH] Quiz submitted:', {
      sessionId,
      score: session.score,
      correctAnswers: session.correctAnswers,
      totalQuestions: session.totalQuestions,
      accuracy
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      score: session.score,
      totalQuestions: session.totalQuestions,
      correctAnswers: session.correctAnswers,
      wrongAnswers: session.totalQuestions - session.correctAnswers,
      accuracy,
      results,
      completed: session.completed
    }, { status: 200 });

  } catch (error) {
    console.error('[MATH] Error submitting answers:', error);
    return NextResponse.json(
      { error: 'Failed to submit answers' },
      { status: 500 }
    );
  }
}
