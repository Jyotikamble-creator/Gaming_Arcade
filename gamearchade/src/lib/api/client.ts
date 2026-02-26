// API client for interacting with the backend server (Next.js version)
// Uses Axios for HTTP requests and includes interceptors for auth token management and logging

import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
// Fallback type definitions for when type files are missing
type ApiResponse<T = any> = {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
};

type ApiErrorResponse = {
  success: false;
  error: string;
  status?: number;
  details?: any;
};

type GameApiEndpoints = Record<string, any>;
type LeaderboardParams = { game: string; limit?: number; };
type ScoreSubmission = { game: string; player?: string; score: number; meta?: Record<string, any>; };
type WordDefinition = any;
type WordSearchQuery = any;
type MathQuestion = any;
type MathQuizSession = any;
type EmojiPuzzle = any;
type EmojiGameSession = any;
type MemoryGameSession = any;
type MemoryCard = any;

// Logger utility - adapting to Next.js structure
interface LogContext {
  [key: string]: any;
}

const LogTags = {
 TOKEN_MANAGER: "TOKEN_MANAGER",
  WORD_GUESS: "WORD_GUESS",
  MEMORY_CARD: "MEMORY_CARD",
  MATH_QUIZ: "MATH_QUIZ",
  TYPING_TEST: "TYPING_TEST",
  WORD_SCRAMBLE: "WORD_SCRAMBLE",
  QUIZ: "QUIZ",
  EMOJI_GUESS: "EMOJI_GUESS",
  WHACK_MOLE: "WHACK_MOLE",
  SIMON_SAYS: "SIMON_SAYS",
  SAVE_SCORE: "SAVE_SCORE",
  LEADERBOARD: "LEADERBOARD"
} as const;

type LogTag = typeof LogTags[keyof typeof LogTags];

