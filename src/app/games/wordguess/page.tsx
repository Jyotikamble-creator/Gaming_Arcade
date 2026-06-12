"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/AuthProvider';
import { useWordGuess } from '@/hooks/games/useWordGuess';
import DashboardLayout from '@/components/shared/DashboardLayout';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorComponent from '@/components/shared/ErrorComponent';
import { WordDifficulty, DIFFICULTY_CONFIG } from '@/types/games/word-guess';

// Dynamic imports for better performance
const WordHintDisplay = dynamic(() => import('@/components/games/wordguess/WordHintDisplay'), {
  loading: () => <div className="animate-pulse bg-gray-700/50 h-32 rounded-lg"></div>
});

const WordDisplay = dynamic(() => import('@/components/games/wordguess/WordDisplay'), {
  loading: () => <div className="animate-pulse bg-gray-700/50 h-48 rounded-lg"></div>
});

const GameStats = dynamic(() => import('@/components/games/wordguess/GameStats'), {
  loading: () => <div className="animate-pulse bg-gray-700/50 h-40 rounded-lg"></div>
});

const GameMessage = dynamic(() => import('@/components/games/wordguess/GameMessage'), {
  ssr: false
});

const LetterSelector = dynamic(() => import('@/components/games/wordguess/LetterSelector'), {
  loading: () => <div className="animate-pulse bg-gray-700/50 h-64 rounded-lg"></div>
});

const GameControls = dynamic(() => import('@/components/games/wordguess/GameControls'), {
  loading: () => <div className="animate-pulse bg-gray-700/50 h-48 rounded-lg"></div>
});

const WordGuessCompletedModal = dynamic(() => import('@/components/games/wordguess/WordGuessCompletedModal'), {
  ssr: false
});

