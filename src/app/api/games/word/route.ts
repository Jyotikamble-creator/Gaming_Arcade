// API Route: Get all words with optional filtering
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/api/prisma';
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
    
    const where: any = {
      language
    };
    if (category) {
      where.category = category;
    }
    if (difficulty) {
      where.difficulty = difficulty;
    }

    const dbWords = await prisma.word.findMany({
      where,
      take: limit
    });

    const words = dbWords.map(w => {
      let parsedExamples = [];
      let parsedHints = [];
      try {
        parsedExamples = JSON.parse(w.examples || '[]');
      } catch (e) {}
      try {
        parsedHints = JSON.parse(w.hints || '[]');
      } catch (e) {}

      return {
        ...w,
        examples: parsedExamples,
        hints: parsedHints
      };
    });

    // Get analytics if requested
    let analytics = null;
    if (includeAnalytics) {
      const totalWords = await prisma.word.count({ where });
      const groups = await prisma.word.groupBy({
        by: ['category'],
        where,
        _count: {
          id: true
        }
      });
      analytics = {
        totalWords,
        categories: groups.map(g => ({
          category: g.category,
          count: g._count.id
        }))
      };
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