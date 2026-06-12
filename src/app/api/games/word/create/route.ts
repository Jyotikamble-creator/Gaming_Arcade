// API Route: Create new words
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/api/prisma';
import type { WordDefinition } from '@/types/games/word';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const wordData = body as any;
    
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
    
    const newWord = await prisma.word.create({
      data: {
        word: wordData.word,
        category: wordData.category || 'General',
        difficulty: wordData.difficulty || 'beginner',
        language: wordData.language || 'english',
        description: wordData.description,
        definition: wordData.definition || null,
        pronunciation: wordData.pronunciation || null,
        etymology: wordData.etymology || null,
        examples: JSON.stringify(wordData.examples || []),
        hints: JSON.stringify(wordData.hints || []),
        frequency: wordData.frequency || 50,
        status: wordData.status || 'active'
      }
    });
    
    const responseData = {
      ...newWord,
      examples: JSON.parse(newWord.examples || '[]'),
      hints: JSON.parse(newWord.hints || '[]')
    };
    
    return NextResponse.json({
      ok: true,
      data: responseData,
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