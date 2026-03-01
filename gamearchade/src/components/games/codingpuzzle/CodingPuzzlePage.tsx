"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Instructions from "@/components/shared/Instructions";
import Leaderboard from "@/components/leaderboard/Leaderboard";
import PuzzleDisplay from "./PuzzleDisplay";
import PuzzleInput from "./PuzzleInput";
import PuzzleStats from "./PuzzleStats";
import PuzzleHint from "./PuzzleHint";
import PuzzleCompletedModal from "./PuzzleCompletedModal";
import AnimatedBackground from "@/components/AnimatedBackground";

type CodingPuzzlePageProps = {
  initialPuzzle?: any;
  user?: any;
  className?: string;
};

type GameState = "menu" | "playing" | "paused" | "completed" | "instructions";
type PuzzleCategory = "logic" | "patterns" | "algorithms" | "data-structures";

export default function CodingPuzzlePage({ 
  initialPuzzle, 
  user, 
  className = "" 
}: CodingPuzzlePageProps) {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>("menu");
  const [currentPuzzle, setCurrentPuzzle] = useState(initialPuzzle);
  const [selectedCategory, setSelectedCategory] = useState<PuzzleCategory>("logic");
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const categories: { id: PuzzleCategory; label: string; description: string }[] = [
    { id: "logic", label: "Logic", description: "Boolean logic and reasoning puzzles" },
    { id: "patterns", label: "Patterns", description: "Sequence and pattern recognition" },
    { id: "algorithms", label: "Algorithms", description: "Algorithm implementation challenges" },
    { id: "data-structures", label: "Data Structures", description: "Array, object, and tree problems" }
  ];

  const handleStartGame = (category?: PuzzleCategory) => {
    if (category) {
      setSelectedCategory(category);
    }
    setGameState("playing");
    setScore(0);
    setTimeElapsed(0);
    // Load first puzzle for selected category
  };

  const handlePauseGame = () => {
    setGameState("paused");
  };

  const handleResumeGame = () => {
    setGameState("playing");
  };

  const handleCompleteGame = (finalScore: number) => {
    setScore(finalScore);
    setGameState("completed");
  };

  const handleBackToMenu = () => {
    setGameState("menu");
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const handlePuzzleSubmit = (solution: string) => {
    // Validate solution and award points
    console.log("Solution submitted:", solution);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden ${className}`}>
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToDashboard}
            className="text-white/80 hover:text-white transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-white">Coding Puzzle</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowStats(!showStats)}
            className="bg-white/10 backdrop-blur-lg text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
          >
            Stats
          </button>
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="bg-white/10 backdrop-blur-lg text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
          >
            Leaderboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-6">
        <AnimatePresence mode="wait">
          {gameState === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-white">Coding Challenge</h2>
                <p className="text-white/70 text-lg max-w-md mx-auto">
                  Sharpen your programming skills with coding puzzles and challenges
                </p>
              </div>
              
              {/* Category Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => handleStartGame(category.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-left hover:bg-white/20 transition-colors duration-200 border border-white/20"
                  >
                    <h3 className="text-xl font-semibold text-white mb-2">{category.label}</h3>
                    <p className="text-white/70 text-sm">{category.description}</p>
                  </motion.button>
                ))}
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setGameState("instructions")}
                  className="bg-white/10 backdrop-blur-lg text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-white/20 transition-colors duration-200"
                >
                  How to Play
                </button>
              </div>
            </motion.div>
          )}

          {gameState === "instructions" && (
            <motion.div
              key="instructions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Instructions
                gameType="coding-puzzle"
                onClose={() => setGameState("menu")}
                onStartGame={() => handleStartGame()}
              />
            </motion.div>
          )}

          {(gameState === "playing" || gameState === "paused") && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <PuzzleDisplay
                    puzzle={currentPuzzle}
                    category={selectedCategory}
                    gameState={gameState}
                  />
                  
                  <PuzzleInput
                    onSubmit={handlePuzzleSubmit}
                    disabled={gameState === "paused"}
                  />
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-2">Category</h3>
                    <p className="text-white/70 capitalize">{selectedCategory.replace("-", " ")}</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-2">Score</h3>
                    <p className="text-2xl font-bold text-white">{score}</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-2">Time</h3>
                    <p className="text-xl font-mono text-white">{Math.floor(timeElapsed / 60)}:{String(timeElapsed % 60).padStart(2, '0')}</p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      {showHint ? "Hide" : "Show"} Hint
                    </button>
                    
                    {gameState === "playing" ? (
                      <button
                        onClick={handlePauseGame}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        Pause
                      </button>
                    ) : (
                      <button
                        onClick={handleResumeGame}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        Resume
                      </button>
                    )}
                    
                    <button
                      onClick={handleBackToMenu}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      End Game
                    </button>
                  </div>
                </div>
              </div>
              
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <PuzzleHint puzzle={currentPuzzle} />
                </motion.div>
              )}
            </motion.div>
          )}

          {gameState === "completed" && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <PuzzleCompletedModal
                score={score}
                timeElapsed={timeElapsed}
                category={selectedCategory}
                onPlayAgain={() => {
                  setGameState("menu");
                  setScore(0);
                  setTimeElapsed(0);
                }}
                onBackToDashboard={handleBackToDashboard}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Stats Sidebar */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed top-0 right-0 h-full w-80 bg-black/50 backdrop-blur-lg z-50 p-6"
          >
            <PuzzleStats onClose={() => setShowStats(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard Sidebar */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed top-0 right-0 h-full w-80 bg-black/50 backdrop-blur-lg z-50 p-6"
          >
            <Leaderboard
              gameType="coding-puzzle"
              onClose={() => setShowLeaderboard(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}