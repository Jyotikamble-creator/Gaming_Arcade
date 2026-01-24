/**
 * API Route: Get quiz categories
 * GET /api/games/quiz/categories
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCategories,
  getQuestionCountByCategory,
  getCategoryName
} from '@/utility/games/quiz';

export async function GET(request: NextRequest) {
  try {
    const categories = getAllCategories();
    const counts = getQuestionCountByCategory();

    const categoriesWithInfo = categories.map(cat => ({
      id: cat,
      name: getCategoryName(cat),
      questionCount: counts[cat] || 0
    }));

    console.log('[QUIZ] Categories retrieved:', {
      totalCategories: categories.length
    });

    return NextResponse.json({
      categories: categoriesWithInfo,
      total: categories.length
    }, { status: 200 });

  } catch (error) {
    console.error('[QUIZ] Error fetching categories:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
