"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/app/AuthProvider';
import { useWordBuilder } from '@/hooks/games/useWordBuilder';
import { WordBuilderDifficulty } from '@/types/games/word-builder';
import DashboardLayout from '@/components/shared/DashboardLayout';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorComponent from '@/components/shared/ErrorComponent';

// Dynamic imports for better performance
const WordBuilderStats = dynamic(() => import('@/components/games/wordbuilder/WordBuilderStats'), {
  loading: () => <div className="animate-pulse bg-gray-700/50 h-32 rounded-lg"></div>
});

const WordBuilderBoard = dynamic(() => import('@/components/games/wordbuilder/WordBuilderBoard'), {
  loading: () => <div className="animate-pulse bg-gray-700/50 h-96 rounded-lg"></div>
});

const WordBuilderControls = dynamic(() => import('@/components/games/wordbuilder/WordBuilderControls'), {
  loading: () => <div className="animate-pulse bg-gray-700/50 h-80 rounded-lg"></div>
});

const WordBuilderMessage = dynamic(() => import('@/components/games/wordbuilder/WordBuilderMessage'), {
  ssr: false
});

const WordBuilderCompletedModal = dynamic(() => import('@/components/games/wordbuilder/WordBuilderCompletedModal'), {
  ssr: false
});

import { useRouter } from 'next/navigation';

