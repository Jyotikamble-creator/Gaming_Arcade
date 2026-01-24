// Type definitions for Score and Leaderboard system
import { Types } from 'mongoose';

// Score document structure
export interface IScore {
  _id: Types.ObjectId;
  game: string;
  user?: Types.ObjectId;
  playerName: string;
  score: number;
  meta: Record<string, any>;
  createdAt: Date;
}

// Score creation request
export interface CreateScoreRequest {
  game: string;
  player?: string;
  score: number;
  meta?: Record<string, any>;
}

// Leaderboard query parameters
export interface LeaderboardQuery {
  game?: string;
  limit?: number;
}

// Leaderboard entry
export interface LeaderboardEntry {
  _id: string;
  game: string;
  playerName: string;
  score: number;
  meta: Record<string, any>;
  createdAt: Date;
  rank?: number;
}

// Score response
export interface ScoreResponse {
  ok: boolean;
  score: IScore;
}

// Leaderboard response
export interface LeaderboardResponse {
  ok: boolean;
  data: LeaderboardEntry[];
}

// Error response
export interface ErrorResponse {
  ok: boolean;
  error: string;
}

// Game statistics
export interface GameStats {
  game: string;
  totalPlayers: number;
  totalGames: number;
  highestScore: number;
  averageScore: number;
  latestScores: LeaderboardEntry[];
}

// Player statistics
export interface PlayerStats {
  playerName: string;
  totalGames: number;
  highestScore: number;
  averageScore: number;
  gamesPlayed: {
    [game: string]: {
      count: number;
      bestScore: number;
      averageScore: number;
    };
  };
}

// Score filter options
export interface ScoreFilterOptions {
  game?: string;
  playerName?: string;
  minScore?: number;
  maxScore?: number;
  startDate?: Date;
  endDate?: Date;
}

// Pagination options
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'score' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
