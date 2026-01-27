// API Route: Skip Current Word
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WordScrambleGameSession } from '@/models/games/word-scramble';
import { getNextWord } from '@/lib/games/word-scramble';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { sessionId, penaltyScore = 0 } = body;

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
        { success: false, error: 'No current word to skip' },
        { status: 400 }
      );
    }

    const currentWord = session.currentWord;
    
    // Add to skipped words
    session.skippedWords.push(currentWord.original);
    
    // Reset streak
    session.currentStreak = 0;
    
    // Apply penalty if specified
    if (penaltyScore > 0) {
      session.currentScore = Math.max(0, session.currentScore - penaltyScore);
    }
    
    // Mark this word as completed (but with skip status)
    session.wordsCompleted += 1;
    session.completionPercentage = Math.round((session.wordsCompleted / session.totalWords) * 100);
    
    // Add skip attempt record
    const currentTime = new Date();
    const skipAttempt = {
      word: currentWord.original,
      guess: '[SKIPPED]',
      isCorrect: false,
      reactionTime: 0,
      hintsUsed: 0,
      score: -penaltyScore,
      timestamp: currentTime,
      attemptsCount: session.attempts.filter(a => a.word === currentWord.original).length + 1
    };
    session.attempts.push(skipAttempt);
    
    // Get next word or complete game
    let nextWord = null;
    if (session.wordsCompleted >= session.totalWords) {
      // Game completed
      session.isCompleted = true;
      session.endTime = currentTime;
    } else {
      // Get next word
      nextWord = getNextWord(session);
      session.currentWord = nextWord;
      session.currentWordIndex += 1;
    }
    
    await session.save();

    const response = {
      skippedWord: {
        original: currentWord.original,
        scrambled: currentWord.scrambled,
        category: currentWord.category,
        difficulty: currentWord.difficulty
      },
      penaltyApplied: penaltyScore,
      nextWord: nextWord ? {
        id: nextWord.id,
        scrambled: nextWord.scrambled,
        length: nextWord.length,
        category: nextWord.category,
        difficulty: nextWord.difficulty,
        points: nextWord.points
      } : null,
      gameState: {
        currentScore: session.currentScore,
        wordsCompleted: session.wordsCompleted,
        totalWords: session.totalWords,
        currentStreak: session.currentStreak,
        completionPercentage: session.completionPercentage,
        isCompleted: session.isCompleted,
        skippedWordsCount: session.skippedWords.length
      }
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error skipping word:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to skip word' },
      { status: 500 }
    );
  }
}