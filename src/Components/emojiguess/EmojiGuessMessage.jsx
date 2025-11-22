import React from 'react';

export default function EmojiGuessMessage({ message, messageType }) {
  if (!message) return null;

  return (
    <div className={`mt-6 p-6 rounded-xl border text-center max-w-md mx-auto shadow-2xl transform transition-all duration-300 ${
      messageType === 'success'
        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400 text-green-300 animate-bounce'
        : messageType === 'error'
        ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400 text-red-300'
        : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400 text-blue-300'
    }`}>
      <p className="font-bold text-lg">{message}</p>
    </div>
  );
}