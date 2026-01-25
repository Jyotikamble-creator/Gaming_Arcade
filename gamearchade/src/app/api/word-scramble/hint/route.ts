// API Route: Word Scramble Hint System
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WordScrambleGameSession } from '@/models/games/word-scramble';
import { generateWordHint } from '@/lib/games/word-scramble';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { 
      sessionId, 
      hintType = 'first-letter',
      forceHint = false 
    } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Find active session
    const session = await WordScrambleGameSession.findOne({ 
      sessionId,
      isCompleted: false 
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Active session not found' },
        { status: 404 }
      );
    }

    // Check if there's a current word
    if (!session.currentWord) {
      return NextResponse.json(
        { success: false, error: 'No current word available for hint' },
        { status: 400 }
      );
    }

    // Check if hints are available
    if (!forceHint && session.totalHintsUsed >= session.maxHints) {
      return NextResponse.json(
        { success: false, error: 'No hints remaining' },
        { status: 400 }
      );
    }

    const currentWord = session.currentWord;
    
    // Generate hint
    const hint = generateWordHint(currentWord, hintType);
    
    if (!hint) {
      return NextResponse.json(
        { success: false, error: 'Unable to generate hint' },
        { status: 500 }
      );
    }

    // Update session if not forced hint
    if (!forceHint) {
      session.totalHintsUsed += 1;
      
      // Deduct hint cost from score if applicable
      if (hint.cost > 0) {
        session.currentScore = Math.max(0, session.currentScore - hint.cost);
      }
    }

    await session.save();

    const response = {
      hint: {
        type: hint.type,
        content: hint.content,
        cost: hint.cost,
        revealedInfo: hint.revealedInfo
      },
      gameState: {
        currentScore: session.currentScore,
        totalHintsUsed: session.totalHintsUsed,
        maxHints: session.maxHints,
        hintsRemaining: session.maxHints - session.totalHintsUsed,
        currentWord: {
          id: currentWord.id,
          scrambled: currentWord.scrambled,
          length: currentWord.length,
          category: currentWord.category
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error generating word hint:', error);
    
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
    
    const session = await WordScrambleGameSession.findOne({ 
      sessionId,
      isCompleted: false 
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Active session not found' },
        { status: 404 }
      );
    }

    const currentWord = session.currentWord;
    
    // Available hint types with their costs and descriptions
    const hintTypes = [
      {
        type: 'first-letter',
        name: 'First Letter',
        description: 'Reveals the first letter of the word',
        cost: 10,
        available: !!currentWord
      },
      {
        type: 'last-letter',
        name: 'Last Letter',
        description: 'Reveals the last letter of the word',
        cost: 10,
        available: !!currentWord
      },
      {
        type: 'vowels',
        name: 'Vowels',
        description: 'Shows all vowels in their positions',
        cost: 15,
        available: !!currentWord
      },
      {
        type: 'definition',
        name: 'Definition',
        description: 'Provides the definition or meaning',
        cost: 20,
        available: !!(currentWord && currentWord.definition)
      },
      {
        type: 'category',
        name: 'Category',
        description: 'Reveals the word category',
        cost: 5,
        available: !!currentWord
      },
      {
        type: 'length',
        name: 'Word Length',
        description: 'Shows the number of letters',
        cost: 5,
        available: !!currentWord
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        totalHintsUsed: session.totalHintsUsed,
        maxHints: session.maxHints,
        hintsRemaining: session.maxHints - session.totalHintsUsed,
        currentScore: session.currentScore,
        hintTypes,
        canUseHint: session.totalHintsUsed < session.maxHints && !!currentWord,
        currentWord: currentWord ? {
          id: currentWord.id,
          scrambled: currentWord.scrambled,
          length: currentWord.length,
          category: currentWord.category
        } : null
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