"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface BrainTeaserDisplayProps {
  puzzle: any;
  gameState: string;
  onPuzzleComplete: (points: number) => void;
}

export default function BrainTeaserDisplay({
  puzzle,
  gameState,
  onPuzzleComplete
}: BrainTeaserDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card-bg rounded-xl p-6 border border-gray-700"
    >
      <div className="text-center">
        <h3 className="text-light-text text-xl font-bold mb-4">Brain Teaser</h3>
        <div className="text-subtle-text mb-6">
          {puzzle ? (
            <div>
              <p className="text-lg mb-4">{puzzle.question || "Solve this puzzle..."}</p>
              {/* Placeholder for puzzle content */}
              <div className="bg-dark-bg p-4 rounded-lg">
                <p className="text-light-text">Puzzle display area</p>
              </div>
            </div>
          ) : (
            <p>Loading puzzle...</p>
          )}
        </div>
        {gameState === "playing" && (
          <button
            onClick={() => onPuzzleComplete(100)}
            className="bg-primary-blue hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
          >
            Complete Puzzle
          </button>
        )}
      </div>
    </motion.div>
  );
}