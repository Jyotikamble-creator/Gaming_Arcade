// Music Tiles Game Utilities
import {
  MusicTilesGameState,
  MusicTilesConfig,
  MusicTilesDifficulty,
  MusicTile,
  MusicTilesStats,
  MusicTilesScoreResult,
} from '@/types/games/music-tiles';

// Difficulty configurations
export const DIFFICULTY_CONFIGS: Record<MusicTilesDifficulty, MusicTilesConfig> = {
  easy: {
    numLanes: 3,
    tileSpeed: 1.5,
    spawnRate: 1200,
    hitZoneStart: 80,
    hitZoneEnd: 95,
    perfectZoneStart: 85,
    perfectZoneEnd: 90,
  },
  medium: {
    numLanes: 4,
    tileSpeed: 2.5,
    spawnRate: 800,
    hitZoneStart: 80,
    hitZoneEnd: 95,
    perfectZoneStart: 86,
    perfectZoneEnd: 90,
  },
  hard: {
    numLanes: 4,
    tileSpeed: 3.5,
    spawnRate: 600,
    hitZoneStart: 80,
    hitZoneEnd: 95,
    perfectZoneStart: 87,
    perfectZoneEnd: 92,
  },
};

// In-memory storage for game sessions
const gameSessions = new Map<string, MusicTilesGameState>();
const gameConfigs = new Map<string, MusicTilesConfig>();

// Generate unique session ID
export function generateSessionId(): string {
  return `music-tiles-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create new game session
export function createGameSession(difficulty: MusicTilesDifficulty): { sessionId: string; gameState: MusicTilesGameState; config: MusicTilesConfig } {
  const sessionId = generateSessionId();
  const config = DIFFICULTY_CONFIGS[difficulty];

  const gameState: MusicTilesGameState = {
    tiles: [],
    score: 0,
    combo: 0,
    maxCombo: 0,
    hits: 0,
    misses: 0,
    perfectHits: 0,
    gameStarted: true,
    gameEnded: false,
    isPlaying: true,
    difficulty,
    timeElapsed: 0,
  };

  gameSessions.set(sessionId, gameState);
  gameConfigs.set(sessionId, config);

  return { sessionId, gameState, config };
}

// Get game session
export function getGameSession(sessionId: string): { gameState: MusicTilesGameState; config: MusicTilesConfig } | null {
  const gameState = gameSessions.get(sessionId);
  const config = gameConfigs.get(sessionId);

  if (!gameState || !config) {
    return null;
  }

  return { gameState, config };
}

// Update game session
export function updateGameSession(sessionId: string, gameState: MusicTilesGameState): void {
  gameSessions.set(sessionId, gameState);
}

// Spawn new tile
export function spawnNewTile(sessionId: string): void {
  const session = getGameSession(sessionId);
  if (!session) return;

  const { gameState, config } = session;
  const randomLane = Math.floor(Math.random() * config.numLanes);

  const newTile: MusicTile = {
    id: `tile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    lane: randomLane,
    position: 0,
    speed: config.tileSpeed,
    hit: false,
    missed: false,
  };

  const updatedTiles = [...gameState.tiles, newTile];
  const updatedGameState = { ...gameState, tiles: updatedTiles };

  updateGameSession(sessionId, updatedGameState);
}

// Update tile positions and handle game logic
export function updateGameState(sessionId: string, deltaTime: number = 16.67): MusicTilesGameState | null {
  const session = getGameSession(sessionId);
  if (!session) return null;

  const { gameState, config } = session;

  if (!gameState.isPlaying) return gameState;

  // Update tile positions
  const updatedTiles = gameState.tiles
    .map(tile => ({
      ...tile,
      position: tile.position + (tile.speed * deltaTime / 16.67), // Normalize to ~60fps
    }))
    .filter(tile => {
      // Remove tiles that went past the screen and weren't hit
      return !(tile.position > 100 && !tile.hit && !tile.missed);
    });

  // Check for missed tiles
  const missedCount = gameState.tiles.length - updatedTiles.length - gameState.tiles.filter(t => t.hit || t.missed).length;

  const newMisses = gameState.misses + missedCount;
  const newCombo = missedCount > 0 ? 0 : gameState.combo;
  const newTimeElapsed = gameState.timeElapsed + (deltaTime / 1000);

  // End game after 60 seconds
  const gameEnded = newTimeElapsed >= 60;

  const updatedGameState: MusicTilesGameState = {
    ...gameState,
    tiles: updatedTiles,
    misses: newMisses,
    combo: newCombo,
    timeElapsed: newTimeElapsed,
    isPlaying: !gameEnded,
    gameEnded,
  };

  updateGameSession(sessionId, updatedGameState);
  return updatedGameState;
}

