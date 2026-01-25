// API Route: Search and filter words
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WordModel from '@/models/games/word';
import { searchWords } from '@/lib/games/word';
import type { 
  WordSearchQuery, 
  WordSearchResult,
  WordFilterCriteria,
  WordSortOptions,
  WordPagination 
} from '@/types/games/word';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    // Extract search parameters
    const searchQuery: WordSearchQuery = {
      query: searchParams.get('query') || undefined,
      category: searchParams.get('category') as any || undefined,
      difficulty: searchParams.get('difficulty') as any || undefined,
      language: searchParams.get('language') as any || 'english',
      minLength: searchParams.get('minLength') ? parseInt(searchParams.get('minLength')!) : undefined,
      maxLength: searchParams.get('maxLength') ? parseInt(searchParams.get('maxLength')!) : undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      status: searchParams.get('status') as any || 'active',
      sortBy: searchParams.get('sortBy') as any || 'word',
      sortOrder: searchParams.get('sortOrder') as any || 'asc',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    // Perform search using lib function
    const searchResult = await searchWords(searchQuery);

    return NextResponse.json({
      success: true,
      data: searchResult,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Word search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search words',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { query, filters, sort, pagination } = body as {
      query?: string;
      filters?: WordFilterCriteria;
      sort?: WordSortOptions;
      pagination?: WordPagination;
    };

    // Build search query from request body
    const searchQuery: WordSearchQuery = {
      query: query,
      category: filters?.category?.[0],
      difficulty: filters?.difficulty?.[0],
      language: filters?.language?.[0] || 'english',
      minLength: filters?.lengthRange?.[0],
      maxLength: filters?.lengthRange?.[1],
      tags: filters?.tags,
      status: filters?.status?.[0] || 'active',
      sortBy: sort?.field || 'word',
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