// Pixel Art Creator game constants and utilities
import type {
  PixelColor,
  PixelGrid,
  PixelArtTemplate,
  ColorPalette,
  PixelArtProject
} from '@/types/games/pixel-art-creator';

// Game configuration
export const GAME_CONFIG = {
  DEFAULT_GRID_SIZE: 16,
  MAX_GRID_SIZE: 32,
  MIN_GRID_SIZE: 8,
  DEFAULT_COLOR: '#000000',
  TRANSPARENT_COLOR: '#ffffff'
} as const;

// Predefined color palettes
export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'basic',
    name: 'Basic Colors',
    category: 'basic',
    colors: [
      '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
      '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
    ]
  },
  {
    id: 'pastel',
    name: 'Pastel Colors',
    category: 'themed',
    colors: [
      '#ffb3ba', '#ffdfba', '#ffffba', '#baffba', '#bae1ff',
      '#e8baff', '#ffb3d9', '#ffd1b3', '#b3ffb3', '#b3d9ff'
    ]
  },
  {
    id: 'retro',
    name: 'Retro Gaming',
    category: 'themed',
    colors: [
      '#2d1b69', '#11998e', '#38ef7d', '#ffe869', '#ff6b6b',
      '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'
    ]
  }
];

// Pixel art templates
export const PIXEL_ART_TEMPLATES: PixelArtTemplate[] = [
  {
    id: 'smiley',
    name: 'Smiley Face',
    description: 'A simple smiley face to get started',
    width: 8,
    height: 8,
    category: 'faces',
    difficulty: 'easy',
    tags: ['face', 'emoji', 'simple'],
    grid: [
      ['#ffffff', '#ffffff', '#000000', '#000000', '#000000', '#000000', '#ffffff', '#ffffff'],
      ['#ffffff', '#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#000000', '#ffffff'],
      ['#000000', '#ffffff', '#000000', '#ffffff', '#ffffff', '#000000', '#ffffff', '#000000'],
      ['#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#000000'],
      ['#000000', '#ffffff', '#000000', '#ffffff', '#ffffff', '#000000', '#ffffff', '#000000'],
      ['#000000', '#ffffff', '#ffffff', '#000000', '#000000', '#ffffff', '#ffffff', '#000000'],
      ['#ffffff', '#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#000000', '#ffffff'],
      ['#ffffff', '#ffffff', '#000000', '#000000', '#000000', '#000000', '#ffffff', '#ffffff']
    ]
  },
  {
    id: 'heart',
    name: 'Heart',
    description: 'A classic heart shape',
    width: 8,
    height: 8,
    category: 'shapes',
    difficulty: 'easy',
    tags: ['love', 'shape', 'classic'],
    grid: [
      ['#ffffff', '#ffffff', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ffffff', '#ffffff'],
      ['#ffffff', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ffffff'],
      ['#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000'],
      ['#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000'],
      ['#ffffff', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ffffff'],
      ['#ffffff', '#ffffff', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ffffff', '#ffffff'],
      ['#ffffff', '#ffffff', '#ffffff', '#ff0000', '#ff0000', '#ffffff', '#ffffff', '#ffffff'],
      ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']
    ]
  },
  {
    id: 'mario-pixel',
    name: 'Mario Pixel',
    description: 'Classic Mario character in pixel art',
    width: 12,
    height: 16,
    category: 'characters',
    difficulty: 'medium',
    tags: ['mario', 'character', 'gaming', 'classic'],
    grid: [
      ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ffffff', '#ffffff', '#ffffff', '#ffffff'],
      ['#ffffff', '#ffffff', '#ffffff', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ffffff', '#ffffff'],
      ['#ffffff', '#ffffff', '#ffffff', '#8b4513', '#8b4513', '#ffd700', '#ffd700', '#ffffff', '#8b4513', '#ffffff', '#ffffff', '#ffffff'],
      ['#ffffff', '#ffffff', '#8b4513', '#ffd700', '#8b4513', '#ffd700', '#ffd700', '#8b4513', '#ffd700', '#8b4513', '#ffffff', '#ffffff'],
      ['#ffffff', '#ffffff', '#8b4513', '#ffd700', '#8b4513', '#8b4513', '#8b4513', '#8b4513', '#ffd700', '#8b4513', '#ffffff', '#ffffff'],
      ['#ffffff', '#ffffff', '#8b4513', '#8b4513', '#ffd700', '#ffd700', '#ffd700', '#ffd700', '#8b4513', '#8b4513', '#ffffff', '#ffffff'],
      ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ff0000', '#ff0000', '#ff0000', '#ff0000', '#ffffff', '#ffffff', '#ffffff', '#ffffff'],
      ['#ffffff', '#ffffff', '#0000ff', '#0000ff', '#0000ff', '#0000ff', '#0000ff', '#0000ff', '#0000ff', '#0000ff', '#ffffff', '#ffffff'],
      ['#0000ff', '#0000ff', '#0000ff', '#0000ff', '#0000ff', '#0000ff', '#0000ff', '#0000ff', '#0000ff', '#0000ff', '#0000ff', '#0000ff'],
      ['#ffd700', '#ffd700', '#0000ff', '#ffd700', '#ffd700', '#0000ff', '#0000ff', '#ffd700', '#ffd700', '#0000ff', '#ffd700', '#ffd700'],
      ['#ffd700', '#ffd700', '#ffd700', '#ffd700', '#ffd700', '#0000ff', '#0000ff', '#ffd700', '#ffd700', '#ffd700', '#ffd700', '#ffd700'],
      ['#ffd700', '#ffd700', '#ffd700', '#ffd700', '#ffd700', '#0000ff', '#0000ff', '#ffd700', '#ffd700', '#ffd700', '#ffd700', '#ffd700'],
      ['#ffffff', '#ffffff', '#ffffff', '#0000ff', '#0000ff', '#ffffff', '#ffffff', '#0000ff', '#0000ff', '#ffffff', '#ffffff', '#ffffff'],
      ['#ffffff', '#ffffff', '#8b4513', '#8b4513', '#8b4513', '#8b4513', '#8b4513', '#8b4513', '#8b4513', '#8b4513', '#ffffff', '#ffffff'],
      ['#8b4513', '#8b4513', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#8b4513', '#8b4513'],
      ['#8b4513', '#8b4513', '#8b4513', '#8b4513', '#8b4513', '#8b4513', '#8b4513', '#8b4513', '#8b4513', '#8b4513', '#8b4513', '#8b4513']
    ]
  }
];

// Utility functions
export const createEmptyGrid = (width: number = GAME_CONFIG.DEFAULT_GRID_SIZE, height: number = GAME_CONFIG.DEFAULT_GRID_SIZE): PixelGrid => {
  return Array.from({ length: height }, () => Array(width).fill(GAME_CONFIG.TRANSPARENT_COLOR));
};

export const cloneGrid = (grid: PixelGrid): PixelGrid => {
  return grid.map(row => [...row]);
};

export const isValidGrid = (grid: PixelGrid): boolean => {
  if (!Array.isArray(grid) || grid.length === 0) return false;

  const height = grid.length;
  const width = grid[0].length;

  // Check if all rows have the same length
  return grid.every(row =>
    Array.isArray(row) &&
    row.length === width &&
    row.every(color => typeof color === 'string' && color.startsWith('#'))
  );
};

export const getGridDimensions = (grid: PixelGrid): { width: number; height: number } => {
  return {
    width: grid[0]?.length || 0,
    height: grid.length
  };
};

export const resizeGrid = (grid: PixelGrid, newWidth: number, newHeight: number): PixelGrid => {
  const newGrid = createEmptyGrid(newWidth, newHeight);

  const copyHeight = Math.min(grid.length, newHeight);
  const copyWidth = Math.min(grid[0]?.length || 0, newWidth);

  for (let y = 0; y < copyHeight; y++) {
    for (let x = 0; x < copyWidth; x++) {
      newGrid[y][x] = grid[y][x];
    }
  }

  return newGrid;
};

export const getUsedColors = (grid: PixelGrid): PixelColor[] => {
  const colors = new Set<PixelColor>();

  for (const row of grid) {
    for (const color of row) {
      if (color !== GAME_CONFIG.TRANSPARENT_COLOR) {
        colors.add(color);
      }
    }
  }

  return Array.from(colors);
};

export const getTemplateById = (id: string): PixelArtTemplate | undefined => {
  return PIXEL_ART_TEMPLATES.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): PixelArtTemplate[] => {
  return PIXEL_ART_TEMPLATES.filter(template => template.category === category);
};

export const getPaletteById = (id: string): ColorPalette | undefined => {
  return COLOR_PALETTES.find(palette => palette.id === id);
};

export const generateProjectId = (): string => {
  return `pixel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};