import React from 'react';

const HintSystem = ({ showHint, answer, hintsUsed, onUseHint, maxHints }) => {
  const getHintText = () => {
    if (!showHint) return null;

    const words = answer.split(' ');
    const hintLength = Math.max(1, Math.floor(words.length / 2));
    const hintWords = words.slice(0, hintLength);
    return hintWords.join(' ') + (words.length > hintLength ? '...' : '');
  };

  return (
    <div className="bg-card-bg rounded-lg p-6 border border-gray-700 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-light-text">Hint System</h3>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: maxHints }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < hintsUsed ? 'bg-orange-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {showHint && (
        <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-orange-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div>
              <p className="text-orange-300 font-medium mb-1">Hint:</p>
              <p className="text-orange-200">"{getHintText()}"</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-subtle-text text-sm">
          {hintsUsed}/{maxHints} hints used
        </p>
        <button
          onClick={onUseHint}
          disabled={hintsUsed >= maxHints}
          className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Use Hint (-5 pts)
        </button>
      </div>
    </div>
  );
};

export default HintSystem;