export default function WordGuessPage() {
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
  const [showCompletedModal, setShowCompletedModal] = useState<boolean>(false);
  
  const {
    gameState,
    wordData,
    chosenLetters,
    wrongGuesses,
    hints,
    message,
    displayWord,
    score,
    isLoading,
    isGameOver,
    isWon,
    error,
    selectLetter,
    useHint,
    removeLast,
    checkWin,
    resetGame,
    startGame,
    nextRound,
    currentRound,
    totalRounds,
    difficulty,
    gameStarted
  } = useWordGuess();

  const handleDifficultySelect = (selectedDifficulty: WordDifficulty): void => {
    startGame(selectedDifficulty);
    setGameKey(prev => prev + 1);
  };

  const handleNextRound = (): void => {
    nextRound();
    setGameKey(prev => prev + 1);
  };

  const handleNewGame = async (): Promise<void> => {
    resetGame();
    setGameKey(prev => prev + 1);
    setShowCompletedModal(false);
  };

  const handleRestart = (): void => {
    resetGame();
    setGameKey(prev => prev + 1);
    setShowCompletedModal(false);
  };

  // Show modal when game ends (all 5 rounds completed)
  React.useEffect(() => {
    if (isGameOver && gameStarted) {
      setShowCompletedModal(true);
    }
  }, [isGameOver, gameStarted]);

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
  if (!gameStarted) {
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
                <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  🔤 Word Guess Challenge
                </h1>
                <p className="text-gray-300 text-xl mb-4">
                  Guess 5 words and prove your skill!
                </p>
                <p className="text-gray-400 text-lg">
                  Select a difficulty level to begin
                </p>
              </div>

              {/* Difficulty Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Easy */}
                <button
                  onClick={() => handleDifficultySelect('easy')}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/50 p-8 hover:border-green-400 hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">🌱</div>
                    <h3 className="text-3xl font-bold text-green-400 mb-3">Easy</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 5 Hints per word</li>
                      <li>✓ 5 Wrong guesses allowed</li>
                      <li>✓ Points: 100 per word</li>
                    </ul>
                  </div>
                </button>

                {/* Medium */}
                <button
                  onClick={() => handleDifficultySelect('medium')}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/50 p-8 hover:border-yellow-400 hover:from-yellow-500/30 hover:to-orange-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">⚡</div>
                    <h3 className="text-3xl font-bold text-yellow-400 mb-3">Medium</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 3 Hints per word</li>
                      <li>✓ 3 Wrong guesses allowed</li>
                      <li>✓ Points: 200 per word</li>
                    </ul>
                  </div>
                </button>

                {/* Hard */}
                <button
                  onClick={() => handleDifficultySelect('hard')}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500/20 to-pink-600/20 border border-red-500/50 p-8 hover:border-red-400 hover:from-red-500/30 hover:to-pink-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">🔥</div>
                    <h3 className="text-3xl font-bold text-red-400 mb-3">Hard</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 1 Hint per word</li>
                      <li>✓ 2 Wrong guesses allowed</li>
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
                    <p>🔤 Click letters to guess the word</p>
                    <p>✅ Complete each word to move to the next</p>
                  </div>
                  <div className="space-y-2">
                    <p>💡 Use hints if you get stuck</p>
                    <p>🎯 Complete all 5 words to win!</p>
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-300 mt-4 text-lg">Loading word...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Game in progress or completed
  const diffConfig = difficulty ? DIFFICULTY_CONFIG[difficulty] : null;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-pulse text-3xl opacity-20"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              >
                {['🔤', '📝', '💭', '🎯', '🧩'][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header with Progress */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                🔤 Word Guess
              </h1>
              <span className="text-3xl font-bold text-gray-300 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                {currentRound}/{totalRounds}
              </span>
            </div>
            <p className="text-gray-400 text-lg mb-4">
              Difficulty: <span className="text-white font-semibold capitalize">{difficulty}</span>
            </p>
            
            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mb-4">
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${((currentRound - 1) / totalRounds) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Word Hint */}
          <WordHintDisplay
            key={`hint-${gameKey}`}
            description={wordData.description}
            category={wordData.category}
          />

          {/* Word Display */}
          <WordDisplay
            key={`word-${gameKey}`}
            word={wordData.word}
            chosenLetters={chosenLetters}
            showWord={displayWord}
          />

          {/* Game Area */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Letter Selector */}
            <div>
              <LetterSelector
                key={`selector-${gameKey}`}
                chosenLetters={chosenLetters}
                onSelectLetter={selectLetter}
                disabled={isWon}
              />
            </div>

            {/* Game Controls */}
            <div>
              {!isWon ? (
                <GameControls
                  onRemoveLast={removeLast}
                  onUseHint={useHint}
                  onGuess={checkWin}
                  onRestart={() => {}} // Not used in 5-round mode
                  chosenLetters={chosenLetters}
                  hints={hints}
                  disabled={isWon}
                />
              ) : (
                <div className="flex gap-4">
                  {currentRound < totalRounds ? (
                    <button
                      onClick={handleNextRound}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 text-lg"
                    >
                      ✓ Next Word
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowCompletedModal(true)}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 text-lg"
                    >
                      🎉 See Results
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Game Stats */}
          <GameStats
            key={`stats-${gameKey}`}
            score={score}
            wrongGuesses={wrongGuesses}
            maxWrongGuesses={diffConfig?.maxWrongGuesses || 3}
            hints={hints}
            maxHints={diffConfig?.maxHints || 3}
          />

          {/* Game Message */}
          <GameMessage
            message={message}
            word={wordData.word}
            showWord={displayWord}
            isWon={isWon}
            isGameOver={isWon}
          />

          {/* Instructions */}
          {!isWon && (
            <div className="max-w-4xl mx-auto bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4 text-center">How to Play</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-300">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-400 text-xl">🔤</span>
                    <span>Click letters to guess</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400 text-xl">✅</span>
                    <span>Correct letters reveal</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-red-400 text-xl">❌</span>
                    <span>Wrong letters count</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-yellow-400 text-xl">💡</span>
                    <span>Use hints wisely</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-orange-400 text-xl">⬅️</span>
                    <span>Remove last letter</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-cyan-400 text-xl">📊</span>
                    <span>Track your score</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-purple-400 text-xl">🎯</span>
                    <span>Complete 5 words</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-pink-400 text-xl">🏆</span>
                    <span>Earn your score!</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Completed Modal */}
      {showCompletedModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 border border-purple-500/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-2">Challenge Complete!</h2>
              <p className="text-gray-300 mb-6">You finished all 5 words!</p>
              
              <div className="bg-gray-800/50 rounded-lg p-6 mb-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Total Score</p>
                <p className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {score}
                </p>
              </div>

              <button
                onClick={handleNewGame}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
