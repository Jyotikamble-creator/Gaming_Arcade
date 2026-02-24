"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useWhackMole } from '@/hooks/useWhackMole';
import { WhackMoleSettings } from '@/types/games/whack-a-mole';
import DashboardLayout from '@/components/shared/DashboardLayout';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorComponent from '@/components/shared/ErrorComponent';

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

export default function WhackMolePage(): JSX.Element {
  const { user } = useAuth();
  const [settings, setSettings] = useState<WhackMoleSettings>({
    gridSize: 9,
    gameTime: 60,
    moleSpeed: 1000
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
    error,
    startGame,
    whackMole,
    resetGame
  } = useWhackMole(settings);

  const handleRestart = (): void => {
    resetGame();
    setGameKey(prev => prev + 1);
  };

  const handleSettingsChange = (newSettings: WhackMoleSettings): void => {
    setSettings(newSettings);
    resetGame();
    setGameKey(prev => prev + 1);
  };

  if (error) {
    return (
      <DashboardLayout>
        <ErrorComponent 
          error={error} 
          onRetry={handleRestart}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                🐭
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
              🔨 Whack-a-Mole
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Test your reflexes! Hit the moles as they pop up, but be careful not to miss!
            </p>
          </div>

          {/* Game Settings */}
          {!isGameStarted && (
            <div className="max-w-md mx-auto mb-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4 text-center">Game Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Grid Size</label>
                  <select
                    value={settings.gridSize}
                    onChange={(e) => handleSettingsChange({ 
                      ...settings, 
                      gridSize: Number(e.target.value) as 9 | 16 
                    })}
                    className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value={9}>3x3 (Easy)</option>
                    <option value={16}>4x4 (Hard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Game Time (seconds)</label>
                  <select
                    value={settings.gameTime}
                    onChange={(e) => handleSettingsChange({ 
                      ...settings, 
                      gameTime: Number(e.target.value) 
                    })}
                    className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value={30}>30 seconds</option>
                    <option value={60}>60 seconds</option>
                    <option value={90}>90 seconds</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Mole Speed</label>
                  <select
                    value={settings.moleSpeed}
                    onChange={(e) => handleSettingsChange({ 
                      ...settings, 
                      moleSpeed: Number(e.target.value) 
                    })}
                    className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value={1500}>Slow (1.5s)</option>
                    <option value={1000}>Normal (1s)</option>
                    <option value={500}>Fast (0.5s)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Game Stats */}
          <WhackMoleStats
            key={`stats-${gameKey}`}
            score={score}
            timeLeft={timeLeft}
            accuracy={accuracy}
            molesHit={molesHit}
            totalMoles={totalMoles}
          />

          {/* Start Game Button */}
          {!isGameStarted && !isGameOver && (
            <div className="text-center mb-8">
              <button
                onClick={startGame}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-xl rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🔨 Start Whacking!
              </button>
            </div>
          )}

          {/* Game Grid */}
          {isGameStarted && !isGameOver && (
            <div className="flex justify-center mb-8">
              <WhackMoleGrid
                key={`grid-${gameKey}`}
                gameState={gameState}
                gridSize={settings.gridSize}
                onMoleClick={whackMole}
              />
            </div>
          )}

          {/* Instructions */}
          {!isGameStarted && (
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
        </div>
      </div>
    </DashboardLayout>
  );
}