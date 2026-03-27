// API Route: Create new words
import { NextResponse } from 'next/server';
import { createWord } from '@/models/word';
import type { WordDefinition } from '@/types/games/word';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const wordData = body as Omit<WordDefinition, 'id' | 'createdAt' | 'updatedAt'>;
    
    // Validate required fields
    if (!wordData.word || !wordData.description) {
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Invalid word data',
          message: 'word and description are required'
        },
        { status: 400 }
      );
    }
    
    // Create the word
    const newWord = await createWord({
      word: wordData.word,
      category: wordData.category || 'General',
      difficulty: wordData.difficulty || 'beginner',
      language: wordData.language || 'english',
      description: wordData.description,
      definition: wordData.definition,
      pronunciation: wordData.pronunciation,
      etymology: wordData.etymology,
      examples: wordData.examples,
      hints: wordData.hints,
    });
    
    return NextResponse.json({
      ok: true,
      data: newWord,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[WORD] Create word error:', error);
    
    // Check for duplicate word error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Word already exists',
          message: 'A word with this name already exists'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Failed to create word',
        message: error.message 
      },
      { status: 500 }
    );
  }
}