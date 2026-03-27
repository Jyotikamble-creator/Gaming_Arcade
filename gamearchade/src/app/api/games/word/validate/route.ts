// API Route: Validate words and get suggestions
import { NextResponse } from 'next/server';
import { findWordByText, getAllWords } from '@/models/word';
import type { WordValidationRequest } from '@/types/games/word';

// Simple word validation
async function validateWord(word: string) {
  const foundWord = await findWordByText(word);
  
  return {
    isValid: !!foundWord,
    exists: !!foundWord,
    word: word.toUpperCase(),
    message: foundWord ? 'Word is valid' : 'Word not found'
  };
}

// Get word suggestions
async function getWordSuggestions(wordFragment: string, category?: string, limit: number = 5) {
  const words = await getAllWords({ category, limit: limit * 2 });
  
  const fragment = wordFragment.toLowerCase();
  const suggestions = words
    .filter(w => w.word.toLowerCase().includes(fragment))
    .slice(0, limit)
    .map(w => w.word);
    
  return suggestions;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationRequest = body as WordValidationRequest;
    
    if (!validationRequest.word) {
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Word is required for validation' 
        },
        { status: 400 }
      );
    }

    // Validate the word
    const validation = await validateWord(validationRequest.word);
    
    // Get suggestions if word is not valid or doesn't exist
    let suggestions: string[] = [];
    if (!validation.isValid || !validation.exists) {
      suggestions = await getWordSuggestions(
        validationRequest.word,
        validationRequest.category,
        5
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        ...validation,
        suggestions
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[WORD] Word validation error:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Failed to validate word',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const word = searchParams.get('word');
    const category = searchParams.get('category') as any;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 5;
    
    if (!word) {
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Word parameter is required' 
        },
        { status: 400 }
      );
    }

    // Get word suggestions
    const suggestions = await getWordSuggestions(word, category, limit);

    return NextResponse.json({
      success: true,
      data: {
        word,
        suggestions,
        count: suggestions.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Word suggestions error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get word suggestions',
        message: error.message 
      },
      { status: 500 }
    );
  }
}