// Custom hook for Music Tiles game logic
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MusicTilesGameState,
  MusicTilesConfig,
  MusicTilesHookReturn,
  MusicTilesDifficulty,
  MusicTile,
  MusicTilesStats,
} from '@/types/games/music-tiles';

const DIFFICULTY_CONFIGS: Record<MusicTilesDifficulty, MusicTilesConfig> = {
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

export function useMusicTiles(): MusicTilesHookReturn {
  const [gameState, setGameState] = useState<MusicTilesGameState>({
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
    difficulty: 'medium',
    timeElapsed: 0,
  });

  const [config, setConfig] = useState<MusicTilesConfig>(DIFFICULTY_CONFIGS.medium);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const animationFrameRef = useRef<number | null>(null);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const tileIdCounter = useRef(0);

  // Calculate stats
  const stats: MusicTilesStats = {
    score: gameState.score,
    combo: gameState.combo,
    maxCombo: gameState.maxCombo,
    hits: gameState.hits,
    misses: gameState.misses,
    perfectHits: gameState.perfectHits,
    accuracy: gameState.hits + gameState.misses > 0 
      ? Math.round((gameState.hits / (gameState.hits + gameState.misses)) * 100) 
      : 0,
    performance: calculatePerformance(gameState),
  };

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

  // Start game
  const startGame = useCallback((difficulty: MusicTilesDifficulty) => {
    const newConfig = DIFFICULTY_CONFIGS[difficulty];
    setConfig(newConfig);
    setGameState({
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
    });
    setError(null);
    startTimeRef.current = Date.now();

    // Start spawning tiles
    spawnIntervalRef.current = setInterval(() => {
      spawnNewTile(newConfig);
    }, newConfig.spawnRate);

    // Start game loop
    requestAnimationFrame(gameLoop);
  }, []);

  // Spawn new tile
  const spawnNewTile = (cfg: MusicTilesConfig) => {
    const randomLane = Math.floor(Math.random() * cfg.numLanes);
    const newTile: MusicTile = {
      id: `tile-${tileIdCounter.current++}`,
      lane: randomLane,
      position: 0,
      speed: cfg.tileSpeed,
      hit: false,
      missed: false,
    };

    setGameState(prev => ({
      ...prev,
      tiles: [...prev.tiles, newTile],
    }));
  };

  // Game loop
  const gameLoop = () => {
    setGameState(prev => {
      if (!prev.isPlaying) return prev;

      // Update tile positions
      const updatedTiles = prev.tiles
        .map(tile => ({
          ...tile,
          position: tile.position + tile.speed,
        }))
        .filter(tile => {
          // Remove tiles that went past the screen
          if (tile.position > 100 && !tile.hit && !tile.missed) {
            // Tile was missed
            return false; // Remove tile
          }
          // Keep tiles that are on screen or already hit
          return tile.position <= 100 || tile.hit;
        });

      // Check for missed tiles
      const missedCount = prev.tiles.length - updatedTiles.length - prev.tiles.filter(t => t.hit || t.missed).length;

      const newMisses = prev.misses + missedCount;
      const newCombo = missedCount > 0 ? 0 : prev.combo;

      // Update time elapsed
      const timeElapsed = startTimeRef.current 
        ? Math.floor((Date.now() - startTimeRef.current) / 1000) 
        : prev.timeElapsed;

      // End game after 60 seconds
      if (timeElapsed >= 60) {
        stopGame();
        return {
          ...prev,
          tiles: updatedTiles,
          misses: newMisses,
          combo: newCombo,
          isPlaying: false,
          gameEnded: true,
          timeElapsed,
        };
      }

      return {
        ...prev,
        tiles: updatedTiles,
        misses: newMisses,
        combo: newCombo,
        timeElapsed,
      };
    });

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  // Handle lane press
  const handleLanePress = useCallback((lane: number) => {
    if (!gameState.isPlaying) return;

    setGameState(prev => {
      // Find the first un-hit tile in this lane within hit zone
      const tilesInLane = prev.tiles
        .filter(t => t.lane === lane && !t.hit && !t.missed && t.position >= config.hitZoneStart && t.position <= config.hitZoneEnd)
        .sort((a, b) => a.position - b.position);

      if (tilesInLane.length === 0) {
        // No tile to hit - break combo
        return {
          ...prev,
          combo: 0,
        };
      }

      const tileToHit = tilesInLane[0];
      const isPerfect = tileToHit.position >= config.perfectZoneStart && tileToHit.position <= config.perfectZoneEnd;
      const points = isPerfect ? 100 : 50;
      const comboMultiplier = Math.floor(prev.combo / 10) + 1;
      const totalPoints = points * comboMultiplier;

      // Mark tile as hit
      const updatedTiles = prev.tiles.map(t => 
        t.id === tileToHit.id ? { ...t, hit: true } : t
      );

      const newCombo = prev.combo + 1;
      const newScore = prev.score + totalPoints;
      const newHits = prev.hits + 1;
      const newPerfectHits = isPerfect ? prev.perfectHits + 1 : prev.perfectHits;

      return {
        ...prev,
        tiles: updatedTiles,
        score: newScore,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        hits: newHits,
        perfectHits: newPerfectHits,
      };
    });
  }, [gameState.isPlaying, config]);

  // Stop game
  const stopGame = useCallback(() => {
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      gameEnded: true,
    }));
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    stopGame();
    setGameState({
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
      difficulty: 'medium',
      timeElapsed: 0,
    });
    tileIdCounter.current = 0;
  }, [stopGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return {
    gameState,
    stats,
    config,
    startGame,
    stopGame,
    resetGame,
    handleLanePress,
    isLoading,
    error,
  };
}