// Simple logger for client-side (can be enhanced with the full logger system)
const logger = {
  debug: (message: string, context: LogContext, tag: LogTag) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[${tag}] ${message}`, context);
    }
  },
  info: (message: string, context: LogContext, tag: LogTag) => {
    console.info(`[${tag}] ${message}`, context);
  },
  error: (message: string, error: Error | unknown, context: LogContext, tag: LogTag) => {
    console.error(`[${tag}] ${message}`, error, context);
  }
};

// Default backend URL: point to Next.js API routes or external server
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 
                    (typeof window !== 'undefined' ? '/api' : 'http://localhost:3000/api');

// Create Axios instance
const API: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Helper function to get token from localStorage (client-side only)
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem("token");
  } catch (e) {
    logger.error("Error accessing localStorage", e, {}, LogTags.TOKEN_MANAGER);
    return null;
  }
};

// Attach auth token from localStorage if present
API.interceptors.request.use((config) => {
  try {
    const token = getAuthToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
      logger.debug(
        "Auth token attached to request",
        { url: config.url },
        LogTags.TOKEN_MANAGER
      );
    }
  } catch (e) {
    logger.error("Error attaching auth token", e, {}, LogTags.TOKEN_MANAGER);
  }
  return config;
});

// Response interceptor for logging and error handling
API.interceptors.response.use(
  (response: AxiosResponse) => {
    logger.debug(
      "API response received",
      { url: response.config.url, status: response.status },
      LogTags.TOKEN_MANAGER
    );
    return response;
  },
  (error: AxiosError) => {
    logger.error(
      "API request failed",
      error,
      { url: error.config?.url, status: error.response?.status },
      LogTags.TOKEN_MANAGER
    );
    return Promise.reject(error);
  }
);

// API Client class
export class GameApiClient {
  private api: AxiosInstance;
  constructor() {
    this.api = API;
  }

  // Word Game APIs
  async fetchRandomWord(): Promise<ApiResponse<WordDefinition>> {
    try {
      logger.debug("Fetching random word", {}, LogTags.WORD_GUESS);

      const response = await this.api.get<WordDefinition[]>("/word");
      const words = response.data || [];
      const randomWord = words.length
        ? words[Math.floor(Math.random() * words.length)]
        : { 
            id: "default", 
            word: "APPLE", 
            description: "A fruit",
            category: "General" as const,
            difficulty: "beginner" as const,
            language: "english" as const,
            examples: [],
            synonyms: [],
            antonyms: [],
            tags: [],
            length: 5,
            frequency: 50,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: "active" as const,
            metadata: {
              usageCount: 0,
              difficulty_score: 1,
              popularity_score: 50,
              learning_weight: 1.0,
              source: "default",
              verified: true,
              context_hints: []
            }
          };

      logger.debug(
        "Random word fetched",
        { word: randomWord.word },
        LogTags.WORD_GUESS
      );

      return { 
        success: true, 
        data: randomWord 
      };
    } catch (error) {
      logger.error("Failed to fetch random word", error, {}, LogTags.WORD_GUESS);
      throw this.handleApiError(error);
    }
  }

  async searchWords(query: WordSearchQuery): Promise<ApiResponse<WordDefinition[]>> {
    try {
      const response = await this.api.get<WordDefinition[]>("/word/search", { 
        params: query 
      });
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      logger.error("Failed to search words", error, query, LogTags.WORD_GUESS);
      throw this.handleApiError(error);
    }
  }

  // Memory Game APIs
  async startMemoryGame(): Promise<ApiResponse<MemoryGameSession>> {
    try {
      logger.debug("Starting memory game", {}, LogTags.MEMORY_CARD);
      const response = await this.api.post<MemoryGameSession>("/memory/start");
      
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      logger.error("Failed to start memory game", error, {}, LogTags.MEMORY_CARD);
      throw this.handleApiError(error);
    }
  }

  // Math Quiz APIs
  async fetchMathQuestions(): Promise<ApiResponse<MathQuestion[]>> {
    try {
      logger.debug("Fetching math questions", {}, LogTags.MATH_QUIZ);
      const response = await this.api.get<MathQuestion[]>("/math/questions");
      
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      logger.error("Failed to fetch math questions", error, {}, LogTags.MATH_QUIZ);
      throw this.handleApiError(error);
    }
  }

  // Typing Test APIs
  async fetchTypingPassage(): Promise<ApiResponse<{ passage: string; difficulty: string }>> {
    try {
      logger.debug("Fetching typing passage", {}, LogTags.TYPING_TEST);
      const response = await this.api.get<{ passage: string; difficulty: string }>("/typing/passage");
      
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      logger.error("Failed to fetch typing passage", error, {}, LogTags.TYPING_TEST);
      throw this.handleApiError(error);
    }
  }

  // Word Scramble APIs
  async fetchScrambleWords(): Promise<ApiResponse<WordDefinition[]>> {
    try {
      logger.debug("Fetching scramble words", {}, LogTags.WORD_SCRAMBLE);
      const response = await this.api.get<WordDefinition[]>("/word-scramble/words");
      
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      logger.error("Failed to fetch scramble words", error, {}, LogTags.WORD_SCRAMBLE);
      throw this.handleApiError(error);
    }
  }

  // Quiz APIs
  async fetchQuizQuestions(): Promise<ApiResponse<any[]>> {
    try {
      logger.debug("Fetching quiz questions", {}, LogTags.QUIZ);
      const response = await this.api.get<any[]>("/quiz/questions");
      
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      logger.error("Failed to fetch quiz questions", error, {}, LogTags.QUIZ);
      throw this.handleApiError(error);
    }
  }

  // Emoji Game APIs
  async fetchEmojiPuzzle(): Promise<ApiResponse<EmojiPuzzle>> {
    try {
      logger.debug("Fetching emoji puzzle", {}, LogTags.EMOJI_GUESS);
      const response = await this.api.get<EmojiPuzzle>("/emoji/start");
      
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      logger.error("Failed to fetch emoji puzzle", error, {}, LogTags.EMOJI_GUESS);
      throw this.handleApiError(error);
    }
  }

  // Whack-a-mole APIs
  async startWhackGame(): Promise<ApiResponse<any>> {
    try {
      logger.debug("Starting whack-a-mole game", {}, LogTags.WHACK_MOLE);
      const response = await this.api.post<any>("/whack-a-mole/start");
      
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      logger.error("Failed to start whack-a-mole game", error, {}, LogTags.WHACK_MOLE);
      throw this.handleApiError(error);
    }
  }

  // Simon Says APIs
  async startSimonGame(): Promise<ApiResponse<any>> {
    try {
      logger.debug("Starting simon says game", {}, LogTags.SIMON_SAYS);
      const response = await this.api.post<any>("/simon/start");
      
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      logger.error("Failed to start simon says game", error, {}, LogTags.SIMON_SAYS);
      throw this.handleApiError(error);
    }
  }

  // Score Management APIs
  async submitScore(scoreData: ScoreSubmission): Promise<ApiResponse<any>> {
    try {
      logger.info("Submitting score", scoreData, LogTags.SAVE_SCORE);
      const response = await this.api.post<any>("/common/score", scoreData);
      
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      logger.error("Failed to submit score", error, scoreData, LogTags.SAVE_SCORE);
      throw this.handleApiError(error);
    }
  }

  // Leaderboard APIs
  async getLeaderboard({ game, limit = 10 }: LeaderboardParams): Promise<ApiResponse<any[]>> {
    try {
      logger.debug("Fetching leaderboard", { game, limit }, LogTags.LEADERBOARD);
      const response = await this.api.get<any[]>("/common/leaderboard", { 
        params: { game, limit } 
      });
      
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      logger.error("Failed to fetch leaderboard", error, { game, limit }, LogTags.LEADERBOARD);
      throw this.handleApiError(error);
    }
  }

  // Error handling
  private handleApiError(error: unknown): ApiErrorResponse {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
        details: error.response?.data
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

// Export singleton instance
export const gameApiClient = new GameApiClient();

// Export individual functions for backward compatibility
export const fetchRandomWord = () => gameApiClient.fetchRandomWord();
export const startMemory = () => gameApiClient.startMemoryGame();
export const fetchMathQuestions = () => gameApiClient.fetchMathQuestions();
export const fetchTypingPassage = () => gameApiClient.fetchTypingPassage();
export const fetchScramble = () => gameApiClient.fetchScrambleWords();
export const fetchQuiz = () => gameApiClient.fetchQuizQuestions();
export const fetchEmoji = () => gameApiClient.fetchEmojiPuzzle();
export const startWhack = () => gameApiClient.startWhackGame();
export const startSimon = () => gameApiClient.startSimonGame();
export const submitScore = (scoreData: ScoreSubmission) => gameApiClient.submitScore(scoreData);
export const getLeaderboard = (params: LeaderboardParams) => gameApiClient.getLeaderboard(params);

export default gameApiClient;