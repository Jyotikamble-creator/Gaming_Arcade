"use client";

import React, { useState } from 'react';

interface BrainTeaserDisplayProps {
  puzzle: any;
  gameState: string;
  onPuzzleComplete: (points: number) => void;
}

export default function BrainTeaserDisplay({
  puzzle,
  gameState,
  onPuzzleComplete
}: BrainTeaserDisplayProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  if (!puzzle) {
    return (
      <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl p-8 border border-slate-700">
        <div className="text-center">
          <p className="text-white text-lg">Loading puzzle...</p>
        </div>
      </div>
    );
  }

  const handleSubmitAnswer = () => {
    const correct = userAnswer.toLowerCase().trim() === puzzle.answer.toLowerCase().trim();
    setFeedback(correct ? 'correct' : 'incorrect');
    setShowAnswer(true);

    if (correct) {
      setTimeout(() => {
        onPuzzleComplete(100);
        setUserAnswer('');
        setFeedback(null);
        setShowAnswer(false);
      }, 1500);
    }
  };

  const handleSkip = () => {
    onPuzzleComplete(0);
    setUserAnswer('');
    setFeedback(null);
    setShowAnswer(false);
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl p-8 border border-slate-700">
      <div className="text-center">
        <h3 className="text-white text-2xl font-bold mb-6">🧩 Brain Teaser</h3>
        
        <div className="bg-slate-900/50 rounded-lg p-8 mb-8 min-h-[180px] flex items-center justify-center">
          <p className="text-white text-xl leading-relaxed">{puzzle.question}</p>
        </div>

        {/* Answer Input */}
        {gameState === "playing" && (
          <div className="mb-6">
            <label className="block text-white text-sm font-semibold mb-3">Your Answer:</label>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
              placeholder="Type your answer..."
              disabled={feedback !== null}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
          </div>
        )}

        {/* Feedback Messages */}
        {feedback === 'correct' && (
          <div className="bg-green-900/50 border border-green-500 rounded-lg p-4 mb-6">
            <p className="text-green-400 text-lg font-semibold">✅ Correct Answer!</p>
            <p className="text-green-300 text-sm">+100 points • Loading next puzzle...</p>
          </div>
        )}

        {feedback === 'incorrect' && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-lg font-semibold">❌ Incorrect Answer</p>
          </div>
        )}

        {showAnswer && (
          <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-4 mb-6">
            <p className="text-blue-400 text-sm font-semibold mb-1">Correct Answer:</p>
            <p className="text-white text-lg font-bold">{puzzle.answer}</p>
          </div>
        )}

        {gameState === "playing" && (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim() || feedback !== null}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Submit Answer
            </button>
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {showAnswer ? "Hide Answer" : "Show Answer"}
            </button>
            <button
              onClick={handleSkip}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Skip Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}