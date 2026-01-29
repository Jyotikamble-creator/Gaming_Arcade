// TypeScript types for Typing Test game

export interface TypingTestStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  totalChars: number;
  elapsedTime: number;
}

export interface TypingPassage {
  text: string;
  id?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  wordCount?: number;
}

export interface TypingTestState {
  text: string;
  input: string;
  startTime: number | null;
  done: boolean;
  isLoading: boolean;
  wpm: number;
  accuracy: number;
}

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
}

export interface TypingAreaProps {
  sourceText: string;
  typedInput: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onRefresh?: () => void;
  disabled: boolean;
}

export interface TypedTextProps {
  sourceText: string;
  typedInput: string;
}

export interface CompletionModalProps {
  wpm: number;
  accuracy: number;
  onRestart: () => void;
}

export interface TypingTestAPI {
  fetchPassage: () => Promise<TypingPassage>;
  submitScore: (score: number, metadata: TypingTestStats) => Promise<void>;
}

export interface CharacterStyle {
  isCorrect: boolean;
  isIncorrect: boolean;
  isCurrent: boolean;
  isUntyped: boolean;
}

export interface TypingTestHookReturn {
  text: string;
  input: string;
  wpm: number;
  accuracy: number;
  isLoading: boolean;
  startTime: number | null;
  done: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  resetTest: () => void;
  stats: TypingTestStats;
}

// Enhanced types for gamearchade
export interface TypingTestSession {
  sessionId: string;
  userId?: string;
  passage: TypingPassage;
  startTime: Date;
  endTime?: Date;
  input: string;
  stats: TypingTestStats;
  completed: boolean;
  errors: TypingTestError[];
}

export interface TypingTestError {
  position: number;
  expected: string;
  typed: string;
  timestamp: Date;
}

export interface TypingTestResult {
  wpm: number;
  accuracy: number;
  score: number;
  rating: TypingPerformanceRating;
  achievements: string[];
  session: TypingTestSession;
}

export interface TypingPerformanceRating {
  text: string;
  color: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
}

export interface TypingTestConfiguration {
  minWordsForScore: number;
  wordsPerMinuteDivisor: number;
  accuracyPrecision: number;
  timeLimit?: number;
  showLiveStats: boolean;
}