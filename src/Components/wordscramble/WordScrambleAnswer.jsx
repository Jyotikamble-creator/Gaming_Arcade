import React from 'react';

export default function WordScrambleAnswer({ word, show }) {
  if (!show) return null;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 text-center shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-2">The Word Was:</h3>
      <div className="text-3xl font-mono font-bold text-green-400">
        {word}
      </div>
    </div>
  );
}