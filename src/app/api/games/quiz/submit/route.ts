/**
 * API Route: Submit completed quiz
 * POST /api/games/quiz/submit
 */

import { NextRequest, NextResponse } from 'next/server';
import { submitQuizAnswers, completeQuizSession } from '@/lib/games/quiz';
import { getPerformanceRating, getGrade, getPerformanceMessage } from '@/utility/games/quiz';
import type { SubmitQuizRequest, QuizResult } from '@/types/games/quiz';

export async function POST(request: NextRequest) {
  try {
    const body: SubmitQuizRequest = await request.json();

    const { sessionId, answers } = body;

    // Validate input
    if (!sessionId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, answers' },
        { status: 400 }
      );
    }

    // Submit all answers
    let session;
    if (answers.length > 0) {
      session = await submitQuizAnswers(sessionId, answers);
    } else {
      // Just complete the session if no new answers
      session = await completeQuizSession(sessionId);
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Quiz session not found' },
        { status: 404 }
      );
    }

    // Calculate performance metrics
    const accuracy = session.accuracy || 0;
    const performance = getPerformanceRating(accuracy);
    const grade = getGrade(accuracy);
    const message = getPerformanceMessage(performance);

    // Prepare result
    const result: QuizResult = {
      sessionId: session.sessionId,
      score: session.score,
      correctAnswers: session.correctAnswers,
      totalQuestions: session.totalQuestions,
      accuracy,
      duration: session.duration || 0,
      performance,
      answers: session.answers,
      bonusPoints: session.bonusPoints || 0,
      perfectBonus: session.correctAnswers === session.totalQuestions ? 50 : 0,
      speedBonus: (session.duration || 0) / session.totalQuestions < 15 ? 20 : 0,
      grade
    };

    console.log('[QUIZ] Quiz completed:', {
      sessionId,
      score: result.score,
      accuracy: result.accuracy,
      performance: result.performance,
      grade: result.grade
    });

    return NextResponse.json({
      result,
      message
    }, { status: 200 });

  } catch (error) {
    console.error('[QUIZ] Error submitting quiz:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    );
  }
}
