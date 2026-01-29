// WordHintDisplay component to show word description and category
import React from 'react';
import { WordHintDisplayProps } from '@/types/games/word-guess';

export default function WordHintDisplay({
  description,
  category
}: WordHintDisplayProps): JSX.Element {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
      <div className="text-center">
        {/* Category Badge */}
        {category && (
          <div className="mb-4">
            <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-full uppercase tracking-wider shadow-lg">
              {category}
            </span>
          </div>
        )}

        {/* Hint Title */}
        <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center justify-center gap-2">
          <span>💡</span>
          Word Hint
        </h3>

        {/* Description */}
        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
          <p className="text-gray-200 leading-relaxed text-base md:text-lg max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-4 text-gray-400 text-sm">
          Use this clue to help you guess the word!
        </div>
      </div>
    </div>
  );
}