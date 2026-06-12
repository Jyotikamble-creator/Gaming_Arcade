/**
 * API Route: Pixel art gallery - public shared artwork
 * GET /api/games/pixel-art-creator/gallery
 */

import { NextRequest, NextResponse } from 'next/server';
import type { PixelArtProject, PixelArtApiResponse } from '@/types/games/pixel-art-creator';

// In-memory storage (in production, use a database)
// This would be shared with the projects storage in a real implementation
const publicProjects = new Map<string, PixelArtProject>();

// Add some sample public projects for demonstration
const initializeSampleGallery = () => {
  if (publicProjects.size === 0) {
    const sampleProjects: PixelArtProject[] = [
      {
        id: 'gallery_mario',
        name: 'Super Mario',
        grid: [
          ['#ffffff', '#ffffff', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ffffff', '#ffffff'],
          ['#ffffff', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ffffff'],
          ['#8b4513', '#8b4513', '#ffd700', '#ffd700', '#ffffff', '#8b4513', '#ffffff', '#ffffff'],
          ['#8b4513', '#ffd700', '#8b4513', '#ffd700', '#8b4513', '#ffd700', '#8b4513', '#ffffff'],
          ['#8b4513', '#ffd700', '#8b4513', '#8b4513', '#8b4513', '#8b4513', '#ffd700', '#8b4513'],
          ['#8b4513', '#8b4513', '#ffd700', '#ffd700', '#ffd700', '#ffd700', '#8b4513', '#8b4513'],
          ['#ffffff', '#ffffff', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ffffff', '#ffffff'],
          ['#0000ff', '#0000ff', '#0000ff', '#0000ff', '#0000ff', '#0000ff', '#0000ff', '#0000ff']
        ],
        width: 8,
        height: 8,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        userId: 'sample_user_1',
        isPublic: true,
        tags: ['mario', 'character', 'gaming', 'classic']
      },
      {
        id: 'gallery_heart',
        name: 'Pixel Heart',
        grid: [
          ['#ffffff', '#ffffff', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ffffff', '#ffffff'],
          ['#ffffff', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ffffff'],
          ['#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000'],
          ['#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000'],
          ['#ffffff', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ffffff'],
          ['#ffffff', '#ffffff', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ffffff', '#ffffff'],
          ['#ffffff', '#ffffff', '#ffffff', '#ff0000', '#ff0000', '#ffffff', '#ffffff', '#ffffff'],
          ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']
        ],
        width: 8,
        height: 8,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
        userId: 'sample_user_2',
        isPublic: true,
        tags: ['heart', 'love', 'shape', 'romantic']
      }
    ];

    sampleProjects.forEach(project => {
      publicProjects.set(project.id, project);
    });
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Initialize sample gallery if empty
    initializeSampleGallery();

    const projectId = searchParams.get('id');
    const tag = searchParams.get('tag');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let galleryProjects: PixelArtProject[] = Array.from(publicProjects.values());

    if (projectId) {
      // Get specific project
      const project = publicProjects.get(projectId);
      if (!project) {
        return NextResponse.json(
          { success: false, error: 'Gallery project not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: project
      } as PixelArtApiResponse<PixelArtProject>);
    }

    // Filter by tag if specified
    if (tag) {
      galleryProjects = galleryProjects.filter(project =>
        project.tags.includes(tag.toLowerCase())
      );
    }

    // Sort by creation date (newest first)
    galleryProjects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    const total = galleryProjects.length;
    const paginatedProjects = galleryProjects.slice(offset, offset + limit);

    // Get all unique tags for metadata
    const allTags = new Set<string>();
    galleryProjects.forEach(project => {
      project.tags.forEach(tag => allTags.add(tag));
    });

    return NextResponse.json({
      success: true,
      data: paginatedProjects,
      meta: {
        total,
        returned: paginatedProjects.length,
        offset,
        limit,
        hasMore: offset + limit < total,
        availableTags: Array.from(allTags).sort()
      }
    } as PixelArtApiResponse<PixelArtProject[]>);
  } catch (error) {
    console.error('Pixel Art Creator Gallery API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}