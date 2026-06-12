import { NextRequest, NextResponse } from 'next/server';
import { createMinesweeperGame } from '@/lib/games/minesweeper';
import type { MinesweeperDifficulty, MinesweeperConfig } from '@/types/games/minesweeper';

/**
 * POST /api/games/minesweeper
 * Create a new Minesweeper game
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { difficulty = 'beginner', customConfig } = body as {
      difficulty?: MinesweeperDifficulty;
      customConfig?: Partial<MinesweeperConfig>;
    };

    // Validate difficulty
    const validDifficulties: MinesweeperDifficulty[] = ['beginner', 'intermediate', 'expert', 'custom'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty level' },
        { status: 400 }
      );
    }

    // Create new game
    const game = createMinesweeperGame(difficulty, customConfig);

    return NextResponse.json({
      success: true,
      game: {
        ...game,
        // Don't send the actual mine positions to client
        board: game.board.map(row =>
          row.map(cell => ({
            ...cell,
            isMine: false, // Hide mine information from client
            neighborMines: cell.isRevealed ? cell.neighborMines : 0
          }))
        )
      }
    });

  } catch (error) {
    console.error('Error creating Minesweeper game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/games/minesweeper
 * Get game statistics or configuration
 */
export async function GET() {
  try {
    // Return game configuration info
    const configs = {
      beginner: { rows: 9, cols: 9, mines: 10 },
      intermediate: { rows: 16, cols: 16, mines: 40 },
      expert: { rows: 16, cols: 30, mines: 99 }
    };

    return NextResponse.json({
      success: true,
      configs
    });

  } catch (error) {
    console.error('Error getting Minesweeper config:', error);
    return NextResponse.json(
      { error: 'Failed to get configuration' },
      { status: 500 }
    );
  }
}