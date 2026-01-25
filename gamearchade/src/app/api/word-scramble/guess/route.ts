// API Route: Process Word Scramble Guess
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WordScrambleGameSession } from '@/models/games/word-scramble';
import { 
  validateWordGuess, 
  calculateGuessScore,
  getNextWord,
  checkForAchievements,
  updatePerformanceMetrics
} from '@/lib/games/word-scramble';
import { WordGuessRequest, WordGuessResponse, WordGuessStatus } from '@/types/games/word-scramble';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body: WordGuessRequest = await request.json();
    const {
      guess,
      sessionId,
      reactionTime = 0,
      hintsUsed = 0
    } = body;

    // Validate input
    if (!guess || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Guess and sessionId are required' },
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
        { success: false, error: 'No current word to guess' },
        { status: 400 }
      );
    }

    // Check if game time has expired
    const currentTime = new Date();
    if (session.totalDuration > 0) {
      const elapsed = (currentTime.getTime() - session.startTime.getTime()) / 1000;
      if (!session.isPaused && elapsed >= session.totalDuration) {
        // Auto-complete session
        session.isCompleted = true;
        session.endTime = currentTime;
        await session.save();
        
        return NextResponse.json({
          success: false,
          error: 'Game time expired',
          gameCompleted: true
        }, { status: 400 });
      }
    }

    const normalizedGuess = guess.toUpperCase().trim();
    const currentWord = session.currentWord;
    
    // Validate the guess
    const validationResult = validateWordGuess(normalizedGuess, currentWord.original);
    
    // Update total guesses
    session.totalGuesses += 1;
    
    let response: WordGuessResponse;
    let newAchievements: string[] = [];

    if (validationResult.isCorrect && validationResult.status === 'correct') {
      // Correct guess!
      session.correctGuesses += 1;
      session.wordsCompleted += 1;
      session.currentStreak += 1;
      session.maxStreak = Math.max(session.maxStreak, session.currentStreak);
      
      // Calculate score
      const scoreResult = calculateGuessScore(
        currentWord,
        session.currentStreak,
        reactionTime,
        hintsUsed,
        session.activePowerUps
      );
      
      session.currentScore += scoreResult.totalScore;
      
      // Update performance metrics
      updatePerformanceMetrics(session, reactionTime, true);
      
      // Track perfect words (first try)
      if (session.attempts.filter(a => a.word === currentWord.original).length === 0) {
        session.perfectWords += 1;
        session.oneGuessWords += 1;
      }
      
      // Add attempt record
      const attempt = {
        word: currentWord.original,
        guess: normalizedGuess,
        isCorrect: true,
        reactionTime,
        hintsUsed,
        score: scoreResult.totalScore,
        timestamp: currentTime,
        attemptsCount: session.attempts.filter(a => a.word === currentWord.original).length + 1
      };
      session.attempts.push(attempt);
      
      // Add to completed words
      session.completedWords.push(currentWord);
      
      // Update category stats
      const categoryKey = currentWord.category;
      session.categoryStats.set(categoryKey, (session.categoryStats.get(categoryKey) || 0) + 1);
      
      // Check for achievements
      newAchievements = checkForAchievements(session, currentWord, reactionTime, hintsUsed);
      session.achievements.push(...newAchievements);
      
      // Calculate completion percentage
      session.completionPercentage = Math.round((session.wordsCompleted / session.totalWords) * 100);
      
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
      
      response = {
        status: 'correct' as WordGuessStatus,
        isCorrect: true,
        correctWord: currentWord.original,
        score: scoreResult.totalScore,
        bonusMultiplier: scoreResult.bonusMultiplier,
        streakBonus: scoreResult.streakBonus,
        newStreak: session.currentStreak,
        message: scoreResult.bonusMultiplier > 1 ? 
          `Correct! ${scoreResult.bonusMultiplier}x bonus!` : 'Correct!',
        achievement: newAchievements.length > 0 ? newAchievements[0] : undefined,
        nextWord: nextWord ? {
          id: nextWord.id,
          scrambled: nextWord.scrambled,
          length: nextWord.length,
          category: nextWord.category,
          difficulty: nextWord.difficulty,
          points: nextWord.points,
          hints: nextWord.hints,
          definition: nextWord.definition
        } : undefined
      };
      
    } else {
      // Incorrect guess
      session.incorrectGuesses += 1;
      session.currentStreak = 0; // Reset streak
      
      // Update performance metrics
      updatePerformanceMetrics(session, reactionTime, false);
      
      // Add failed attempt record
      const attempt = {
        word: currentWord.original,
        guess: normalizedGuess,
        isCorrect: false,
        reactionTime,
        hintsUsed,
        score: 0,
        timestamp: currentTime,
        attemptsCount: session.attempts.filter(a => a.word === currentWord.original).length + 1
      };
      session.attempts.push(attempt);
      
      let message = 'Incorrect guess';
      switch (validationResult.status) {
        case 'too_short':
          message = 'Guess too short';
          break;
        case 'invalid_chars':
          message = 'Invalid characters';
          break;
        case 'already_guessed':
          message = 'Already tried this word';
          break;
        default:
          message = 'Incorrect, try again!';
      }
      
      response = {
        status: validationResult.status,
        isCorrect: false,
        score: 0,
        bonusMultiplier: 1,
        streakBonus: 0,
        newStreak: session.currentStreak,
        message
      };
    }

    // Update accuracy
    session.accuracy = session.totalGuesses > 0 ? session.correctGuesses / session.totalGuesses : 1;
    
    // Save session
    await session.save();

    // Include game state in response
    const gameState = {
      currentScore: session.currentScore,
      wordsCompleted: session.wordsCompleted,
      totalWords: session.totalWords,
      currentStreak: session.currentStreak,
      maxStreak: session.maxStreak,
      accuracy: Math.round(session.accuracy * 100),
      completionPercentage: session.completionPercentage,
      achievements: newAchievements,
      isCompleted: session.isCompleted,
      averageReactionTime: Math.round(session.averageReactionTime),
      perfectWords: session.perfectWords
    };

    return NextResponse.json({
      success: true,
      guess: response,
      gameState
    });

  } catch (error) {
    console.error('Error processing word guess:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to process guess' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve current word state
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
    if (!currentWord) {
      return NextResponse.json(
        { success: false, error: 'No current word available' },
        { status: 404 }
      );
    }

    // Get previous attempts for this word
    const wordAttempts = session.attempts.filter(a => a.word === currentWord.original);

    const responseData = {
      currentWord: {
        id: currentWord.id,
        scrambled: currentWord.scrambled,
        length: currentWord.length,
        category: currentWord.category,
        difficulty: currentWord.difficulty,
        points: currentWord.points,
        hints: currentWord.hints.length
      },
      attempts: wordAttempts.length,
      previousGuesses: wordAttempts.map(a => a.guess),
      hintsAvailable: session.maxHints - session.totalHintsUsed,
      timeRemaining: session.timeRemaining,
      currentStreak: session.currentStreak
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error retrieving current word:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve current word' },
      { status: 500 }
    );
  }
}