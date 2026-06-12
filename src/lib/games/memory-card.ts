// Memory Card game types and utilities
export type MemoryCardDifficulty = 'easy' | 'medium' | 'hard';

export interface MemoryCardSet {
  difficulty: MemoryCardDifficulty;
  theme: string;
  pairs: number;
  cards: Array<{ emoji: string; label: string }>;
}

export const MEMORY_CARD_SETS: Record<MemoryCardDifficulty, MemoryCardSet> = {
  easy: {
    difficulty: 'easy',
    theme: '🍎 Fruits',
    pairs: 3,
    cards: [
      { emoji: '🍎', label: 'Apple' },
      { emoji: '🍌', label: 'Banana' },
      { emoji: '🍊', label: 'Orange' },
    ],
  },
  medium: {
    difficulty: 'medium',
    theme: '🐶 Animals',
    pairs: 8,
    cards: [
      { emoji: '🐶', label: 'Dog' },
      { emoji: '🐱', label: 'Cat' },
      { emoji: '🐭', label: 'Mouse' },
      { emoji: '🐹', label: 'Hamster' },
      { emoji: '🦁', label: 'Lion' },
      { emoji: '🐯', label: 'Tiger' },
      { emoji: '🐢', label: 'Turtle' },
      { emoji: '🦋', label: 'Butterfly' },
    ],
  },
  hard: {
    difficulty: 'hard',
    theme: '🌍 Countries',
    pairs: 12,
    cards: [
      { emoji: '🇺🇸', label: 'USA' },
      { emoji: '🇬🇧', label: 'UK' },
      { emoji: '🇫🇷', label: 'France' },
      { emoji: '🇩🇪', label: 'Germany' },
      { emoji: '🇮🇳', label: 'India' },
      { emoji: '🇯🇵', label: 'Japan' },
      { emoji: '🇦🇺', label: 'Australia' },
      { emoji: '🇧🇷', label: 'Brazil' },
      { emoji: '🇨🇦', label: 'Canada' },
      { emoji: '🇲🇽', label: 'Mexico' },
      { emoji: '🇰🇷', label: 'South Korea' },
      { emoji: '🇷🇺', label: 'Russia' },
    ],
  },
};

/**
 * Generate shuffled cards for a given difficulty
 */
export function generateCardsForDifficulty(difficulty: MemoryCardDifficulty) {
  console.log('[MEMORY_CARD] generateCardsForDifficulty called with difficulty:', difficulty, 'type:', typeof difficulty);
  
  // Validate difficulty exists, fallback to medium if not
  const validDifficulty = (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) 
    ? difficulty 
    : 'medium' as MemoryCardDifficulty;
  
  console.log('[MEMORY_CARD] validDifficulty:', validDifficulty);
  console.log('[MEMORY_CARD] MEMORY_CARD_SETS keys:', Object.keys(MEMORY_CARD_SETS));
  
  const cardSet = MEMORY_CARD_SETS[validDifficulty];
  
  console.log('[MEMORY_CARD] cardSet:', cardSet);
  
  if (!cardSet) {
    console.error(`[MEMORY_CARD] Invalid difficulty: ${difficulty}, using medium fallback`);
    return generateCardsForDifficulty('medium');
  }
  
  const cards = cardSet.cards;
  console.log('[MEMORY_CARD] cards array:', cards, 'length:', cards?.length);
  
  if (!cards || cards.length === 0) {
    console.error(`[MEMORY_CARD] No cards found for difficulty: ${validDifficulty}`);
    return [];
  }
  
  const duplicated = [...cards, ...cards];
  console.log('[MEMORY_CARD] duplicated array created, length:', duplicated.length);

  // Fisher-Yates shuffle
  for (let i = duplicated.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [duplicated[i], duplicated[j]] = [duplicated[j], duplicated[i]];
  }

  const mapped = duplicated.map((card, index) => ({
    id: index,
    value: card.emoji,
    category: cardSet.theme,
  }));
  
  console.log('[MEMORY_CARD] mapped cards, length:', mapped.length, 'sample cards:', mapped.slice(0, 3));
  
  return mapped;
}

/**
 * Get grid columns based on difficulty
 */
export function getGridColsForDifficulty(difficulty: MemoryCardDifficulty): number {
  const validDifficulty = (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) 
    ? difficulty 
    : 'medium' as MemoryCardDifficulty;
    
  const cols: Record<MemoryCardDifficulty, number> = {
    easy: 3,
    medium: 4,
    hard: 6,
  };
  
  const gridCols = cols[validDifficulty];
  return gridCols || 4; // Default to 4 if something goes wrong
}
