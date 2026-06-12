/**
 * API Route: Validate a single math answer
 * POST /api/games/math/validate
 */

import { NextRequest, NextResponse } from 'next/server';
import { submitAnswer } from '@/lib/games/math';
import { generateExplanation } from '@/utility/games/math';
import type { ValidateAnswerRequest } from '@/types/games/math';

export async function POST(request: NextRequest) {
  try {
    const body: ValidateAnswerRequest = await request.json();
    const { sessionId, questionId, answer, timeTaken = 0 } = body;

    // Validate request
    if (!sessionId || questionId === undefined || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, questionId, answer' },
        { status: 400 }
      );
    }

    // Submit the answer
    const { correct, session } = await submitAnswer(
      sessionId,
      questionId,
      answer,
      timeTaken
    );

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 404 }
      );
    }

    // Find the question to get correct answer
    const question = session.questions.find(q => q.id === questionId);
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found in session' },
        { status: 404 }
      );
    }

    const explanation = generateExplanation(question);

    console.log('[MATH] Answer validated:', {
      sessionId,
      questionId,
      correct,
      score: session.score
    });

    return NextResponse.json({
      correct,
      correctAnswer: question.ans,
      explanation,
      score: session.score
    }, { status: 200 });

  } catch (error) {
    console.error('[MATH] Error validating answer:', error);
    return NextResponse.json(
      { error: 'Failed to validate answer' },
      { status: 500 }
    );
  }
}
