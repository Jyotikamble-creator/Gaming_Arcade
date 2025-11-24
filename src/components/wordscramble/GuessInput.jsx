import React from 'react';

const GuessInput = ({ guess, setGuess, onCheck, onReveal, onNewWord, correct, showAnswer }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <input
          value={guess}
          onChange={e => setGuess(e.target.value)}
          disabled={correct || showAnswer}
          className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          placeholder="Enter your guess..."
          onKeyPress={(e) => e.key === 'Enter' && !correct && !showAnswer && onCheck()}
        />
        <div className="flex gap-3">
          <button
            onClick={onCheck}
            disabled={correct || showAnswer || !guess.trim()}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg"
          >
            Check
          </button>
          <button
            onClick={onReveal}
            disabled={correct || showAnswer}
            className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg"
          >
            Reveal
          </button>
          <button
            onClick={onNewWord}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            New Word
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuessInput;