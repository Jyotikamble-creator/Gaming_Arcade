/**
 * API Route: Get quiz questions
 * GET /api/games/quiz/questions
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  QUESTION_BANK,
  getQuestionsByCategory,
  getQuestionsByDifficulty,
  getQuestionsByCategoryAndDifficulty,
  stripAnswers,
  getAllCategories,
  getQuestionCountByCategory,
  getQuestionCountByDifficulty
} from '@/utility/games/quiz';
import type { QuizCategory, QuizDifficulty } from '@/types/games/quiz';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category') as QuizCategory | null;
    const difficulty = searchParams.get('difficulty') as QuizDifficulty | null;
    const includeAnswers = searchParams.get('includeAnswers') === 'true';
    const limit = parseInt(searchParams.get('limit') || '0');

    let questions = [...QUESTION_BANK];

    // Filter by category
    if (category) {
      questions = getQuestionsByCategory(category);
    }

    // Filter by difficulty
    if (difficulty && !category) {
      questions = getQuestionsByDifficulty(difficulty);
    } else if (difficulty && category) {
      questions = getQuestionsByCategoryAndDifficulty(category, difficulty);
    }

    // Apply limit
    if (limit > 0) {
      questions = questions.slice(0, limit);
    }

    // Prepare response
    const response = {
      questions: includeAnswers ? questions : stripAnswers(questions),
      total: questions.length,
      category: category || undefined,
      difficulty: difficulty || undefined,
      metadata: {
        availableCategories: getAllCategories(),
        categoryCounts: getQuestionCountByCategory(),
        difficultyCounts: getQuestionCountByDifficulty()
      }
    };

    console.log('[QUIZ] Questions retrieved:', {
      category,
      difficulty,
      count: questions.length,
      includeAnswers
    });

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[QUIZ] Error fetching questions:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
