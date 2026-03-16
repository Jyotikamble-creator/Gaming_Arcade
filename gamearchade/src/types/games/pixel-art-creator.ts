// TypeScript types for Pixel Art Creator game

export type PixelColor = string; // Hex color code like '#ff0000'
export type PixelGrid = PixelColor[][];
export type ToolType = 'paint' | 'erase' | 'fill' | 'picker';

export interface PixelArtProject {
  id: string;
  name: string;
  grid: PixelGrid;
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  isPublic: boolean;
  tags: string[];
}

export interface PixelArtTemplate {
  id: string;
  name: string;
  description: string;
  grid: PixelGrid;
  width: number;
  height: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: PixelColor[];
  category: string;
}

export interface PixelArtStats {
  totalProjects: number;
  totalPixels: number;
  favoriteColors: PixelColor[];
  mostUsedTools: ToolType[];
}

export interface SaveProjectRequest {
  name: string;
  grid: PixelGrid;
  width: number;
  height: number;
  isPublic?: boolean;
  tags?: string[];
  userId?: string;
}

export interface LoadProjectRequest {
  projectId: string;
  userId?: string;
}

export interface PixelArtApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}