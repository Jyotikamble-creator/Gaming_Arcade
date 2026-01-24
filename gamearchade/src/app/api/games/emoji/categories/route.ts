/**
 * API Route: Get all available emoji puzzle categories
 * GET /api/games/emoji/categories
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories, getPuzzlesByCategory } from '@/utility/games/emoji';

export async function GET(request: NextRequest) {
  try {
    const categories = getAllCategories();

    // Get puzzle count for each category
    const categoryStats = categories.map(category => ({
      category,
      puzzleCount: getPuzzlesByCategory(category).length,
      icon: getCategoryIcon(category)
    }));

    console.log('[EMOJI] Returning categories:', categoryStats.length);

    return NextResponse.json({
      categories: categoryStats,
      total: categories.length
    }, { status: 200 });

  } catch (error) {
    console.error('[EMOJI] Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// Helper function to get category icon
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Fantasy: '🐉',
    Space: '🚀',
    Nature: '🌳',
    Weather: '🌤️',
    Food: '🍕',
    Beverage: '🥤',
    Lifestyle: '☕',
    Work: '💼',
    Productivity: '⏰',
    Entertainment: '🎬',
    Technology: '💻',
    Emotions: '😊',
    Celebration: '🎉',
    Sports: '⚽',
    Music: '🎵',
    Art: '🎨',
    Education: '📚',
    Travel: '✈️',
    Adventure: '🗺️',
    Animals: '🐾'
  };

  return icons[category] || '🎮';
}
