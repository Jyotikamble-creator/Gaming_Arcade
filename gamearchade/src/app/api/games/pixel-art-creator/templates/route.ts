/**
 * API Route: Get pixel art templates
 * GET /api/games/pixel-art-creator/templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { PIXEL_ART_TEMPLATES, getTemplateById, getTemplatesByCategory } from '@/utility/games/pixel-art-creator';
import type { PixelArtTemplate, PixelArtApiResponse } from '@/types/games/pixel-art-creator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const templateId = searchParams.get('id');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | null;
    const limit = parseInt(searchParams.get('limit') || '0');

    let templates: PixelArtTemplate[];

    if (templateId) {
      // Get specific template
      const template = getTemplateById(templateId);
      if (!template) {
        return NextResponse.json(
          { success: false, error: 'Template not found' },
          { status: 404 }
        );
      }
      templates = [template];
    } else if (category) {
      // Get templates by category
      templates = getTemplatesByCategory(category);
    } else {
      // Get all templates
      templates = [...PIXEL_ART_TEMPLATES];
    }

    // Filter by difficulty if specified
    if (difficulty) {
      templates = templates.filter(template => template.difficulty === difficulty);
    }

    // Apply limit if specified
    if (limit > 0) {
      templates = templates.slice(0, limit);
    }

    // Get unique categories for metadata
    const categories = [...new Set(PIXEL_ART_TEMPLATES.map(t => t.category))];
    const difficulties = ['easy', 'medium', 'hard'];

    return NextResponse.json({
      success: true,
      data: templates,
      meta: {
        total: templates.length,
        categories,
        difficulties,
        availableCategories: categories,
        availableDifficulties: difficulties
      }
    } as PixelArtApiResponse<PixelArtTemplate[]>);
  } catch (error) {
    console.error('Pixel Art Creator Templates API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}