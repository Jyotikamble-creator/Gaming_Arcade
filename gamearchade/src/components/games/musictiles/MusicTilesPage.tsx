// Music Tiles Page Component
'use client';

import React from 'react';
import { useMusicTiles } from '@/hooks/useMusicTiles';
import { MusicTilesDifficulty } from '@/types/games/music-tiles';
import MusicTilesGame from './MusicTilesGame';
import MusicTilesStats from './MusicTilesStats';

const TIME_LIMIT = 60; // seconds

export default function MusicTilesPage() {
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
  };

  const handleRestart = () => {
    resetGame();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ {error}</div>
          <button
            onClick={handleRestart}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Start screen
  if (!gameState.gameStarted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🎵 Music Tiles</h1>
          <p className="text-white/70 text-lg">
            Tap the tiles when they reach the hit zone!
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose Difficulty</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => handleStart('easy')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
            >
              <div className="text-2xl mb-2">🟢</div>
              <div className="text-xl">Easy</div>
              <div className="text-sm opacity-80 mt-2">3 Lanes • Slow</div>
            </button>

            <button
              onClick={() => handleStart('medium')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-6 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
            >
              <div className="text-2xl mb-2">🟡</div>
              <div className="text-xl">Medium</div>
              <div className="text-sm opacity-80 mt-2">4 Lanes • Normal</div>
            </button>

            <button
              onClick={() => handleStart('hard')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
            >
              <div className="text-2xl mb-2">🔴</div>
              <div className="text-xl">Hard</div>
              <div className="text-sm opacity-80 mt-2">4 Lanes • Fast</div>
            </button>
          </div>

          <div className="bg-white/5 p-6 rounded-lg">
            <h3 className="font-semibold text-white mb-3">📖 How to Play:</h3>
            <ul className="text-sm text-white/70 space-y-2">
              <li>• Click or tap the lanes when tiles reach the <span className="text-blue-400">blue hit zone</span></li>
              <li>• Hit tiles in the <span className="text-yellow-400">yellow perfect zone</span> for bonus points</li>
              <li>• Build combos by hitting consecutive tiles without missing</li>
              <li>• Higher combos multiply your score</li>
              <li>• Game lasts 60 seconds - get the highest score!</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Game over screen
  if (gameState.gameEnded) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🎵 Music Tiles</h1>
          <p className="text-white/70 text-lg">Game Over!</p>
        </div>

        <MusicTilesStats
          stats={stats}
          timeElapsed={gameState.timeElapsed}
          timeLimit={TIME_LIMIT}
        />

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center">
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

          <div className="grid grid-cols-2 gap-4 mb-6 text-center">
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="text-sm text-gray-400">Max Combo</div>
              <div className="text-2xl font-bold text-yellow-400">{stats.maxCombo}x</div>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <div className="text-sm text-gray-400">Accuracy</div>
              <div className="text-2xl font-bold text-green-400">{stats.accuracy}%</div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleRestart}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing screen
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold text-white mb-2">🎵 Music Tiles</h1>
        <p className="text-white/70">
          {gameState.difficulty.toUpperCase()} Mode • Click the lanes to hit tiles!
        </p>
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
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
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
    </div>
  );
}
