/**
 * API Route: Generate math quiz questions
 * GET /api/games/math/questions
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions, validateQuizConfig } from '@/utility/games/math';
import { createQuizSession } from '@/lib/games/math';
import type { MathDifficultyLevel, MathOperation } from '@/types/games/math';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const count = parseInt(searchParams.get('count') || '10');
    const difficulty = (searchParams.get('difficulty') || 'Easy') as MathDifficultyLevel;
    const operationsParam = searchParams.get('operations');
    const userId = searchParams.get('userId') || undefined;
    const timeLimit = searchParams.get('timeLimit') 
      ? parseInt(searchParams.get('timeLimit')!) 
      : undefined;

    // Parse operations if provided
    let operations: MathOperation[] | undefined;
    if (operationsParam) {
      operations = operationsParam.split(',').filter(op => 
        ['+', '-', '*', '/'].includes(op)
      ) as MathOperation[];
    }

    // Validate and normalize config
    const config = validateQuizConfig({
      questionCount: count,
      difficulty,
      operations,
      timeLimit
    });

    // Generate questions
    const questions = generateQuestions(config);

    // Create a quiz session
    const session = await createQuizSession(questions, config, userId);

    console.log('[MATH] Generated quiz:', {
      sessionId: session.sessionId,
      questionCount: questions.length,
      difficulty,
      operations: operations || 'all'
    });

    return NextResponse.json({
      questions,
      sessionId: session.sessionId,
      difficulty,
      totalQuestions: questions.length,
      timeLimit: config.timeLimit
    }, { status: 200 });

  } catch (error) {
    console.error('[MATH] Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate math questions' },
      { status: 500 }
    );
  }
}
