/**
 * API Route: Start a new quiz session
 * POST /api/games/quiz/start
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/auth';
import {
  getRandomQuestions,
  shuffleOptions
} from '@/utility/games/quiz';
import type { QuizCategory, QuizDifficulty, StartQuizRequest } from '@/types/games/quiz';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/games/quiz/start
 * Start a quiz with default settings
 */
export async function GET(request: NextRequest) {
  try {
    // Use default settings
    const numberOfQuestions = 10;
    const category = undefined;
    const difficulty = undefined;
    const timeLimit = undefined;

    // Get user ID from token (optional)
    let userId: string | undefined;
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        userId = decoded?.id;
      } catch (err) {
        userId = undefined;
      }
    }

    // Get random questions
    let questions = getRandomQuestions(numberOfQuestions, category, difficulty);

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions available' },
        { status: 404 }
      );
    }

    // Shuffle options for each question
    questions = questions.map(q => shuffleOptions(q));

    // Create session ID
    const sessionId = uuidv4();

    // Note: Database persistence disabled for performance
    // Session data only exists in memory on client-side

    // Send complete questions including answers for client-side validation
    // Note: Answers are visible in network tab (acceptable for educational quiz)

    console.log('[QUIZ] Quiz started (GET):', {
      sessionId,
      userId,
      numberOfQuestions: questions.length
    });

    return NextResponse.json({
      sessionId: sessionId,
      questions: questions,
      totalQuestions: questions.length,
      timeLimit,
      category,
      difficulty
    }, { status: 200 });

  } catch (error) {
    console.error('[QUIZ] Error starting quiz (GET):', error);
    
    return NextResponse.json(
      { error: 'Failed to start quiz' },
      { status: 500 }
    );
  }
}

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

    // Create session ID
    const sessionId = uuidv4();

    // Note: Database persistence disabled for performance
    // Session data only exists in memory on client-side

    // Send complete questions including answers for client-side validation
    // Note: Answers are visible in network tab (acceptable for educational quiz)

    console.log('[QUIZ] Quiz started:', {
      sessionId,
      userId,
      numberOfQuestions: questions.length,
      category,
      difficulty
    });

    return NextResponse.json({
      sessionId: sessionId,
      questions: questions,
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
