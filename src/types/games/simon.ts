/**
 * Simon Game Types
 * Defines interfaces for Simon Says game functionality
 */

// Available colors in the Simon game
export type SimonColor = 
  | 'red' 
  | 'blue' 
  | 'green' 
  | 'yellow' 
  | 'purple' 
  | 'orange' 
  | 'pink' 
  | 'cyan';

// Simon game session data
export interface ISimonSession {
  colors: SimonColor[];
  seed: number;
  sessionId?: string;
  startTime?: Date;
}

// Simon game state
export interface ISimonGameState {
  sequence: SimonColor[];
  currentStep: number;
  playerSequence: SimonColor[];
  isGameActive: boolean;
  level: number;
  score: number;
}

// Simon game configuration
export interface ISimonConfig {
  colors: SimonColor[];
  maxLevel?: number;
  sequenceSpeed?: number;
  enableSound?: boolean;
}

// Simon game session start request
export interface SimonStartRequest {
  difficulty?: 'easy' | 'medium' | 'hard';
  enableSound?: boolean;
}

// Simon game session response
export interface SimonStartResponse {
  colors: SimonColor[];
  seed: number;
  sessionId?: string;
  config?: ISimonConfig;
}

// Simon game move submission
export interface SimonMoveRequest {
  sessionId: string;
  color: SimonColor;
  step: number;
}

// Simon game move response
export interface SimonMoveResponse {
  success: boolean;
  isCorrect: boolean;
  nextSequence?: SimonColor[];
  gameOver?: boolean;
  finalScore?: number;
  message?: string;
}

// Simon game statistics
export interface ISimonStats {
  totalGames: number;
  averageScore: number;
  highestLevel: number;
  totalCorrectMoves: number;
  averageAccuracy: number;
  longestStreak: number;
}

export default ISimonSession;