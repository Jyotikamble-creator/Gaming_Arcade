"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useWordGuess } from '@/hooks/useWordGuess';
import DashboardLayout from '@/components/shared/DashboardLayout';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorComponent from '@/components/shared/ErrorComponent';

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
  const { user } = useAuth();
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
    loadNewWord,
    resetGame
  } = useWordGuess();

  const handleNewGame = async (): Promise<void> => {
    await loadNewWord();
    setGameKey(prev => prev + 1);
    setShowCompletedModal(false);
  };

  const handleRestart = (): void => {
    resetGame();
    setGameKey(prev => prev + 1);
    setShowCompletedModal(false);
  };

  // Show modal when game ends
  React.useEffect(() => {
    if (isGameOver) {
      setTimeout(() => {
        setShowCompletedModal(true);
      }, 2000); // Show modal after 2 seconds to let user see the result
    }
  }, [isGameOver]);

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

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
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
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              🔤 Word Guess
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Guess the word by selecting letters. 
            </p>
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
                disabled={isGameOver}
              />
            </div>

            {/* Game Controls */}
            <div>
              <GameControls
                onRemoveLast={removeLast}
                onUseHint={useHint}
                onGuess={checkWin}
                onRestart={handleNewGame}
                chosenLetters={chosenLetters}
                hints={hints}
                disabled={isGameOver}
              />
            </div>
          </div>

  {/* Game Stats */}
          <GameStats
            key={`stats-${gameKey}`}
            score={score}
            wrongGuesses={wrongGuesses}
            maxWrongGuesses={3}
            hints={hints}
            maxHints={3}
          />
          {/* Game Message */}
          <GameMessage
            message={message}
            word={wordData.word}
            showWord={displayWord}
            isWon={isWon}
            isGameOver={isGameOver}
          />


          {/* Instructions */}
          {!isGameOver && (
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
                    <span>Correct letters reveal positions</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-red-400 text-xl">❌</span>
                    <span>Wrong letters count against you</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-yellow-400 text-xl">💡</span>
                    <span>Use hints when stuck</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-orange-400 text-xl">⬅️</span>
                    <span>Remove last letter if needed</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-purple-400 text-xl">🎯</span>
                    <span>Complete the word to win</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-cyan-400 text-xl">⚡</span>
                    <span>3 wrong guesses = game over</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-pink-400 text-xl">🏆</span>
                    <span>Fewer mistakes = higher score</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Game Completion Modal */}
          <WordGuessCompletedModal
            isOpen={showCompletedModal}
            isWon={isWon}
            score={score}
            word={wordData.word}
            chosenLetters={chosenLetters}
            wrongGuesses={wrongGuesses}
            hintsUsed={3 - hints}
            onClose={() => setShowCompletedModal(false)}
            onNewGame={handleNewGame}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}