// API Route: Validate Word in Word Builder Game
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WordBuilderGameSession } from '@/models/games/word-builder';
import { 
  validateWordInGame, 
  calculateWordScore, 
  updateGameProgress,
  checkForAchievements
} from '@/lib/games/word-builder';
import { 
  WordValidationRequest, 
  WordValidationResponse, 
  WordValidationStatus 
} from '@/types/games/word-builder';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body: WordValidationRequest = await request.json();
    const {
      word,
      sessionId,
      challengeId,
      availableLetters,
      reactionTime = 0
    } = body;

    // Validate input
    if (!word || !sessionId || !challengeId) {
      return NextResponse.json(
        { success: false, error: 'Word, sessionId, and challengeId are required' },
        { status: 400 }
      );
    }

    // Find active session
    const session = await WordBuilderGameSession.findOne({ 
      sessionId,
      challengeId,
      isCompleted: false 
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Active session not found' },
        { status: 404 }
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

    const normalizedWord = word.toUpperCase().trim();
    
    // Validate word using game logic
    const validationResult = validateWordInGame(
      normalizedWord,
      session.letters,
      session.foundWords,
      challengeId
    );

    let response: WordValidationResponse;
    let newAchievements: string[] = [];

    if (validationResult.isValid && validationResult.status === 'valid') {
      // Calculate score with bonuses
      const wordScore = calculateWordScore(
        normalizedWord,
        session.comboStreak,
        session.activePowerUps,
        reactionTime
      );

      // Update session with successful word
      session.foundWords.push(normalizedWord);
      session.wordsFound += 1;
      session.currentScore += wordScore.totalScore;
      session.comboStreak += 1;
      session.maxComboStreak = Math.max(session.maxComboStreak, session.comboStreak);

      // Update performance metrics
      const totalTime = session.foundWords.length > 1 ? 
        (currentTime.getTime() - session.startTime.getTime()) / 1000 : reactionTime / 1000;
      session.averageWordTime = totalTime / session.foundWords.length;
      session.wordsPerMinute = (session.foundWords.length / (totalTime / 60)) || 0;

      // Update word length tracking
      if (!session.longestWord || normalizedWord.length > session.longestWord.length) {
        session.longestWord = normalizedWord;
      }
      if (!session.shortestWord || normalizedWord.length < session.shortestWord.length) {
        session.shortestWord = normalizedWord;
      }

      // Update letter usage stats
      for (const letter of normalizedWord) {
        session.letterUsageStats.set(letter, (session.letterUsageStats.get(letter) || 0) + 1);
      }

      // Update word length distribution
      const length = normalizedWord.length;
      session.wordLengthDistribution.set(length.toString(), 
        (session.wordLengthDistribution.get(length.toString()) || 0) + 1
      );

      // Update progress
      updateGameProgress(session);

      // Check for achievements
      newAchievements = checkForAchievements(session, normalizedWord, reactionTime);
      session.achievements.push(...newAchievements);

      // Add attempt record
      session.attempts.push({
        word: normalizedWord,
        isValid: true,
        score: wordScore.totalScore,
        reactionTime,
        timestamp: currentTime,
        bonusMultiplier: wordScore.bonusMultiplier,
        letterCount: normalizedWord.length
      });

      response = {
        status: 'valid' as WordValidationStatus,
        isValid: true,
        score: wordScore.totalScore,
        bonusMultiplier: wordScore.bonusMultiplier,
        newWord: true,
        wordLength: normalizedWord.length,
        remainingLetters: availableLetters,
        message: wordScore.bonusMultiplier > 1 ? 
          `Great word! ${wordScore.bonusMultiplier}x bonus!` : 'Valid word!',
        achievement: newAchievements.length > 0 ? newAchievements[0] : undefined
      };

    } else {
      // Handle invalid word
      session.comboStreak = 0; // Reset combo on invalid word
      
      // Add failed attempt record
      session.attempts.push({
        word: normalizedWord,
        isValid: false,
        score: 0,
        reactionTime,
        timestamp: currentTime,
        bonusMultiplier: 1,
        letterCount: normalizedWord.length
      });

      let message = 'Invalid word';
      switch (validationResult.status) {
        case 'already_used':
          message = 'Word already found!';
          break;
        case 'too_short':
          message = 'Word too short (minimum 3 letters)';
          break;
        case 'invalid_letters':
          message = 'Invalid letters used';
          break;
        default:
          message = 'Word not found in challenge';
      }

      response = {
        status: validationResult.status,
        isValid: false,
        score: 0,
        bonusMultiplier: 1,
        newWord: false,
        wordLength: normalizedWord.length,
        remainingLetters: availableLetters,
        message
      };
    }

    // Update accuracy
    const totalAttempts = session.attempts.length;
    const validAttempts = session.attempts.filter(a => a.isValid).length;
    session.accuracy = totalAttempts > 0 ? validAttempts / totalAttempts : 1;

    // Save session
    await session.save();

    // Include game state in response
    const gameState = {
      currentScore: session.currentScore,
      wordsFound: session.wordsFound,
      comboStreak: session.comboStreak,
      accuracy: Math.round(session.accuracy * 100),
      completionPercentage: session.completionPercentage,
      achievements: newAchievements,
      longestWord: session.longestWord,
      averageWordTime: Math.round(session.averageWordTime * 10) / 10
    };

    return NextResponse.json({
      success: true,
      validation: response,
      gameState
    });

  } catch (error) {
    console.error('Error validating word:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to validate word' },
      { status: 500 }
    );
  }
}