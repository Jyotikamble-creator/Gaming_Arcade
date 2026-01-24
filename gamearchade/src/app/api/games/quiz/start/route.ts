/**
 * API Route: Start a new quiz session
 * POST /api/games/quiz/start
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { createQuizSession } from '@/lib/games/quiz';
import {
  getRandomQuestions,
  stripAnswers,
  shuffleOptions
} from '@/utility/games/quiz';
import type { QuizCategory, QuizDifficulty, StartQuizRequest } from '@/types/games/quiz';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body: StartQuizRequest = await request.json();

    const {
      numberOfQuestions = 10,
      category,
      difficulty,
      timeLimit,
      shuffleQuestions = true
    } = body;

    // Validate number of questions
    if (numberOfQuestions < 1 || numberOfQuestions > 30) {
      return NextResponse.json(
        { error: 'Number of questions must be between 1 and 30' },
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
        // Non-authenticated quiz allowed
        userId = undefined;
      }
    }

    // Get random questions
    let questions = getRandomQuestions(numberOfQuestions, category, difficulty);

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions available for the specified criteria' },
        { status: 404 }
      );
    }

    // Shuffle options for each question
    questions = questions.map(q => shuffleOptions(q));

    // Create session
    const sessionId = uuidv4();
    const session = await createQuizSession({
      sessionId,
      userId,
      questions,
      totalQuestions: questions.length,
      startTime: new Date(),
      category,
      difficulty,
      timeLimit
    });

    // Strip answers for response
    const safeQuestions = stripAnswers(questions);

    console.log('[QUIZ] Quiz started:', {
      sessionId,
      userId,
      numberOfQuestions: questions.length,
      category,
      difficulty
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      questions: safeQuestions,
      totalQuestions: questions.length,
      timeLimit,
      category,
      difficulty
    }, { status: 201 });

  } catch (error) {
    console.error('[QUIZ] Error starting quiz:', error);
    
    return NextResponse.json(
      { error: 'Failed to start quiz' },
      { status: 500 }
    );
  }
}
