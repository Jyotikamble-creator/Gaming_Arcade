"use client"
import React, { useEffect, useState, useCallback } from 'react'
import QuestionCard from '@/components/games/quiz/QuestionCard'
import QuizStats from '@/components/games/quiz/QuizStats'
import Instructions from '@/components/shared/Instructions'
import QuizCompletedModal from '@/components/games/quiz/QuizCompletedModal'
import Leaderboard from '@/components/leaderboard/Leaderboard'
import DashboardLayout from '@/components/shared/DashboardLayout'
import { useQuiz } from '@/hooks/games/useQuiz'
import { QuizDifficulty } from '@/types/games/quiz'

const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Easy',
    color: 'from-green-500 to-emerald-600',
    borderColor: 'border-green-500',
    textColor: 'text-green-400',
    emoji: '🌱',
    description: 'Simple questions - Great for beginners!',
    questionsCount: 5
  },
  medium: {
    label: 'Medium',
    color: 'from-yellow-500 to-orange-600',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-400',
    emoji: '⚡',
    description: 'Intermediate difficulty - Challenge yourself!',
    questionsCount: 5
  },
  hard: {
    label: 'Hard',
    color: 'from-red-500 to-pink-600',
    borderColor: 'border-red-500',
    textColor: 'text-red-400',
    emoji: '🔥',
    description: 'Expert level - For quiz masters!',
    questionsCount: 5
  }
} as const;

export default function QuizPage() {
  const {
    quizState,
    currentQuestion,
    handleAnswer,
    handleRestart,
    startQuiz,
    currentIndex,
    totalQuestions,
    score,
    difficulty,
    gameStarted,
    isCompleted,
    selectedAnswer,
    showResult
  } = useQuiz()

  const handleDifficultySelect = (selectedDifficulty: QuizDifficulty) => {
    startQuiz(selectedDifficulty)
  }

  const handleNewGame = () => {
    handleRestart()
  }

  // Difficulty Selection Screen
  if (!gameStarted) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  📚 Quiz Challenge
                </h1>
                <p className="text-gray-300 text-xl mb-4">
                  Test your knowledge across multiple categories!
                </p>
                <p className="text-gray-400 text-lg">
                  Select a difficulty level to begin
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Easy */}
                <button
                  onClick={() => handleDifficultySelect('easy')}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/50 p-8 hover:border-green-400 hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">🌱</div>
                    <h3 className="text-3xl font-bold text-green-400 mb-3">Easy</h3>
                    <p className="text-sm text-gray-300 mb-3">Simple questions - Great for beginners!</p>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 5 Questions</li>
                      <li>✓ 10 Points each</li>
                      <li>✓ Max: 50 Points</li>
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
                    <p className="text-sm text-gray-300 mb-3">Intermediate difficulty - Challenge yourself!</p>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 5 Questions</li>
                      <li>✓ 20 Points each</li>
                      <li>✓ Max: 100 Points</li>
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
                    <p className="text-sm text-gray-300 mb-3">Expert level - For quiz masters!</p>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 5 Questions</li>
                      <li>✓ 50 Points each</li>
                      <li>✓ Max: 250 Points</li>
                    </ul>
                  </div>
                </button>
              </div>

              {/* Question Types Info */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-white font-semibold mb-4 text-center text-lg">Question Categories</h3>
                <div className="grid md:grid-cols-2 gap-3 text-gray-300 text-sm">
                  <div>📚 <span className="font-medium">Literature & History</span> - Classic literature & historical events</div>
                  <div>🔬 <span className="font-medium">Science & Nature</span> - Physics, Chemistry, Biology</div>
                  <div>🌍 <span className="font-medium">Geography</span> - Countries, capitals & landmarks</div>
                  <div>🎨 <span className="font-medium">Arts & Culture</span> - Famous artists & artworks</div>
                  <div>🧮 <span className="font-medium">Mathematics</span> - Calculations & problems</div>
                  <div>💻 <span className="font-medium">Technology & Programming</span> - Tech & code basics</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Loading state
  if (totalQuestions === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white ml-auto mr-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Loading quiz...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const diffConfig = DIFFICULTY_CONFIG[difficulty as QuizDifficulty]

  // Quiz in progress or completed
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header with Progress */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
              <h1 className="text-4xl md:text-6xl font-bold bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                📚 Quiz
              </h1>
              <span className="text-3xl font-bold text-gray-300 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                {currentIndex + 1}/{totalQuestions}
              </span>
              <span className={`text-3xl font-bold px-4 py-2 rounded-lg border capitalize ${diffConfig?.textColor} border-opacity-50`}>
                {difficulty}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${((currentIndex) / totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-6 mb-6">
              <div className="bg-gray-800/50 rounded-lg px-6 py-3 border border-gray-700">
                <p className="text-gray-400 text-sm">Current Score</p>
                <p className="text-3xl font-bold text-green-400">{score}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg px-6 py-3 border border-gray-700">
                <p className="text-gray-400 text-sm">Questions Remaining</p>
                <p className="text-3xl font-bold text-yellow-400">{totalQuestions - currentIndex - 1}</p>
              </div>
            </div>
          </div>

          {/* Question Card */}
          {!isCompleted && currentQuestion && (
            <div className="max-w-3xl mx-auto">
              <QuestionCard
                question={currentQuestion.q}
                options={currentQuestion.options}
                onAnswer={handleAnswer}
                showResult={showResult}
                selectedAnswer={selectedAnswer}
                correctAnswer={currentQuestion.ans}
              />
            </div>
          )}

          {/* Completed Modal */}
          {isCompleted && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 border border-purple-500/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
                  <p className="text-gray-300 mb-6">Great job! You answered all questions.</p>

                  <div className="bg-gray-800/50 rounded-lg p-6 mb-6 border border-gray-700">
                    <p className="text-gray-400 text-sm mb-2">Final Score</p>
                    <p className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      {score}
                    </p>
                    <p className="text-gray-400 text-sm mt-3">
                      Correct Answers: {totalQuestions === 0 ? 0 : Math.round((score / (totalQuestions * 10)) * totalQuestions)}/{totalQuestions}
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

          {/* Leaderboard */}
          <div className="mt-12">
            <Leaderboard gameType="quiz" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
