// API Route: Get all words with optional filtering
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WordModel from '@/models/games/word';
import { getAllWords, getWordAnalytics } from '@/lib/games/word';
import type { WordCategory, WordDifficulty, WordLanguage } from '@/types/games/word';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    // Extract optional filters
    const category = searchParams.get('category') as WordCategory | null;
    const difficulty = searchParams.get('difficulty') as WordDifficulty | null;
    const language = searchParams.get('language') as WordLanguage || 'english';
    const includeAnalytics = searchParams.get('analytics') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    
    // Get words with optional filtering
    const words = await getAllWords({
      category,
      difficulty,
      language,
      limit
    });

    // Get analytics if requested
    let analytics = null;
    if (includeAnalytics) {
      analytics = await getWordAnalytics();
    }

    return NextResponse.json({
      success: true,
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
    console.error('Get words error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve words',
        message: error.message 
      },
      { status: 500 }
    );
  }
}