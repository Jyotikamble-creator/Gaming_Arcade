/**
 * API Route: Submit answer for a question
 * POST /api/games/quiz/answer
 */

import { NextRequest, NextResponse } from 'next/server';
import { submitAnswer } from '@/lib/games/quiz';
import type { SubmitAnswerRequest } from '@/types/games/quiz';

export async function POST(request: NextRequest) {
  try {
    const body: SubmitAnswerRequest = await request.json();

    const { sessionId, questionId, selectedAnswer, timeSpent } = body;

    // Validate input
    if (!sessionId || questionId === undefined || !selectedAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, questionId, selectedAnswer' },
        { status: 400 }
      );
    }

    if (timeSpent < 0) {
      return NextResponse.json(
        { error: 'Invalid timeSpent value' },
        { status: 400 }
      );
    }

    // Submit answer
    const session = await submitAnswer(sessionId, {
      questionId,
      selectedAnswer,
      timeSpent
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Quiz session not found' },
        { status: 404 }
      );
    }

    // Find the question and answer
    const question = session.questions.find(q => q.id === questionId);
    const answer = session.answers.find(a => a.questionId === questionId);

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question or answer not found' },
        { status: 404 }
      );
    }

    // Determine next question
    const nextQuestionId = session.currentQuestionIndex < session.questions.length
      ? session.questions[session.currentQuestionIndex].id
      : undefined;

    console.log('[QUIZ] Answer submitted:', {
      sessionId,
      questionId,
      correct: answer.correct,
      currentScore: session.score
    });

    return NextResponse.json({
      correct: answer.correct!,
      correctAnswer: question.ans,
      explanation: question.explanation,
      pointsEarned: answer.pointsEarned!,
      currentScore: session.score,
      questionNumber: session.answers.length,
      totalQuestions: session.totalQuestions,
      nextQuestionId
    }, { status: 200 });

  } catch (error) {
    console.error('[QUIZ] Error submitting answer:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}
