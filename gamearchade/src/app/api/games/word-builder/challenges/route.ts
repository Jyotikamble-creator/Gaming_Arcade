// API Route: Get Word Builder Challenges
import { NextRequest, NextResponse } from 'next/server';
import { 
  defaultWordBuilderChallenges, 
  WordBuilderDifficulty, 
  WordBuilderChallenge 
} from '@/types/games/word-builder';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty') as WordBuilderDifficulty;
    const category = searchParams.get('category');
    const random = searchParams.get('random') === 'true';
    const limit = parseInt(searchParams.get('limit') || '0');

    // Validate difficulty if provided
    const validDifficulties: WordBuilderDifficulty[] = ['easy', 'medium', 'hard', 'expert', 'master'];
    if (difficulty && !validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { success: false, error: 'Invalid difficulty. Use: easy, medium, hard, expert, or master' },
        { status: 400 }
      );
    }

    let challenges = [...defaultWordBuilderChallenges];

    // Filter by difficulty
    if (difficulty) {
      challenges = challenges.filter(challenge => challenge.difficulty === difficulty);
    }

    // Filter by category
    if (category) {
      challenges = challenges.filter(challenge => 
        challenge.category?.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Shuffle for random selection
    if (random) {
      challenges = challenges.sort(() => Math.random() - 0.5);
    }

    // Apply limit
    if (limit > 0) {
      challenges = challenges.slice(0, limit);
    }

    // Calculate difficulty distribution
    const difficultyStats = validDifficulties.reduce((acc, diff) => {
      acc[diff] = challenges.filter(c => c.difficulty === diff).length;
      return acc;
    }, {} as Record<WordBuilderDifficulty, number>);

    // Get unique categories
    const categories = [...new Set(challenges
      .map(c => c.category)
      .filter(Boolean)
    )];

    // For single random challenge, return just the challenge
    if (random && limit === 1 && challenges.length > 0) {
      const challenge = challenges[0];
      
      return NextResponse.json({
        success: true,
        challenge: {
          id: challenge.id,
          difficulty: challenge.difficulty,
          letters: challenge.letters,
          minWords: challenge.minWords,
          maxScore: challenge.maxScore,
          timeLimit: challenge.timeLimit,
          category: challenge.category,
          description: challenge.description,
          totalTargetWords: challenge.targetWords.length
        }
      });
    }

    // Return challenges list
    const challengesData = challenges.map(challenge => ({
      id: challenge.id,
      difficulty: challenge.difficulty,
      letters: challenge.letters,
      minWords: challenge.minWords,
      maxScore: challenge.maxScore,
      timeLimit: challenge.timeLimit,
      category: challenge.category,
      description: challenge.description,
      totalTargetWords: challenge.targetWords.length,
      letterCount: challenge.letters.length,
      avgWordLength: Math.round(
        challenge.targetWords.reduce((sum, word) => sum + word.length, 0) / 
        challenge.targetWords.length * 10
      ) / 10
    }));

    return NextResponse.json({
      success: true,
      challenges: challengesData,
      meta: {
        total: challengesData.length,
        difficulties: difficultyStats,
        categories,
        filters: {
          difficulty: difficulty || null,
          category: category || null,
          random,
          limit: limit || null
        }
      }
    });

  } catch (error) {
    console.error('Error getting Word Builder challenges:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve challenges' },
      { status: 500 }
    );
  }
}