"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, RotateCcw, Home } from 'lucide-react';

interface BrainTeaserCompletedModalProps {
  score: number;
  timeElapsed: number;
  onPlayAgain: () => void;
  onBackToDashboard: () => void;
}

export default function BrainTeaserCompletedModal({
  score,
  timeElapsed,
  onPlayAgain,
  onBackToDashboard
}: BrainTeaserCompletedModalProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceMessage = () => {
    if (score >= 1000) return { text: '🏆 Genius!', color: 'text-yellow-400' };
    if (score >= 800) return { text: '⭐ Excellent!', color: 'text-blue-400' };
    if (score >= 600) return { text: '👍 Great Job!', color: 'text-green-400' };
    if (score >= 400) return { text: '🎯 Good!', color: 'text-orange-400' };
    return { text: '💪 Keep Practicing!', color: 'text-red-400' };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-card-bg rounded-xl p-8 max-w-md w-full border border-gray-700 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-light-text mb-2">Puzzle Completed!</h2>
          <div className={`text-xl font-bold ${performance.color}`}>
            {performance.text}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-primary-blue" />
              <span className="text-light-text font-medium">Final Score</span>
            </div>
            <span className="text-2xl font-bold text-primary-blue">{score.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-subtle-text" />
              <span className="text-light-text font-medium">Time Taken</span>
            </div>
            <span className="text-xl font-bold text-light-text">{formatTime(timeElapsed)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-primary-blue hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
          <button
            onClick={onBackToDashboard}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}