export default function WordBuilderPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/pages/auth");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  const [gameKey, setGameKey] = useState<number>(0);
  
  const {
    gameState,
    currentChallenge,
    availableLetters,
    currentWord,
    foundWords,
    score,
    elapsedTime,
    isCompleted,
    message,
    messageType,
    hintsUsed,
    difficulty,
    isGameStarted,
    error,
    startNewGame,
    handleLetterClick,
    handleRemoveLetter,
    handleSubmitWord,
    handleShuffle,
    handleHint,
    clearCurrentWord,
    resetGame
  } = useWordBuilder('easy', user);

  const handleRestart = (): void => {
    resetGame();
    setGameKey(prev => prev + 1);
  };

  const handleDifficultyChange = (newDifficulty: WordBuilderDifficulty): void => {
    if (window.confirm('Start a new game with different difficulty?')) {
      startNewGame(newDifficulty);
      setGameKey(prev => prev + 1);
    }
  };

  const handleNewGame = (): void => {
    startNewGame(difficulty);
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

  // Difficulty Selection Screen
  if (!isGameStarted) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden flex items-center justify-center">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              {/* Title */}
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                  📝 Word Builder Challenge
                </h1>
                <p className="text-gray-300 text-xl mb-4">
                  Build words from letters and prove your skill!
                </p>
                <p className="text-gray-400 text-lg">
                  Select a difficulty level to begin
                </p>
              </div>

              {/* Difficulty Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Easy */}
                <button
                  onClick={() => {
                    startNewGame('easy');
                    setGameKey(prev => prev + 1);
                  }}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/50 p-8 hover:border-green-400 hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">🌱</div>
                    <h3 className="text-3xl font-bold text-green-400 mb-3">Easy</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 5 Hints available</li>
                      <li>✓ Simple 4-letter words</li>
                      <li>✓ Points: 100 per word</li>
                    </ul>
                  </div>
                </button>

                {/* Medium */}
                <button
                  onClick={() => {
                    startNewGame('medium');
                    setGameKey(prev => prev + 1);
                  }}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/50 p-8 hover:border-yellow-400 hover:from-yellow-500/30 hover:to-orange-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">⚡</div>
                    <h3 className="text-3xl font-bold text-yellow-400 mb-3">Medium</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 3 Hints available</li>
                      <li>✓ Mix of 4-6 letter words</li>
                      <li>✓ Points: 200 per word</li>
                    </ul>
                  </div>
                </button>

                {/* Hard */}
                <button
                  onClick={() => {
                    startNewGame('hard');
                    setGameKey(prev => prev + 1);
                  }}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500/20 to-pink-600/20 border border-red-500/50 p-8 hover:border-red-400 hover:from-red-500/30 hover:to-pink-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">🔥</div>
                    <h3 className="text-3xl font-bold text-red-400 mb-3">Hard</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 1 Hint available</li>
                      <li>✓ Challenging 6+ letter words</li>
                      <li>✓ Points: 300 per word</li>
                    </ul>
                  </div>
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-white font-semibold mb-4 text-center text-lg">How to Play</h3>
                <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                  <div className="space-y-2">
                    <p>🔤 Click letters to build words</p>
                    <p>✅ Find minimum words to complete</p>
                  </div>
                  <div className="space-y-2">
                    <p>💡 Use hints when stuck</p>
                    <p>🎯 Discover all hidden words!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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

  if (!currentChallenge) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-300 mt-4 text-lg">Loading Word Builder...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-indigo-900 to-purple-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-pulse text-2xl opacity-30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              >
                {['📝', '🔤', '✏️', '📖', '🎯'][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              📝 Word Builder
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Form words from the given letters. Find as many words as possible to complete the challenge!
            </p>
          </div>

          {/* Game Stats */}
          <WordBuilderStats
            key={`stats-${gameKey}`}
            difficulty={difficulty}
            time={elapsedTime}
            wordsFound={foundWords.length}
            totalWords={currentChallenge.targetWords.length}
            minWords={currentChallenge.minWords}
            score={score}
            hintsUsed={hintsUsed}
          />

          {/* Message Display */}
          <WordBuilderMessage
            message={message}
            messageType={messageType}
          />

          {/* Game Area */}
          {isGameStarted && (
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              {/* Game Board */}
              <div className="lg:col-span-2">
                <WordBuilderBoard
                  key={`board-${gameKey}`}
                  availableLetters={availableLetters}
                  currentWord={currentWord}
                  foundWords={foundWords}
                  onLetterClick={handleLetterClick}
                  onRemoveLetter={handleRemoveLetter}
                />
              </div>

              {/* Controls */}
              <div className="lg:col-span-1">
                <WordBuilderControls
                  onSubmit={handleSubmitWord}
                  onClear={clearCurrentWord}
                  onShuffle={handleShuffle}
                  onHint={handleHint}
                  onNewGame={handleNewGame}
                  onDifficultyChange={handleDifficultyChange}
                  difficulty={difficulty}
                  isCompleted={isCompleted}
                  canSubmit={currentWord.length >= 3}
                  hintsUsed={hintsUsed}
                  maxHints={5}
                />
              </div>
            </div>
          )}

          {/* Instructions */}
          {!isCompleted && (
            <div className="max-w-4xl mx-auto bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4 text-center">How to Play</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-300">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400 text-xl">🔤</span>
                    <span>Click letters to build words</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-400 text-xl">📝</span>
                    <span>Submit words (3+ letters)</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-purple-400 text-xl">🔄</span>
                    <span>Shuffle to rearrange letters</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-yellow-400 text-xl">💡</span>
                    <span>Use hints when stuck</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-orange-400 text-xl">🎯</span>
                    <span>Find minimum words to win</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-red-400 text-xl">⏱️</span>
                    <span>Faster completion = bonus points</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-cyan-400 text-xl">🏆</span>
                    <span>Longer words = higher scores</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-pink-400 text-xl">📚</span>
                    <span>Discover all hidden words</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Game Completion Modal */}
          {isCompleted && currentChallenge && (
            <WordBuilderCompletedModal
              isOpen={isCompleted}
              score={score}
              wordsFound={foundWords}
              totalWords={currentChallenge.targetWords.length}
              allWords={currentChallenge.targetWords}
              time={elapsedTime}
              difficulty={difficulty}
              hintsUsed={hintsUsed}
              onClose={() => {}}
              onNewGame={handleNewGame}
            />
          )}
          {/* Leaderboard */}
          <div className="mt-12">
            <Leaderboard gameType="word-builder" />
          </div>        </div>
      </div>
    </DashboardLayout>
  );
}