// Handle lane press
export function handleLanePress(sessionId: string, lane: number): MusicTilesGameState | null {
  const session = getGameSession(sessionId);
  if (!session) return null;

  const { gameState, config } = session;

  if (!gameState.isPlaying) return gameState;

  // Find the first un-hit tile in this lane within hit zone
  const tilesInLane = gameState.tiles
    .filter(t => t.lane === lane && !t.hit && !t.missed && t.position >= config.hitZoneStart && t.position <= config.hitZoneEnd)
    .sort((a, b) => a.position - b.position);

  if (tilesInLane.length === 0) {
    // No tile to hit - break combo
    const updatedGameState = { ...gameState, combo: 0 };
    updateGameSession(sessionId, updatedGameState);
    return updatedGameState;
  }

  const tileToHit = tilesInLane[0];
  const isPerfect = tileToHit.position >= config.perfectZoneStart && tileToHit.position <= config.perfectZoneEnd;
  const points = isPerfect ? 100 : 50;
  const comboMultiplier = Math.floor(gameState.combo / 10) + 1;
  const totalPoints = points * comboMultiplier;

  // Mark tile as hit
  const updatedTiles = gameState.tiles.map(t =>
    t.id === tileToHit.id ? { ...t, hit: true } : t
  );

  const newCombo = gameState.combo + 1;
  const newScore = gameState.score + totalPoints;
  const newHits = gameState.hits + 1;
  const newPerfectHits = isPerfect ? gameState.perfectHits + 1 : gameState.perfectHits;

  const updatedGameState: MusicTilesGameState = {
    ...gameState,
    tiles: updatedTiles,
    score: newScore,
    combo: newCombo,
    maxCombo: Math.max(gameState.maxCombo, newCombo),
    hits: newHits,
    perfectHits: newPerfectHits,
  };

  updateGameSession(sessionId, updatedGameState);
  return updatedGameState;
}

// Calculate stats
export function calculateStats(gameState: MusicTilesGameState): MusicTilesStats {
  const accuracy = gameState.hits + gameState.misses > 0
    ? Math.round((gameState.hits / (gameState.hits + gameState.misses)) * 100)
    : 0;

  const performance = calculatePerformance(gameState);

  return {
    score: gameState.score,
    combo: gameState.combo,
    maxCombo: gameState.maxCombo,
    hits: gameState.hits,
    misses: gameState.misses,
    perfectHits: gameState.perfectHits,
    accuracy,
    performance,
  };
}

// Calculate performance grade
function calculatePerformance(state: MusicTilesGameState): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' {
  const accuracy = state.hits + state.misses > 0
    ? (state.hits / (state.hits + state.misses)) * 100
    : 0;

  if (accuracy >= 95 && state.maxCombo >= 20) return 'S';
  if (accuracy >= 90) return 'A';
  if (accuracy >= 80) return 'B';
  if (accuracy >= 70) return 'C';
  if (accuracy >= 60) return 'D';
  return 'F';
}

// Stop game session
export function stopGameSession(sessionId: string): MusicTilesGameState | null {
  const session = getGameSession(sessionId);
  if (!session) return null;

  const updatedGameState: MusicTilesGameState = {
    ...session.gameState,
    isPlaying: false,
    gameEnded: true,
  };

  updateGameSession(sessionId, updatedGameState);
  return updatedGameState;
}

// Reset game session
export function resetGameSession(sessionId: string): { gameState: MusicTilesGameState; config: MusicTilesConfig } | null {
  const session = getGameSession(sessionId);
  if (!session) return null;

  const { difficulty } = session.gameState;
  const config = DIFFICULTY_CONFIGS[difficulty];

  const gameState: MusicTilesGameState = {
    tiles: [],
    score: 0,
    combo: 0,
    maxCombo: 0,
    hits: 0,
    misses: 0,
    perfectHits: 0,
    gameStarted: false,
    gameEnded: false,
    isPlaying: false,
    difficulty,
    timeElapsed: 0,
  };

  gameSessions.set(sessionId, gameState);
  gameConfigs.set(sessionId, config);

  return { gameState, config };
}

// Clean up old sessions (optional utility)
export function cleanupOldSessions(maxAge: number = 3600000): void { // 1 hour default
  const now = Date.now();
  for (const [sessionId, gameState] of gameSessions.entries()) {
    if (now - parseInt(sessionId.split('-')[2]) > maxAge) {
      gameSessions.delete(sessionId);
      gameConfigs.delete(sessionId);
    }
  }
}

// Get all sessions (for debugging/admin purposes)
export function getAllSessions(): Array<{ sessionId: string; gameState: MusicTilesGameState; config: MusicTilesConfig }> {
  const sessions = [];
  for (const [sessionId, gameState] of gameSessions.entries()) {
    const config = gameConfigs.get(sessionId);
    if (config) {
      sessions.push({ sessionId, gameState, config });
    }
  }
  return sessions;
}