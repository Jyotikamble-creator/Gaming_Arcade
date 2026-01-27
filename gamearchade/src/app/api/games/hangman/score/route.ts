import { NextRequest, NextResponse } from 'next/server';

interface ScoreSubmission {
  game: string;
  score: number;
  meta: {
    wordsCompleted: number;
    category: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ScoreSubmission = await request.json();
    
    // Validate the request body
    if (!body.score || typeof body.score !== 'number') {
      return NextResponse.json(
        { error: 'Invalid score provided' },
        { status: 400 }
      );
    }

    if (!body.meta?.category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    // Here you would typically save to a database
    // For now, we'll just log it and return success
    console.log('Hangman Score submitted:', {
      score: body.score,
      wordsCompleted: body.meta.wordsCompleted || 0,
      category: body.meta.category,
      timestamp: new Date().toISOString()
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Score submitted successfully',
      data: {
        score: body.score,
        gameType: 'hangman',
        category: body.meta.category,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error submitting hangman score:', error);
    
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return top hangman scores (mock data for now)
  const mockScores = [
    { id: 1, player: 'WordMaster', score: 850, wordsCompleted: 12, category: 'animals', date: '2024-01-20' },
    { id: 2, player: 'GuessExpert', score: 720, wordsCompleted: 10, category: 'countries', date: '2024-01-19' },
    { id: 3, player: 'PuzzleKing', score: 680, wordsCompleted: 9, category: 'technology', date: '2024-01-18' },
    { id: 4, player: 'WordWizard', score: 590, wordsCompleted: 8, category: 'fruits', date: '2024-01-17' },
    { id: 5, player: 'HangmanPro', score: 540, wordsCompleted: 7, category: 'sports', date: '2024-01-16' },
  ];

  return NextResponse.json({
    success: true,
    data: mockScores
  });
}