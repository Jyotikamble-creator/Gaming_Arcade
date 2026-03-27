// API Route: Get all words with optional filtering
import { NextResponse } from 'next/server';
import { getAllWords, getWordStats } from '@/models/word';
import type { WordCategory, WordDifficulty, WordLanguage } from '@/types/games/word';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract optional filters
    const category = searchParams.get('category') as WordCategory | null;
    const difficulty = searchParams.get('difficulty') as WordDifficulty | null;
    const language = (searchParams.get('language') as WordLanguage) || 'english';
    const includeAnalytics = searchParams.get('analytics') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    
    // Get words with optional filtering
    const words = await getAllWords({
      category: category || undefined,
      difficulty: difficulty || undefined,
      language,
      limit
    });

    // Get analytics if requested
    let analytics = null;
    if (includeAnalytics) {
      analytics = await getWordStats();
    }

    return NextResponse.json({
      ok: true,
      data: {
        words,
        total: words.length,
        analytics,
        filters: {
          category,
          difficulty,
          language,
          limit
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[WORD] Get words error:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Failed to retrieve words',
        message: error.message 
      },
      { status: 500 }
    );
  }
}