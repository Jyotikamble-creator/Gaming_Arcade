"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface PuzzleDisplayProps {
  puzzle: any;
  category: string;
  gameState: string;
}

export default function PuzzleDisplay({
  puzzle,
  category,
  gameState
}: PuzzleDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card-bg rounded-xl p-6 border border-gray-700"
    >
      <div className="text-center">
        <h3 className="text-light-text text-xl font-bold mb-4">Coding Puzzle</h3>
        <div className="text-subtle-text mb-4">
          <span className="inline-block bg-primary-blue text-white px-3 py-1 rounded-full text-sm font-medium">
            {category}
          </span>
        </div>
        <div className="bg-dark-bg p-4 rounded-lg">
          {puzzle ? (
            <div>
              <p className="text-light-text mb-4">{puzzle.question || "Solve this coding puzzle..."}</p>
              <div className="text-left">
                <pre className="text-subtle-text text-sm bg-gray-800 p-3 rounded overflow-x-auto">
                  {puzzle.code || "// Write your solution here"}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-subtle-text">Loading puzzle...</p>
          )}
        </div>
        {gameState === "playing" && (
          <div className="mt-4 text-subtle-text text-sm">
            Write your solution in the input below
          </div>
        )}
      </div>
    </motion.div>
  );
}