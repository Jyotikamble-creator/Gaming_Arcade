/**
 * API Route: Pixel art creator statistics
 * GET /api/games/pixel-art-creator/stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { PIXEL_ART_TEMPLATES, COLOR_PALETTES } from '@/utility/games/pixel-art-creator';
import type { PixelArtApiResponse } from '@/types/games/pixel-art-creator';

// In-memory storage (in production, use a database)
const savedProjects = new Map();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Calculate statistics
    const totalProjects = savedProjects.size;
    const publicProjects = Array.from(savedProjects.values()).filter((p: any) => p.isPublic).length;
    const userProjects = userId
      ? Array.from(savedProjects.values()).filter((p: any) => p.userId === userId).length
      : 0;

    // Calculate color usage statistics
    const colorUsage = new Map<string, number>();
    const tagUsage = new Map<string, number>();

    for (const project of savedProjects.values()) {
      // Count colors used in each project
      const usedColors = new Set<string>();
      for (const row of project.grid) {
        for (const color of row) {
          if (color !== '#ffffff') { // Exclude transparent/white
            usedColors.add(color);
          }
        }
      }
      usedColors.forEach(color => {
        colorUsage.set(color, (colorUsage.get(color) || 0) + 1);
      });

      // Count tags
      project.tags.forEach((tag: string) => {
        tagUsage.set(tag, (tagUsage.get(tag) || 0) + 1);
      });
    }

    // Get most used colors
    const mostUsedColors = Array.from(colorUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([color, count]) => ({ color, count }));

    // Get most used tags
    const mostUsedTags = Array.from(tagUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    // Template and palette statistics
    const templateStats = {
      total: PIXEL_ART_TEMPLATES.length,
      byCategory: PIXEL_ART_TEMPLATES.reduce((acc, template) => {
        acc[template.category] = (acc[template.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byDifficulty: PIXEL_ART_TEMPLATES.reduce((acc, template) => {
        acc[template.difficulty] = (acc[template.difficulty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    const paletteStats = {
      total: COLOR_PALETTES.length,
      byCategory: COLOR_PALETTES.reduce((acc, palette) => {
        acc[palette.category] = (acc[palette.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    const stats = {
      projects: {
        total: totalProjects,
        public: publicProjects,
        private: totalProjects - publicProjects,
        userProjects: userProjects
      },
      colors: {
        mostUsed: mostUsedColors,
        totalUnique: colorUsage.size
      },
      tags: {
        mostUsed: mostUsedTags,
        totalUnique: tagUsage.size
      },
      templates: templateStats,
      palettes: paletteStats,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: stats
    } as PixelArtApiResponse<typeof stats>);
  } catch (error) {
    console.error('Pixel Art Creator Stats API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}