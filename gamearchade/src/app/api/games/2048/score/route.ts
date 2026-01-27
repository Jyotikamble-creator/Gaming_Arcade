import { NextRequest, NextResponse } from 'next/server';

interface ScoreSubmission {
  game: string;
  score: number;
  meta: {
    reached2048: boolean;
    bestScore: number;
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

    // Here you would typically save to a database
    // For now, we'll just log it and return success
    console.log('2048 Score submitted:', {
      score: body.score,
      reached2048: body.meta?.reached2048 || false,
      bestScore: body.meta?.bestScore || 0,
      timestamp: new Date().toISOString()
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Score submitted successfully',
      data: {
        score: body.score,
        gameType: '2048',
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error submitting 2048 score:', error);
    
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return top 10 2048 scores (mock data for now)
  const mockScores = [
    { id: 1, player: 'Player1', score: 15432, reached2048: true, date: '2024-01-20' },
    { id: 2, player: 'Player2', score: 12890, reached2048: true, date: '2024-01-19' },
    { id: 3, player: 'Player3', score: 10245, reached2048: false, date: '2024-01-18' },
    { id: 4, player: 'Player4', score: 8765, reached2048: false, date: '2024-01-17' },
    { id: 5, player: 'Player5', score: 6543, reached2048: false, date: '2024-01-16' },
  ];

  return NextResponse.json({
    success: true,
    data: mockScores
  });
}