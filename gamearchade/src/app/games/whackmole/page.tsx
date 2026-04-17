"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useWhackMole } from '@/hooks/games/useWhackMole';
import { WhackGameSettings, WhackDifficulty, DIFFICULTY_CONFIG } from '@/types/games/whack-a-mole';
import DashboardLayout from '@/components/shared/DashboardLayout'
import Leaderboard from '@/components/leaderboard/Leaderboard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

// Animated emoji component - only renders on client to avoid hydration issues
const AnimatedEmojis = () => {
  const [emojis, setEmojis] = useState<Array<{
    left: string;
    top: string;
    delay: string;
    duration: string;
  }>>([]);

  useEffect(() => {
    // Generate random positions only on client side
    setEmojis([...Array(50)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${2 + Math.random() * 2}s`
    })));
  }, []);

  if (emojis.length === 0) return null;

  return (
    <>
      {emojis.map((emoji, i) => (
        <div
          key={i}
          className="absolute animate-pulse"
          style={{
            left: emoji.left,
            top: emoji.top,
            animationDelay: emoji.delay,
            animationDuration: emoji.duration
          }}
        >
          🐭
        </div>
      ))}
    </>
  );
};

// Dynamic imports for better performance
const WhackMoleStats = dynamic(() => import('@/components/games/whackmole/WhackMoleStats'), {
  loading: () => <div className="animate-pulse bg-gray-700/50 h-20 rounded-lg"></div>
});

const WhackMoleGrid = dynamic(() => import('@/components/games/whackmole/WhackMoleGrid'), {
  loading: () => <div className="animate-pulse bg-gray-700/50 h-96 rounded-lg"></div>
});

const WhackMoleGameOverModal = dynamic(() => import('@/components/games/whackmole/WhackMoleGameOverModal'), {
  ssr: false
});

export default function WhackMolePage() {
  const { user } = useAuth();
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<WhackDifficulty>('normal');
  const [settings, setSettings] = useState<WhackGameSettings>({
    soundEnabled: true,
    vibrationEnabled: true,
    showReactionTime: false,
    showStreakCounter: true,
    showComboMultiplier: true,
    highlightMoles: false,
    difficulty: 'normal',
    gameMode: 'classic',
    customDuration: 60,
    customGridSize: 9,
    enablePowerUps: false,
    enableSpecialMoles: false,
    autoRestart: false
  });
  const [gameKey, setGameKey] = useState<number>(0);
  
  const {
    gameState,
    score,
    timeLeft,
    molesHit,
    totalMoles,
    accuracy,
    isGameStarted,
    isGameOver,
    startGame,
    whackMole,
    resetGame
  } = useWhackMole();

  const handleDifficultySelect = (difficulty: WhackDifficulty): void => {
    setSelectedDifficulty(difficulty);
    setGameStarted(true);
    setSettings(prev => ({
      ...prev,
      difficulty,
      customGridSize: DIFFICULTY_CONFIG[difficulty].gridSize as 9 | 16,
      customDuration: DIFFICULTY_CONFIG[difficulty].duration
    }));
  };

  const handleRestart = (): void => {
    resetGame();
    setGameKey(prev => prev + 1);
  };

  const handleSettingsChange = (newSettings: WhackGameSettings): void => {
    setSettings(newSettings);
    resetGame();
    setGameKey(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <AnimatedEmojis />
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Difficulty Selection Screen */}
          {!gameStarted ? (
            <>
              {/* Title */}
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
                  🔨 Whack-a-Mole Challenge
                </h1>
                <p className="text-gray-300 text-xl mb-4">
                  Test your reflexes and accuracy!
                </p>
                <p className="text-gray-400 text-lg">
                  Select a difficulty level to begin
                </p>
              </div>

              {/* Difficulty Cards */}
              <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
                {/* Easy */}
                <button
                  onClick={() => handleDifficultySelect('easy')}
                  className="group relative overflow-hidden rounded-xl bg-linear-to-br from-green-500/20 to-emerald-600/20 border border-green-500/50 p-8 hover:border-green-400 hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">🌱</div>
                    <h3 className="text-3xl font-bold text-green-400 mb-3">Easy</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 3x3 Grid</li>
                      <li>✓ {DIFFICULTY_CONFIG.easy.basePoints} Points per hit</li>
                      <li>✓ {DIFFICULTY_CONFIG.easy.duration}s duration</li>
                    </ul>
                  </div>
                </button>

                {/* Normal */}
                <button
                  onClick={() => handleDifficultySelect('normal')}
                  className="group relative overflow-hidden rounded-xl bg-linear-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/50 p-8 hover:border-yellow-400 hover:from-yellow-500/30 hover:to-orange-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">⚡</div>
                    <h3 className="text-3xl font-bold text-yellow-400 mb-3">Normal</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 3x3 Grid</li>
                      <li>✓ {DIFFICULTY_CONFIG.normal.basePoints} Points per hit</li>
                      <li>✓ {DIFFICULTY_CONFIG.normal.duration}s duration</li>
                    </ul>
                  </div>
                </button>

                {/* Hard */}
                <button
                  onClick={() => handleDifficultySelect('hard')}
                  className="group relative overflow-hidden rounded-xl bg-linear-to-br from-red-500/20 to-pink-600/20 border border-red-500/50 p-8 hover:border-red-400 hover:from-red-500/30 hover:to-pink-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">🔥</div>
                    <h3 className="text-3xl font-bold text-red-400 mb-3">Hard</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 4x4 Grid</li>
                      <li>✓ {DIFFICULTY_CONFIG.hard.basePoints} Points per hit</li>
                      <li>✓ {DIFFICULTY_CONFIG.hard.duration}s duration</li>
                    </ul>
                  </div>
                </button>
              </div>

              {/* Instructions */}
              <div className="max-w-2xl mx-auto bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-white font-semibold mb-4 text-center">How to Play</h3>
                <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                  <div className="space-y-2">
                    <p>🔨 Click on moles when they appear</p>
                    <p>⏱️ Race against the clock</p>
                  </div>
                  <div className="space-y-2">
                    <p>❌ Avoid clicking empty holes</p>
                    <p>🎯 Aim for high accuracy</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Game Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-linear-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
                  🔨 Whack-a-Mole
                </h1>
                <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                  Difficulty: <span className="text-white font-semibold capitalize">{selectedDifficulty}</span>
                </p>
              </div>
              {/* Game Stats */}
              <WhackMoleStats
            key={`stats-${gameKey}`}
            score={score}
            timeLeft={timeLeft}
            gameStatus={isGameStarted ? 'playing' : (isGameOver ? 'gameOver' : 'ready')}
            accuracy={accuracy}
            molesHit={molesHit}
            totalMoles={totalMoles}
          />

          {/* Start Game Button */}
          {!isGameStarted && gameStarted && !isGameOver && (
            <div className="text-center mb-8">
              <button
                onClick={() => startGame()}
                className="px-8 py-4 bg-linear-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-xl rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🔨 Start Whacking!
              </button>
            </div>
          )}

          {/* Game Grid */}
          {isGameStarted && gameStarted && !isGameOver && (
            <div className="flex justify-center mb-8">
              <WhackMoleGrid
                key={`grid-${gameKey}`}
                grid={gameState.grid}
                active={gameState.activeMole}
                gameStarted={isGameStarted}
                gameEnded={isGameOver}
                onWhack={whackMole}
              />
            </div>
          )}

          {/* Instructions */}
          {!gameStarted && (
            <div className="max-w-2xl mx-auto bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4 text-center">How to Play</h3>
              <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400 text-xl">👆</span>
                    <span>Click on moles when they appear</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-red-400 text-xl">❌</span>
                    <span>Avoid clicking empty holes</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-400 text-xl">⏱️</span>
                    <span>Race against the clock</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-yellow-400 text-xl">🎯</span>
                    <span>Aim for high accuracy</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Game Over Modal */}
          {isGameOver && (
            <WhackMoleGameOverModal
              score={score}
              accuracy={accuracy}
              molesHit={molesHit}
              totalMoles={totalMoles}
              onRestart={handleRestart}
            />
          )}

          {/* Leaderboard */}
          <div className="mt-12">
            <Leaderboard gameType="whack-a-mole" />
          </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}