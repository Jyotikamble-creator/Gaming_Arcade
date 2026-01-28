import { NextRequest, NextResponse } from 'next/server';

interface Card {
  id: number;
  value: string;
  category: string;
}

// Card categories with their respective emoji sets
const cardCategories = {
  fruits: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍑', '🥝', '🍍', '🥭', '🍒', '🍑', '🥥'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸'],
  vehicles: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚'],
  nature: ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🌿', '🍀', '🌳', '🌲', '🌱', '🌾'],
  space: ['🌟', '⭐', '🌙', '☀️', '🪐', '🌍', '🌎', '🌏', '🚀', '🛸', '👽', '🌌'],
  food: ['🍔', '🍕', '🍟', '🌭', '🥪', '🌮', '🌯', '🥗', '🍝', '🍜', '🍲', '🥘']
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateCards(difficulty: 'easy' | 'medium' | 'hard' = 'medium', category?: string): Card[] {
  // Determine number of pairs based on difficulty
  const pairCounts = {
    easy: 6,    // 12 cards
    medium: 8,  // 16 cards
    hard: 12    // 24 cards
  };

  const pairCount = pairCounts[difficulty];
  
  // Select category or random if not specified
  const availableCategories = Object.keys(cardCategories);
  const selectedCategory = category && cardCategories[category as keyof typeof cardCategories]
    ? category
    : availableCategories[Math.floor(Math.random() * availableCategories.length)];

  const categoryEmojis = cardCategories[selectedCategory as keyof typeof cardCategories];
  
  // Select random emojis for the game
  const selectedEmojis = shuffleArray(categoryEmojis).slice(0, pairCount);
  
  // Create pairs of cards
  const cards: Card[] = [];
  let id = 0;

  selectedEmojis.forEach((emoji) => {
    // Add two cards for each emoji (a pair)
    cards.push({ id: id++, value: emoji, category: selectedCategory });
    cards.push({ id: id++, value: emoji, category: selectedCategory });
  });

  // Shuffle the cards
  return shuffleArray(cards);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const difficulty = searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' || 'medium';
    const category = searchParams.get('category') || undefined;
    
    const cards = generateCards(difficulty, category);

    return NextResponse.json({
      success: true,
      data: {
        cards,
        totalCards: cards.length,
        pairs: cards.length / 2,
        difficulty,
        category: cards[0]?.category,
        availableCategories: Object.keys(cardCategories)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Generate memory cards error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate memory cards',
        message: error.message 
      },
      { status: 500 }
    );
  }
}