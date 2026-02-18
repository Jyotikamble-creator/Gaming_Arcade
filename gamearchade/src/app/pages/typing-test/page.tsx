"use client"
import React from 'react'
import { useTypingTest } from '@/hooks/useTypingTest'

export default function TypingTestPage() {
  const { text, input, isLoading, done, handleInputChange, resetTest, stats, wpm, accuracy } = useTypingTest()

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-light-text">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Typing Test</h1>

        {isLoading ? (
          <div>Loading passage...</div>
        ) : (
          <div className="bg-gray-800/60 rounded-lg p-6">
            <div className="mb-4 text-lg whitespace-pre-wrap">{text}</div>
            <textarea
              className="w-full h-40 p-3 rounded-md bg-gray-900 text-white"
              value={input}
              onChange={handleInputChange}
            />

            <div className="flex items-center justify-between mt-4">
              <div>
                <div>WPM: <strong>{wpm}</strong></div>
                <div>Accuracy: <strong>{accuracy}%</strong></div>
              </div>
              <div className="space-x-2">
                <button onClick={resetTest} className="px-4 py-2 bg-blue-600 rounded">Reset</button>
              </div>
            </div>

            {done && (
              <div className="mt-4 p-4 bg-green-700/30 rounded">Test complete — WPM: {stats.wpm}, Accuracy: {stats.accuracy}%</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
