"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

interface PuzzleInputProps {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
}

export default function PuzzleInput({
  onSubmit,
  disabled = false
}: PuzzleInputProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() && !disabled) {
      onSubmit(answer.trim());
      setAnswer('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card-bg rounded-xl p-6 border border-gray-700"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <label className="block text-light-text font-medium">
            Your Solution
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your code solution here..."
            disabled={disabled}
            className="w-full h-32 bg-dark-bg border border-gray-600 rounded-lg p-3 text-light-text placeholder-subtle-text focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none font-mono text-sm"
          />
          <button
            type="submit"
            disabled={disabled || !answer.trim()}
            className="w-full bg-primary-blue hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Submit Solution
          </button>
        </div>
      </form>
    </motion.div>
  );
}