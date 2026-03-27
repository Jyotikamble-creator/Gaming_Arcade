// API Route: Search and filter words
import { NextResponse } from 'next/server';
import { getAllWords, searchWordsByCategory } from '@/models/word';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract search parameters
    const category = searchParams.get('category') as any || undefined;
    const difficulty = searchParams.get('difficulty') as any || undefined;
    const language = (searchParams.get('language') as any) || 'english';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;

    // Perform search
    const words = await getAllWords({
      category,
      difficulty,
      language,
      limit
    });

    return NextResponse.json({
      ok: true,
      data: {
        words,
        total: words.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[WORD] Word search error:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Failed to search words',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, difficulty, language = 'english', limit = 20 } = body;

    // Build search query from request body
    const words = await getAllWords({
      category,
      difficulty,
      language,
      limit
      sortOrder: sort?.direction || 'asc',
      limit: pagination?.limit || 20,
      offset: pagination?.offset || 0,
    };

    // Perform advanced search
    const searchResult = await searchWords(searchQuery);

    return NextResponse.json({
      success: true,
      data: searchResult,
      query: searchQuery,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Advanced word search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform advanced word search',
        message: error.message 
      },
      { status: 500 }
    );
  }
}