"use client";

// Main WordScramble page component
import React from 'react';
import { useWordScramble } from '@/hooks/useWordScramble';
import WordScrambleStats from '@/components/games/wordscramble/WordScrambleStats';
import WordScrambleDisplay from '@/components/games/wordscramble/WordScrambleDisplay';
import WordScrambleInput from '@/components/games/wordscramble/WordScrambleInput';
import WordScrambleAnswer from '@/components/games/wordscramble/WordScrambleAnswer';
import WordScrambleCompletedModal from '@/components/games/wordscramble/WordScrambleCompletedModal';
import DashboardLayout from '@/components/shared/DashboardLayout';

export default function WordScramblePage() {
  const {
    gameState,
    data,
    guess,
    attempts,
    correct,
    showAnswer,
    score,
    isGameOver,
    gameTime,
    isLoading,
    loadNewWord,
    checkGuess,
    revealAnswer,
    resetGame,
    setGuess
  } = useWordScramble();

  const { word, scrambled } = data;

  const isCompleted = isGameOver;

  const handleGuessSubmit = async (newGuess: string): Promise<void> => {
    setGuess(newGuess);
    await checkGuess();
  };

  const handleNewGame = (): void => {
    loadNewWord();
  };

  const handleModalClose = (): void => {
    // Modal close logic is handled by the hook
  };

  const handleGuessChange = (value: string): void => {
    setGuess(value);
  };

  const handleCheck = (): void => {
    checkGuess();
  };

  const handleReveal = (): void => {
    revealAnswer();
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-linear-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
            Word Scramble
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Unscramble the letters to find the hidden word!
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <button
              onClick={handleNewGame}
              disabled={isLoading}
              className="px-6 py-3 bg-linear-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? '⏳ Loading...' : '🔄 New Word'}
            </button>
            
            <button
              onClick={revealAnswer}
              disabled={showAnswer || !word || isLoading}
              className="px-6 py-3 bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
            >
              💡 Reveal Answer
            </button>
            
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-linear-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🔄 Reset Stats
            </button>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="max-w-4xl mx-auto">
          {word && scrambled ? (
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700">
              {/* Scrambled Word Display */}
              <div className="mb-8">
                <WordScrambleDisplay
                  scrambled={scrambled}
                  isLoading={isLoading}
                />
              </div>

              {/* Game Input Area */}
              {!showAnswer && (
                <div className="mb-8">
                  <WordScrambleInput
                    guess={guess}
                    onChange={handleGuessChange}
                    onCheck={handleCheck}
                    onReveal={handleReveal}
                    onNewWord={handleNewGame}
                    correct={correct}
                    showAnswer={showAnswer}
                    disabled={isLoading}
                    attempts={attempts}
                  />
                </div>
              )}

              {/* Answer Display */}
              {showAnswer && (
                <div className="mb-8">
                  <WordScrambleAnswer
                    word={word}
                    show={showAnswer}
                    isCorrect={correct}
                    attempts={attempts}
                  />
                </div>
              )}

              {/* Word Info */}
              {word && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-4 px-6 py-3 bg-gray-700/50 rounded-xl">
                    <span className="text-gray-300">
                      📏 <strong className="text-white">{word.length}</strong> letters
                    </span>
                    <span className="text-gray-300">
                      🎯 Attempt <strong className="text-white">{attempts}</strong>
                    </span>
                    {gameTime > 0 && (
                      <span className="text-gray-300">
                        ⏱️ <strong className="text-white">{Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}</strong>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-2xl text-gray-300 mb-8">Ready to unscramble some words?</p>
              <button
                onClick={handleNewGame}
                disabled={isLoading}
                className="px-8 py-4 bg-linear-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold text-xl rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50"
              >
                {isLoading ? '⏳ Loading...' : '🚀 Start Playing'}
              </button>
            </div>
          )}
        </div>

        {/* Game Stats */}
        <div className="mt-8 mb-8 max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-gray-700">
            <WordScrambleStats
              attempts={attempts}
              correct={correct}
              showAnswer={showAnswer}
              score={score}
            />
          </div>
        </div>

        {/* Game Instructions */}
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 text-center">📖 How to Play</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">🎯 Objective</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Unscramble the letters to form a word</li>
                  <li>• Use all the given letters exactly once</li>
                  <li>• Find the correct English word</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-green-400 mb-2">🏆 Scoring</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Perfect solve: 100 points + bonus</li>
                  <li>• Fewer attempts = higher score</li>
                  <li>• Longer words = more points</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-purple-400 mb-2">💡 Tips</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Look for common patterns (ING, ED, TH)</li>
                  <li>• Start with vowels</li>
                  <li>• Think of word categories</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-yellow-400 mb-2">⚡ Features</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Real-time scoring</li>
                  <li>• Progress tracking</li>
                  <li>• Instant feedback</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Modal */}
        <WordScrambleCompletedModal
          isOpen={isGameOver}
          isCorrect={correct}
          score={score}
          word={word || ''}
          scrambled={scrambled || ''}
          attempts={attempts}
          guess={guess}
          gameTime={gameTime}
          onClose={handleModalClose}
          onNewGame={handleNewGame}
        />
        </div>
      </div>
    </DashboardLayout>
  );
}