/**
 * API Route: Get available themes and difficulties
 * GET /api/games/memory/config
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllThemes, getAllDifficulties } from '@/utility/games/memory';

export async function GET(request: NextRequest) {
  try {
    const themes = getAllThemes();
    const difficulties = getAllDifficulties();

    console.log('[MEMORY] Configuration retrieved');

    return NextResponse.json({
      themes: themes.map(t => ({
        theme: t.theme,
        displayName: t.displayName,
        icon: t.icon,
        cardCount: t.values.length
      })),
      difficulties: difficulties.map(d => ({
        difficulty: d.difficulty,
        pairs: d.pairs,
        totalCards: d.pairs * 2,
        scoreMultiplier: d.scoreMultiplier,
        timeLimit: d.timeLimit
      }))
    }, { status: 200 });

  } catch (error) {
    console.error('[MEMORY] Error fetching config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}
