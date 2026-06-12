"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface PuzzleHintProps {
  puzzle: any;
}

export default function PuzzleHint({ puzzle }: PuzzleHintProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!puzzle?.hint) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card-bg rounded-xl border border-gray-700 overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-dark-bg transition-colors"
      >
        <div className="flex items-center gap-3">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <span className="text-light-text font-medium">Need a Hint?</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-subtle-text" />
        ) : (
          <ChevronDown className="w-5 h-5 text-subtle-text" />
        )}
      </button>

      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-4"
        >
          <div className="bg-dark-bg p-3 rounded-lg">
            <p className="text-subtle-text text-sm">{puzzle.hint}</p>
          </div>
          <p className="text-xs text-subtle-text mt-2">
            Hint used - may affect scoring
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}