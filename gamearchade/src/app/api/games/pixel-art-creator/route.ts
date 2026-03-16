/**
 * API Route: Pixel Art Creator game operations
 * GET/POST /api/games/pixel-art-creator
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createEmptyGrid,
  getTemplateById,
  getTemplatesByCategory,
  generateProjectId,
  PIXEL_ART_TEMPLATES,
  COLOR_PALETTES
} from '@/utility/games/pixel-art-creator';
import type {
  PixelArtProject,
  PixelArtTemplate,
  ColorPalette,
  SaveProjectRequest,
  PixelArtApiResponse
} from '@/types/games/pixel-art-creator';

// In-memory storage (in production, use a database)
const savedProjects = new Map<string, PixelArtProject>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'templates':
        const category = searchParams.get('category');
        const templates = category
          ? getTemplatesByCategory(category)
          : PIXEL_ART_TEMPLATES;

        return NextResponse.json({
          success: true,
          data: templates
        } as PixelArtApiResponse<PixelArtTemplate[]>);

      case 'palettes':
        return NextResponse.json({
          success: true,
          data: COLOR_PALETTES
        } as PixelArtApiResponse<ColorPalette[]>);

      case 'project':
        const projectId = searchParams.get('projectId');
        if (!projectId) {
          return NextResponse.json(
            { success: false, error: 'Project ID is required' },
            { status: 400 }
          );
        }

        const project = savedProjects.get(projectId);
        if (!project) {
          return NextResponse.json(
            { success: false, error: 'Project not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: project
        } as PixelArtApiResponse<PixelArtProject>);

      default:
        return NextResponse.json({
          success: true,
          data: {
            templates: PIXEL_ART_TEMPLATES.length,
            palettes: COLOR_PALETTES.length,
            savedProjects: savedProjects.size
          }
        });
    }
  } catch (error) {
    console.error('Pixel Art Creator API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'save-project':
        const saveData: SaveProjectRequest = await request.json();
        const { name, grid, width, height, isPublic = false, tags = [], userId } = saveData;

        // Validate input
        if (!name || !grid || !Array.isArray(grid)) {
          return NextResponse.json(
            { success: false, error: 'Invalid project data' },
            { status: 400 }
          );
        }

        const projectId = generateProjectId();
        const project: PixelArtProject = {
          id: projectId,
          name,
          grid,
          width: width || grid[0]?.length || 16,
          height: height || grid.length || 16,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId,
          isPublic,
          tags
        };

        savedProjects.set(projectId, project);

        return NextResponse.json({
          success: true,
          data: { projectId },
          message: 'Project saved successfully'
        } as PixelArtApiResponse<{ projectId: string }>);

      case 'load-template':
        const { templateId } = await request.json();

        if (!templateId) {
          return NextResponse.json(
            { success: false, error: 'Template ID is required' },
            { status: 400 }
          );
        }

        const template = getTemplateById(templateId);
        if (!template) {
          return NextResponse.json(
            { success: false, error: 'Template not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: template
        } as PixelArtApiResponse<PixelArtTemplate>);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Pixel Art Creator POST API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}