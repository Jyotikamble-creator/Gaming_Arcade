/**
 * API Route: Get color palettes for pixel art
 * GET /api/games/pixel-art-creator/palettes
 */

import { NextRequest, NextResponse } from 'next/server';
import { COLOR_PALETTES, getPaletteById } from '@/utility/games/pixel-art-creator';
import type { ColorPalette, PixelArtApiResponse } from '@/types/games/pixel-art-creator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const paletteId = searchParams.get('id');
    const category = searchParams.get('category');

    let palettes: ColorPalette[];

    if (paletteId) {
      // Get specific palette
      const palette = getPaletteById(paletteId);
      if (!palette) {
        return NextResponse.json(
          { success: false, error: 'Palette not found' },
          { status: 404 }
        );
      }
      palettes = [palette];
    } else if (category) {
      // Get palettes by category
      palettes = COLOR_PALETTES.filter(palette => palette.category === category);
    } else {
      // Get all palettes
      palettes = [...COLOR_PALETTES];
    }

    // Get unique categories for metadata
    const categories = [...new Set(COLOR_PALETTES.map(p => p.category))];

    return NextResponse.json({
      success: true,
      data: palettes,
      meta: {
        total: palettes.length,
        categories,
        availableCategories: categories
      }
    } as PixelArtApiResponse<ColorPalette[]>);
  } catch (error) {
    console.error('Pixel Art Creator Palettes API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}