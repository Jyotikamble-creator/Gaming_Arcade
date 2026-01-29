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