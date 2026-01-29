// Page for the Typing Test game where users can test their typing speed and accuracy.
import React from 'react';
// Hooks
import { useTypingTest } from '../hooks/useTypingTest';
// Component imports
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/leaderboard/Leaderboard';
import {
  MetricCard,
  TypingArea,
  CompletionModal
} from '../components/typetesting';
import AnimatedBackground from '../components/AnimatedBackground';

// Main Typing Test component
export default function TypingTest(): JSX.Element {
  const {
    text,
    input,
    done,
    isLoading,
    wpm,
    accuracy,
    handleInputChange,
    loadNewPassage
  } = useTypingTest();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text">Loading typing passage...</p>
        </div>
      </div>
    );
  }

  // Render the page
  return (
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⌨️ Typing Test</h1>
          <p className="text-subtle-text">Test your typing speed and accuracy!</p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mb-8">
          <MetricCard label="WPM" value={done ? wpm : '--'} />
          <MetricCard label="ACCURACY" value={`${accuracy}%`} />
          <MetricCard label="STATUS" value={done ? 'Completed' : 'Typing...'} />
        </div>

        {/* Typing Area */}
        <TypingArea
          sourceText={text}
          typedInput={input}
          onChange={handleInputChange}
          disabled={done}
        />

        {/* New Passage Button */}
        <div className="flex justify-center mt-6 mb-6">
          <button
            onClick={loadNewPassage}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition duration-200"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load New Passage'}
          </button>
        </div>

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="typing-test" />
        </div>

        {/* Completion Modal */}
        {done && (
          <CompletionModal 
            wpm={wpm} 
            accuracy={accuracy} 
            onRestart={loadNewPassage} 
          />
        )}

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="typing-test" />
        </div>
      </div>
    </div>
  );
}