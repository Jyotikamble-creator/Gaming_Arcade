/**
 * API Route: Pixel art projects management
 * GET/POST/DELETE /api/games/pixel-art-creator/projects
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateProjectId } from '@/utility/games/pixel-art-creator';
import type {
  PixelArtProject,
  SaveProjectRequest,
  PixelArtApiResponse
} from '@/types/games/pixel-art-creator';

// In-memory storage (in production, use a database)
const savedProjects = new Map<string, PixelArtProject>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const projectId = searchParams.get('id');
    const userId = searchParams.get('userId');
    const isPublic = searchParams.get('public') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (projectId) {
      // Get specific project
      const project = savedProjects.get(projectId);
      if (!project) {
        return NextResponse.json(
          { success: false, error: 'Project not found' },
          { status: 404 }
        );
      }

      // Check if user can access this project
      if (!project.isPublic && project.userId !== userId) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        data: project
      } as PixelArtApiResponse<PixelArtProject>);
    } else {
      // Get user's projects or public projects
      const projects: PixelArtProject[] = [];

      for (const project of savedProjects.values()) {
        if (userId && project.userId === userId) {
          projects.push(project);
        } else if (isPublic && project.isPublic) {
          projects.push(project);
        }
      }

      // Sort by creation date (newest first)
      projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Apply limit
      const limitedProjects = projects.slice(0, limit);

      return NextResponse.json({
        success: true,
        data: limitedProjects,
        meta: {
          total: projects.length,
          returned: limitedProjects.length,
          hasMore: projects.length > limit
        }
      } as PixelArtApiResponse<PixelArtProject[]>);
    }
  } catch (error) {
    console.error('Pixel Art Creator Projects GET API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const saveData: SaveProjectRequest = await request.json();
    const { name, grid, width, height, isPublic = false, tags = [], userId } = saveData;

    // Validate input
    if (!name || !grid || !Array.isArray(grid)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project data' },
        { status: 400 }
      );
    }

    // Validate grid structure
    if (grid.length === 0 || !Array.isArray(grid[0])) {
      return NextResponse.json(
        { success: false, error: 'Invalid grid structure' },
        { status: 400 }
      );
    }

    const projectId = generateProjectId();
    const project: PixelArtProject = {
      id: projectId,
      name: name.trim(),
      grid,
      width: width || grid[0].length,
      height: height || grid.length,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId,
      isPublic,
      tags: tags.filter(tag => tag.trim().length > 0)
    };

    savedProjects.set(projectId, project);

    return NextResponse.json({
      success: true,
      data: {
        projectId,
        project: {
          id: project.id,
          name: project.name,
          width: project.width,
          height: project.height,
          createdAt: project.createdAt,
          isPublic: project.isPublic,
          tags: project.tags
        }
      },
      message: 'Project saved successfully'
    } as PixelArtApiResponse);
  } catch (error) {
    console.error('Pixel Art Creator Projects POST API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    const { name, grid, isPublic, tags, userId } = updateData;

    const project = savedProjects.get(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (project.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update project
    if (name !== undefined) project.name = name.trim();
    if (grid !== undefined) project.grid = grid;
    if (isPublic !== undefined) project.isPublic = isPublic;
    if (tags !== undefined) project.tags = tags.filter((tag: string) => tag.trim().length > 0);
    project.updatedAt = new Date();

    savedProjects.set(projectId, project);

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully'
    } as PixelArtApiResponse);
  } catch (error) {
    console.error('Pixel Art Creator Projects PUT API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    const userId = searchParams.get('userId');

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

    // Check ownership
    if (project.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    savedProjects.delete(projectId);

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    } as PixelArtApiResponse);
  } catch (error) {
    console.error('Pixel Art Creator Projects DELETE API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}