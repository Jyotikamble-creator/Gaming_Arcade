import { NextRequest, NextResponse } from 'next/server';
import { makeMinesweeperMove } from '@/lib/games/minesweeper';
import type { MinesweeperMoveData, MinesweeperGame } from '@/types/games/minesweeper';

/**
 * POST /api/games/minesweeper/move
 * Make a move in an existing Minesweeper game
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, move } = body as {
      gameId: string;
      move: MinesweeperMoveData;
    };

    if (!gameId || !move) {
      return NextResponse.json(
        { error: 'Missing gameId or move data' },
        { status: 400 }
      );
    }

    // Validate move data
    if (typeof move.row !== 'number' || typeof move.col !== 'number') {
      return NextResponse.json(
        { error: 'Invalid move coordinates' },
        { status: 400 }
      );
    }

    if (!['reveal', 'flag', 'unflag', 'question', 'unquestion'].includes(move.move)) {
      return NextResponse.json(
        { error: 'Invalid move type' },
        { status: 400 }
      );
    }

    // In a real implementation, you'd retrieve the game state from a database
    // For now, we'll expect the full game state to be sent from the client
    const { game: clientGame } = body as { game: MinesweeperGame };

    if (!clientGame) {
      return NextResponse.json(
        { error: 'Game state required' },
        { status: 400 }
      );
    }

    // Make the move
    const { game: updatedGame, result } = makeMinesweeperMove(clientGame, move);

    // Return updated game state (without revealing mine positions)
    const safeGame = {
      ...updatedGame,
      board: updatedGame.board.map(row =>
        row.map(cell => ({
          ...cell,
          isMine: cell.isRevealed ? cell.isMine : false, // Only reveal mines when game is over or cell is revealed
          neighborMines: cell.isRevealed ? cell.neighborMines : 0
        }))
      )
    };

    return NextResponse.json({
      success: true,
      game: safeGame,
      result
    });

  } catch (error) {
    console.error('Error making Minesweeper move:', error);
    return NextResponse.json(
      { error: 'Failed to make move' },
      { status: 500 }
    );
  }
}