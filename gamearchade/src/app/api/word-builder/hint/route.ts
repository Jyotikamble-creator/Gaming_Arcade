// API Route: Word Builder Hint System
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WordBuilderGameSession } from '@/models/games/word-builder';
import { generateWordHint, getTargetWords } from '@/lib/games/word-builder';
import { WordBuilderHint } from '@/types/games/word-builder';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { sessionId, hintType = 'first-letter', targetWord } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Find active session
    const session = await WordBuilderGameSession.findOne({ 
      sessionId,
      isCompleted: false 
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Active session not found' },
        { status: 404 }
      );
    }

    // Check if hints are available
    if (session.hintsUsed >= session.maxHints) {
      return NextResponse.json(
        { success: false, error: 'No hints remaining' },
        { status: 400 }
      );
    }

    // Get target words for this challenge
    const targetWords = getTargetWords(session.challengeId);
    if (!targetWords || targetWords.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No target words found for challenge' },
        { status: 404 }
      );
    }

    // Find unfound words
    const unfoundWords = targetWords.filter(word => !session.foundWords.includes(word));
    
    if (unfoundWords.length === 0) {
      return NextResponse.json(
        { success: false, error: 'All words have been found!' },
        { status: 400 }
      );
    }

    // Select word to hint for
    let wordToHint = targetWord;
    if (!wordToHint || !unfoundWords.includes(wordToHint)) {
      // Select a random unfound word, prioritizing longer words
      const sortedWords = unfoundWords.sort((a, b) => b.length - a.length);
      const topWords = sortedWords.slice(0, Math.max(1, Math.floor(unfoundWords.length * 0.3)));
      wordToHint = topWords[Math.floor(Math.random() * topWords.length)];
    }

    // Generate hint
    const hint = generateWordHint(wordToHint, hintType, session.letters);
    
    if (!hint) {
      return NextResponse.json(
        { success: false, error: 'Unable to generate hint' },
        { status: 500 }
      );
    }

    // Update session
    session.hintsUsed += 1;
    
    // Deduct hint cost from score if applicable
    if (hint.cost > 0) {
      session.currentScore = Math.max(0, session.currentScore - hint.cost);
    }

    await session.save();

    const response = {
      hint: {
        type: hint.type,
        content: hint.content,
        cost: hint.cost,
        targetWordLength: wordToHint.length,
        remainingHints: session.maxHints - session.hintsUsed
      },
      gameState: {
        currentScore: session.currentScore,
        hintsUsed: session.hintsUsed,
        maxHints: session.maxHints,
        unfoundWordsCount: unfoundWords.length
      }
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error getting word hint:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to generate hint' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    const session = await WordBuilderGameSession.findOne({ 
      sessionId,
      isCompleted: false 
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Active session not found' },
        { status: 404 }
      );
    }

    // Get hint availability and stats
    const targetWords = getTargetWords(session.challengeId);
    const unfoundWords = targetWords ? 
      targetWords.filter(word => !session.foundWords.includes(word)) : [];

    const hintTypes = [
      {
        type: 'first-letter',
        name: 'First Letter',
        description: 'Reveals the first letter of a word',
        cost: 10,
        available: unfoundWords.length > 0
      },
      {
        type: 'word-length',
        name: 'Word Length',
        description: 'Shows how many letters the word has',
        cost: 5,
        available: unfoundWords.length > 0
      },
      {
        type: 'definition',
        name: 'Definition',
        description: 'Provides a definition or clue',
        cost: 15,
        available: unfoundWords.length > 0
      },
      {
        type: 'category',
        name: 'Category',
        description: 'Reveals the word category',
        cost: 8,
        available: unfoundWords.length > 0
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        hintsUsed: session.hintsUsed,
        maxHints: session.maxHints,
        remainingHints: session.maxHints - session.hintsUsed,
        currentScore: session.currentScore,
        unfoundWordsCount: unfoundWords.length,
        hintTypes,
        canUseHint: session.hintsUsed < session.maxHints && unfoundWords.length > 0
      }
    });

  } catch (error) {
    console.error('Error getting hint information:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to get hint information' },
      { status: 500 }
    );
  }
}