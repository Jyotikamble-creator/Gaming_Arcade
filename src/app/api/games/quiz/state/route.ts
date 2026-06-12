/**
 * API Route: Get quiz session state
 * GET /api/games/quiz/state?sessionId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { getQuizSession } from '@/lib/games/quiz';
import { stripAnswer } from '@/utility/games/quiz';

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
    const session = await getQuizSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Quiz session not found' },
        { status: 404 }
      );
    }

    // Calculate time elapsed
    const timeElapsed = Math.floor(
      (new Date().getTime() - session.startTime.getTime()) / 1000
    );

    // Get current question (if not completed)
    const currentQuestion = !session.completed && session.currentQuestionIndex < session.questions.length
      ? stripAnswer(session.questions[session.currentQuestionIndex])
      : undefined;

    console.log('[QUIZ] Session state retrieved:', {
      sessionId,
      currentQuestionIndex: session.currentQuestionIndex,
      completed: session.completed
    });

    return NextResponse.json({
      session: {
        sessionId: session.sessionId,
        currentQuestionIndex: session.currentQuestionIndex,
        totalQuestions: session.totalQuestions,
        score: session.score,
        correctAnswers: session.correctAnswers,
        answeredQuestions: session.answers.length,
        timeElapsed,
        completed: session.completed
      },
      currentQuestion
    }, { status: 200 });

  } catch (error) {
    console.error('[QUIZ] Error fetching session state:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch session state' },
      { status: 500 }
    );
  }
}
