// API route for emoji puzzle generation
import { NextRequest, NextResponse } from 'next/server';

interface EmojiPuzzle {
  id: string;
  emojis: string;
  answer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

// Sample emoji puzzles
const emojiPuzzles: EmojiPuzzle[] = [
  {
    id: 'emoji_1',
    emojis: '🍕🇮🇹',
    answer: 'pizza',
    category: 'food',
    difficulty: 'easy',
    hint: 'Popular Italian dish'
  },
  {
    id: 'emoji_2',
    emojis: '🚗🏎️💨',
    answer: 'racing',
    category: 'sports',
    difficulty: 'medium',
    hint: 'Fast cars compete'
  },
  {
    id: 'emoji_3',
    emojis: '🌙⭐🛸👽',
    answer: 'alien',
    category: 'space',
    difficulty: 'medium',
    hint: 'Extraterrestrial being'
  },
  {
    id: 'emoji_4',
    emojis: '📚✏️🎓',
    answer: 'education',
    category: 'school',
    difficulty: 'hard',
    hint: 'Learning process'
  },
  {
    id: 'emoji_5',
    emojis: '🎵🎸🎤',
    answer: 'music',
    category: 'entertainment',
    difficulty: 'easy',
    hint: 'Sound and rhythm'
  },
  {
    id: 'emoji_6',
    emojis: '🏠🔑🚪',
    answer: 'home',
    category: 'places',
    difficulty: 'easy',
    hint: 'Where you live'
  },
  {
    id: 'emoji_7',
    emojis: '💻⌨️🖱️',
    answer: 'computer',
    category: 'technology',
    difficulty: 'medium',
    hint: 'Electronic device for processing data'
  },
  {
    id: 'emoji_8',
    emojis: '☁️⛈️🌧️',
    answer: 'storm',
    category: 'weather',
    difficulty: 'medium',
    hint: 'Violent weather condition'
  },
  {
    id: 'emoji_9',
    emojis: '🎂🎈🎁🎉',
    answer: 'birthday',
    category: 'celebration',
    difficulty: 'easy',
    hint: 'Annual celebration of birth'
  },
  {
    id: 'emoji_10',
    emojis: '🌍✈️🧳',
    answer: 'travel',
    category: 'adventure',
    difficulty: 'medium',
    hint: 'Going places'
  }
];

export async function GET(request: NextRequest) {
  try {
    // Get random puzzle
    const randomIndex = Math.floor(Math.random() * emojiPuzzles.length);
    const puzzle = emojiPuzzles[randomIndex];

    return NextResponse.json({
      success: true,
      data: puzzle
    });
  } catch (error) {
    console.error('Error fetching emoji puzzle:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch emoji puzzle' 
      },
      { status: 500 }
    );
  }
}