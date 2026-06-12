// Music Tiles Page Component
'use client';

import React, { useState } from 'react';
import { useMusicTiles } from '@/hooks/games/useMusicTiles';
import { MusicTilesDifficulty } from '@/types/games/music-tiles';
import MusicTilesGame from './MusicTilesGame';
import MusicTilesStats from './MusicTilesStats';
import AnimatedBackground from '@/components/AnimatedBackground';

const TIME_LIMIT = 60; // seconds

export default function MusicTilesPage() {
  const [gameStarted, setGameStarted] = useState(false);
  const {
    gameState,
    stats,
    config,
    startGame,
    stopGame,
    resetGame,
    handleLanePress,
    isLoading,
    error,
  } = useMusicTiles();

  const handleStart = (difficulty: MusicTilesDifficulty) => {
    startGame(difficulty);
    setGameStarted(true);
  };

  const handleRestart = () => {
    resetGame();
    setGameStarted(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-900 to-purple-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ {error}</div>
          <button
            onClick={handleRestart}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Difficulty selection screen
  if (!gameStarted) {
    return (
      <div className={`min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-pink-900 relative overflow-hidden flex items-center justify-center`}>
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Title */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                🎵 Music Tiles
              </h1>
              <p className="text-gray-300 text-xl mb-4">
                Tap the tiles to the beat!
              </p>
              <p className="text-gray-400 text-lg">
                Select a difficulty level to begin
              </p>
            </div>

            {/* Difficulty Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Easy */}
              <button
                onClick={() => handleStart('easy')}
                className="group relative overflow-hidden rounded-xl bg-linear-to-br from-green-500/20 to-emerald-600/20 border border-green-500/50 p-8 hover:border-green-400 hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">🌱</div>
                  <h3 className="text-3xl font-bold text-green-400 mb-3">Easy</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ 3 Lanes</li>
                    <li>✓ Slower Tiles</li>
                    <li>✓ Perfect for Beginners</li>
                  </ul>
                </div>
              </button>

              {/* Medium */}
              <button
                onClick={() => handleStart('medium')}
                className="group relative overflow-hidden rounded-xl bg-linear-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/50 p-8 hover:border-yellow-400 hover:from-yellow-500/30 hover:to-orange-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">⚡</div>
                  <h3 className="text-3xl font-bold text-yellow-400 mb-3">Medium</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ 4 Lanes</li>
                    <li>✓ Normal Speed</li>
                    <li>✓ Balanced Challenge</li>
                  </ul>
                </div>
              </button>

              {/* Hard */}
              <button
                onClick={() => handleStart('hard')}
                className="group relative overflow-hidden rounded-xl bg-linear-to-br from-red-500/20 to-pink-600/20 border border-red-500/50 p-8 hover:border-red-400 hover:from-red-500/30 hover:to-pink-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">🔥</div>
                  <h3 className="text-3xl font-bold text-red-400 mb-3">Hard</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ 4 Lanes</li>
                    <li>✓ Faster Tiles</li>
                    <li>✓ Expert Level</li>
                  </ul>
                </div>
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4 text-center text-lg">How to Play</h3>
              <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                <div className="space-y-2">
                  <p>🎯 Click tiles when they reach the hit zone</p>
                  <p>✅ Perfect hits in the yellow zone earn bonus points</p>
                </div>
                <div className="space-y-2">
                  <p>🔥 Build combos by hitting consecutive tiles</p>
                  <p>⏱️ 60 seconds to get the highest score!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game over screen
  if (gameState.gameEnded) {
    return (
      <div className={`min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-pink-900 relative overflow-hidden`}>
        <AnimatedBackground />
        
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-2">🎵 Music Tiles</h1>
            <p className="text-white/70 text-lg">Game Over!</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl mb-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">
                {stats.performance === 'S' && '🏆'}
                {stats.performance === 'A' && '🥇'}
                {stats.performance === 'B' && '🥈'}
                {stats.performance === 'C' && '🥉'}
                {['D', 'F'].includes(stats.performance) && '💪'}
              </div>

              <div className="text-4xl font-bold text-white mb-2">
                Final Score: {stats.score.toLocaleString()}
              </div>

              <div className="text-2xl text-yellow-400 mb-6">
                Grade: {stats.performance}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Max Combo</div>
                <div className="text-2xl font-bold text-yellow-400">{stats.maxCombo}x</div>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Perfect Hits</div>
                <div className="text-2xl font-bold text-green-400">{stats.perfectHits}</div>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Total Hits</div>
                <div className="text-2xl font-bold text-blue-400">{stats.hits}</div>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Accuracy</div>
                <div className="text-2xl font-bold text-cyan-400">{stats.accuracy}%</div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleRestart}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Playing screen
  return (
    <div className={`min-h-screen bg-linear-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden`}>
      <AnimatedBackground />
      
      <main className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Game Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🎵 Music Tiles</h1>
          <p className="text-white/70">{gameState.difficulty.toUpperCase()} Mode • Click the lanes to hit tiles!</p>
        </div>

        <MusicTilesStats
          stats={stats}
          timeElapsed={gameState.timeElapsed}
          timeLimit={TIME_LIMIT}
        />

        <MusicTilesGame
          tiles={gameState.tiles}
          config={config}
          onLanePress={handleLanePress}
          isPlaying={gameState.isPlaying}
        />

        <div className="mt-4 text-center">
          <button
            onClick={stopGame}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
          >
            End Game
          </button>
        </div>

        {gameState.combo >= 10 && (
          <div className="text-center mt-4 animate-pulse">
            <span className="text-2xl font-bold text-yellow-400">
              🔥 {gameState.combo}x COMBO! 🔥
            </span>
          </div>
        )}
      </main>
    </div>
  );
}
