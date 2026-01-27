// API Route: Start Word Scramble Game Session
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WordScrambleGameSession } from '@/models/games/word-scramble';
import { 
  createWordScrambleSession, 
  generateWordSequence,
  getFirstWord 
} from '@/lib/games/word-scramble';
import { 
  WordScrambleGameConfig, 
  WordScrambleDifficulty, 
  WordScrambleGameMode,
  WordScrambleCategory 
} from '@/types/games/word-scramble';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const {
      difficulty = 'medium',
      gameMode = 'classic',
      category = 'mixed',
      customWords,
      customTimeLimit,
      enablePowerUps = true,
      enableHints = true,
      enableAchievements = true,
      autoProgress = true,
      showDefinitions = false,
      allowSkipping = true,
      userId
    }: Partial<WordScrambleGameConfig & { userId?: string }> = body;

    // Validate difficulty
    const validDifficulties: WordScrambleDifficulty[] = ['easy', 'medium', 'hard', 'expert', 'insane'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { success: false, error: 'Invalid difficulty level' },
        { status: 400 }
      );
    }

    // Validate game mode
    const validGameModes: WordScrambleGameMode[] = ['classic', 'timed', 'streak', 'marathon', 'blitz', 'zen'];
    if (!validGameModes.includes(gameMode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid game mode' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories: WordScrambleCategory[] = ['programming', 'science', 'animals', 'countries', 'technology', 'general', 'mixed'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Create game configuration
    const gameConfig: WordScrambleGameConfig = {
      difficulty,
      gameMode,
      category,
      customWords,
      customTimeLimit,
      enablePowerUps,
      enableHints,
      enableAchievements,
      autoProgress,
      showDefinitions,
      allowSkipping
    };

    // Generate word sequence
    const wordSequence = generateWordSequence(difficulty, category, customWords);
    
    if (!wordSequence || wordSequence.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No words available for the selected category and difficulty' },
        { status: 404 }
      );
    }

    // Create game session
    const sessionData = createWordScrambleSession(gameConfig, wordSequence, userId);
    
    // Get first word
    const firstWord = getFirstWord(sessionData);
    if (!firstWord) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate first word' },
        { status: 500 }
      );
    }

    sessionData.currentWord = firstWord;
    
    // Save to database
    const session = new WordScrambleGameSession(sessionData);
    await session.save();

    // Prepare response data
    const responseData = {
      sessionId: session.sessionId,
      difficulty: session.difficulty,
      gameMode: session.gameMode,
      category: session.category,
      
      // Current word (scrambled)
      currentWord: {
        id: firstWord.id,
        scrambled: firstWord.scrambled,
        length: firstWord.length,
        category: firstWord.category,
        difficulty: firstWord.difficulty,
        points: firstWord.points,
        hints: enableHints ? firstWord.hints.length : 0
      },
      
      // Game settings
      totalWords: session.totalWords,
      timeLimit: session.totalDuration,
      enablePowerUps,
      enableHints,
      enableAchievements,
      allowSkipping,
      
      // Initial state
      currentScore: session.currentScore,
      currentWordIndex: session.currentWordIndex,
      wordsCompleted: session.wordsCompleted,
      maxHints: session.maxHints,
      
      // Power-ups
      activePowerUps: session.activePowerUps,
      
      // Timing
      startTime: session.startTime,
      timeRemaining: session.timeRemaining
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error starting Word Scramble game:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to start game session' },
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

    // Calculate current state
    const currentTime = new Date();
    let timeRemaining = session.timeRemaining;
    
    if (!session.isPaused && session.totalDuration > 0) {
      const elapsed = (currentTime.getTime() - session.startTime.getTime()) / 1000;
      timeRemaining = Math.max(0, session.totalDuration - elapsed);
    }

    // Check if session has expired
    if (timeRemaining <= 0 && session.totalDuration > 0 && !session.isPaused) {
      session.isCompleted = true;
      session.endTime = currentTime;
      await session.save();
      
      return NextResponse.json({
        success: false,
        error: 'Game session has expired',
        expired: true
      }, { status: 400 });
    }

    const responseData = {
      sessionId: session.sessionId,
      difficulty: session.difficulty,
      gameMode: session.gameMode,
      category: session.category,
      
      // Current word state
      currentWord: session.currentWord ? {
        id: session.currentWord.id,
        scrambled: session.currentWord.scrambled,
        length: session.currentWord.length,
        category: session.currentWord.category,
        difficulty: session.currentWord.difficulty,
        points: session.currentWord.points,
        hints: session.currentWord.hints?.length || 0
      } : null,
      
      // Progress
      currentWordIndex: session.currentWordIndex,
      totalWords: session.totalWords,
      wordsCompleted: session.wordsCompleted,
      completionPercentage: session.completionPercentage,
      
      // Performance
      currentScore: session.currentScore,
      currentStreak: session.currentStreak,
      maxStreak: session.maxStreak,
      accuracy: Math.round(session.accuracy * 100),
      averageReactionTime: Math.round(session.averageReactionTime),
      
      // Game state
      isPaused: session.isPaused,
      timeRemaining,
      totalHintsUsed: session.totalHintsUsed,
      maxHints: session.maxHints,
      
      // Power-ups and achievements
      activePowerUps: session.activePowerUps,
      achievements: session.achievements
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error retrieving Word Scramble session:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}