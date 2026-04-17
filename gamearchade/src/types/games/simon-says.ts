// Simon Says game type definitions
export type SimonSaysDifficulty = 'easy' | 'medium' | 'hard';

export interface SimonSaysDifficultyConfig {
  label: string;
  emoji: string;
  description: string;
  sequenceSpeed: number; // Time between color flashes in ms
  colorFlashDuration: number; // How long each color is highlighted in ms
  initialSequenceLength: number; // Starting length of sequence
  maxRounds: number; // Maximum rounds to win
  scoreMultiplier: number; // Score multiplier for difficulty
}

export interface SimonSaysGameState {
  colors: string[];
  sequence: string[];
  playerSequence: string[];
  round: number;
  isShowingSequence: boolean;
  activeColor: string | null;
  gameOver: boolean;
  gameWon: boolean;
  isLoading: boolean;
  difficulty: SimonSaysDifficulty | null;
  gameStarted: boolean;
}

export const DIFFICULTY_CONFIG: Record<SimonSaysDifficulty, SimonSaysDifficultyConfig> = {
  easy: {
    label: 'Easy',
    emoji: '🌱',
    description: 'Slow sequences with longer pauses',
    sequenceSpeed: 800, // Time between flashes
    colorFlashDuration: 600, // How long each flash lasts
    initialSequenceLength: 1,
    maxRounds: 8,
    scoreMultiplier: 1
  },
  medium: {
    label: 'Medium',
    emoji: '⚡',
    description: 'Moderate speed and timing',
    sequenceSpeed: 600,
    colorFlashDuration: 500,
    initialSequenceLength: 1,
    maxRounds: 10,
    scoreMultiplier: 1.5
  },
  hard: {
    label: 'Hard',
    emoji: '🔥',
    description: 'Fast sequences with tight timing',
    sequenceSpeed: 400,
    colorFlashDuration: 400,
    initialSequenceLength: 2,
    maxRounds: 12,
    scoreMultiplier: 2
  }
} as const;

export interface SimonSaysScoreSubmission {
  game: 'simon-says';
  score: number;
  playerName?: string;
  meta?: {
    roundsCompleted: number;
    difficulty?: SimonSaysDifficulty;
  };
}

export const SIMON_SAYS_CONSTANTS = {
  DEFAULT_COLORS: ['red', 'blue', 'green', 'yellow'],
  WIN_BONUS: 50,
  SCORE_PER_ROUND: 10
} as const;

export default SimonSaysGameState;
