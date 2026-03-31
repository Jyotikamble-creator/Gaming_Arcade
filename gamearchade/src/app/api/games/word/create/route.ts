// API Route: Create new words
import { NextResponse } from 'next/server';
// import { createWord } from '@/models/word';
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
    
    // TODO: Create word with Prisma
    const newWord = {
      id: 'temp-id',
      ...wordData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return NextResponse.json({
      ok: true,
      data: newWord,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[WORD] Create word error:', error);
    
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