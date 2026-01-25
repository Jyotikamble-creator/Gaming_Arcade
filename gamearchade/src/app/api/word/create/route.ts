// API Route: Create new words
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WordModel from '@/models/games/word';
import { createWord, validateWordData, bulkCreateWords } from '@/lib/games/word';
import type { WordDefinition, WordImportRequest } from '@/types/games/word';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Check if this is a single word or bulk import
    if (body.format && body.data) {
      // Bulk import request
      const importRequest = body as WordImportRequest;
      const result = await bulkCreateWords(importRequest);
      
      return NextResponse.json({
        success: true,
        data: result,
        type: 'bulk_import',
        timestamp: new Date().toISOString()
      });
    } else {
      // Single word creation
      const wordData = body as Omit<WordDefinition, 'id' | 'createdAt' | 'updatedAt' | 'metadata'>;
      
      // Validate word data
      const validation = validateWordData(wordData);
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid word data',
            errors: validation.errors 
          },
          { status: 400 }
        );
      }
      
      // Create the word
      const newWord = await createWord(wordData);
      
      return NextResponse.json({
        success: true,
        data: newWord,
        type: 'single_word',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error: any) {
    console.error('Create word error:', error);
    
    // Check for duplicate word error
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Word already exists',
          message: 'A word with this name already exists in the specified language and category'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create word',
        message: error.message 
      },
      { status: 500 }
    );
  }
}