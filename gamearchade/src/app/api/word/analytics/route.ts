// API Route: Get word analytics and statistics
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getWordAnalytics, getWordUsageStats, getWordRecommendations } from '@/lib/games/word';
import type { WordCategory, WordDifficulty } from '@/types/games/word';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type') || 'overview';
    const category = searchParams.get('category') as WordCategory | null;
    const difficulty = searchParams.get('difficulty') as WordDifficulty | null;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const wordId = searchParams.get('wordId');

    let data;

    switch (type) {
      case 'overview':
        data = await getWordAnalytics(category, difficulty);
        break;
        
      case 'usage':
        if (wordId) {
          data = await getWordUsageStats(wordId);
        } else {
          throw new Error('Word ID required for usage analytics');
        }
        break;
        
      case 'recommendations':
        if (wordId) {
          data = await getWordRecommendations(wordId, limit);
        } else {
          throw new Error('Word ID required for recommendations');
        }
        break;
        
      default:
        throw new Error(`Unknown analytics type: ${type}`);
    }

    return NextResponse.json({
      success: true,
      data,
      type,
      filters: {
        category,
        difficulty,
        limit,
        wordId
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Word analytics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve word analytics',
        message: error.message 
      },
      { status: 500 }
    );
  }
}