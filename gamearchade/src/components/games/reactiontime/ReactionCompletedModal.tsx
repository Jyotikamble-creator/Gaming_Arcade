import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PerformanceRating {
  text: string;
  color: string;
  emoji: string;
}

interface Props {
  averageTime: number;
  bestTime: number;
  reactionTimes: number[];
  performanceRating: PerformanceRating;
  difficulty: string;
  onPlayAgain: () => void;
  onChangeSettings: () => void;
  onBackToMenu: () => void;
}

export default function ReactionCompletedModal({ averageTime, bestTime, reactionTimes, performanceRating, difficulty, onPlayAgain, onChangeSettings, onBackToMenu }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerSlide = 5;
  const totalSlides = Math.ceil(reactionTimes.length / itemsPerSlide);

  const getCurrentSlideItems = () => {
    const start = currentSlide * itemsPerSlide;
    return reactionTimes.slice(start, start + itemsPerSlide);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const worstTime = Math.max(...reactionTimes);
  const consistency = Math.round((1 - (worstTime - Math.min(...reactionTimes)) / averageTime) * 100);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 rounded-3xl p-8 max-w-2xl w-full border-2 border-indigo-500/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{performanceRating.emoji}</div>
          <h2 className="text-4xl font-bold text-white mb-2">Test Complete!</h2>
          <p className={`${performanceRating.color} text-2xl font-bold`}>{performanceRating.text}</p>
          <p className="text-indigo-300 text-sm mt-2">Difficulty: {difficulty}</p>
        </div>

        {/* Key Stats */}
        <div className="bg-gray-900/50 rounded-2xl p-6 mb-6 space-y-3 border border-indigo-500/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-indigo-600/10 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Average</div>
              <div className="text-2xl font-bold text-indigo-400">{averageTime}ms</div>
            </div>
            <div className="text-center p-3 bg-green-600/10 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Best</div>
              <div className="text-2xl font-bold text-green-400">{bestTime}ms</div>
            </div>
            <div className="text-center p-3 bg-red-600/10 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Worst</div>
              <div className="text-2xl font-bold text-red-400">{worstTime}ms</div>
            </div>
            <div className="text-center p-3 bg-purple-600/10 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Consistency</div>
              <div className="text-2xl font-bold text-purple-400">{consistency}%</div>
            </div>
          </div>
        </div>

        {/* Scrollable Results */}
        <div className="bg-indigo-600/10 rounded-xl p-6 mb-6 border border-indigo-500/30">
          <h3 className="text-white font-semibold mb-4 text-center">Round Times (Slide {currentSlide + 1}/{totalSlides})</h3>
          
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={prevSlide}
              disabled={totalSlides <= 1}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex-1">
              <div className="grid grid-cols-5 gap-2">
                {getCurrentSlideItems().map((time, idx) => {
                  const globalIdx = currentSlide * itemsPerSlide + idx;
                  const isBest = time === bestTime;
                  const isWorst = time === worstTime;
                  
                  return (
                    <div key={globalIdx} className="text-center">
                      <div className="text-xs text-gray-400 mb-2">R{globalIdx + 1}</div>
                      <div className={`text-lg font-bold px-3 py-2 rounded-lg transition-all ${
                        isBest ? 'bg-green-500/30 text-green-300 border border-green-500/50' :
                        isWorst ? 'bg-red-500/30 text-red-300 border border-red-500/50' :
                        'bg-gray-700/30 text-white'
                      }`}>
                        {time}ms
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={nextSlide}
              disabled={totalSlides <= 1}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Performance Insight */}
        <div className="bg-yellow-600/20 rounded-xl p-4 mb-6 border border-yellow-500/30">
          <p className="text-center text-yellow-200 text-sm">
            {averageTime < 250
              ? '🎯 Elite reflexes! You\'re in the top tier!'
              : averageTime < 300
                ? '👏 Great performance! With practice, you can get even faster!'
                : averageTime < 350
                  ? '📈 Good work! Stay focused and relaxed for better results.'
                  : '💡 Tip: Stay calm and keep practicing. You\'ll improve with time!'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={onPlayAgain}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
          >
            Test Again
          </button>

          <button
            onClick={onChangeSettings}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
          >
            Settings
          </button>

          <button
            onClick={onBackToMenu}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
          >
            Menu
          </button>
        </div>
      </div>
    </div>
  );
}
