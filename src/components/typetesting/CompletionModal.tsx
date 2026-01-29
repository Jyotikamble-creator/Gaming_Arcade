// CompletionModal component to display test results
import React from 'react';
import { CompletionModalProps } from '../../types/typingTest';
import { getPerformanceRating } from '../../utils/typingTestUtils';

export default function CompletionModal({ wpm, accuracy, onRestart }: CompletionModalProps): JSX.Element {
  const rating = getPerformanceRating(wpm);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md mx-4">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-green-600 mb-2">Test Completed!</h2>
        
        {/* Performance Rating */}
        <div className={`text-lg font-semibold mb-4 ${rating.color}`}>
          {rating.text}
        </div>

        {/* Results */}
        <div className="space-y-3 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm mb-1">Words per minute</p>
            <p className="text-4xl font-bold text-blue-600">{wpm} WPM</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm mb-1">Accuracy</p>
            <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="bg-blue-50 rounded-lg p-3 mb-6 text-left">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Tips:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Maintain proper hand position</li>
            <li>• Focus on accuracy over speed</li>
            <li>• Practice regularly for improvement</li>
          </ul>
        </div>

        <button
          onClick={onRestart}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Take Test Again
        </button>
      </div>
    </div>
  );
}