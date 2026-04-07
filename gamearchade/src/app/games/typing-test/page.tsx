"use client"
import React from 'react'
import { useTypingTest } from '@/hooks/games/useTypingTest'
import DashboardLayout from '@/components/shared/DashboardLayout'
import Instructions from '@/components/shared/Instructions'

export default function TypingTestPage() {
  const { text, input, isLoading, done, handleInputChange, resetTest, stats, wpm, accuracy } = useTypingTest()

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8 bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 text-light-text">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Typing Test</h1>
          <p className="text-gray-300 mb-8">Improve your typing speed and accuracy by typing passages as quickly and accurately as possible.</p>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-300">Loading passage...</div>
            </div>
          ) : (
            <>
              {/* Instructions */}
              <div className="mb-8">
                <Instructions gameType="typing-test" />
              </div>

              {/* Game Area */}
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-gray-400 mb-3">TYPE THIS PASSAGE:</h2>
                  <div className="bg-gray-900/50 rounded-lg p-4 min-h-[100px] text-lg whitespace-pre-wrap text-gray-200 border border-gray-700">
                    {text}
                  </div>
                </div>

                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-gray-400 mb-2">YOUR INPUT:</h2>
                  <textarea
                    className="w-full h-40 p-4 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-blue-400 focus:outline-none resize-none"
                    placeholder="Start typing here..."
                    value={input}
                    onChange={handleInputChange}
                    disabled={done}
                  />
                </div>

                {/* Stats Display */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <div className="text-sm font-semibold text-gray-400 mb-1">WORDS PER MINUTE</div>
                    <div className="text-3xl font-bold text-blue-400">{Math.round(wpm)}</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <div className="text-sm font-semibold text-gray-400 mb-1">ACCURACY</div>
                    <div className="text-3xl font-bold text-purple-400">{Math.round(accuracy)}%</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={resetTest}
                  className="w-full px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  🔄 Reset Test
                </button>

                {/* Test Complete Message */}
                {done && (
                  <div className="mt-6 p-5 bg-green-600/20 border border-green-500/50 rounded-lg">
                    <h3 className="text-lg font-bold text-green-400 mb-2">✅ Test Complete!</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm text-green-300">
                      <div>
                        <span className="font-semibold">Final WPM:</span> {Math.round(stats.wpm)}
                      </div>
                      <div>
                        <span className="font-semibold">Final Accuracy:</span> {Math.round(stats.accuracy)}%
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-green-200">Great job! Try another test to improve your typing skills.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
