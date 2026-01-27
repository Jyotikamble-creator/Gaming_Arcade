"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Instructions from "../shared/Instructions";
import Leaderboard from "../leaderboard/Leaderboard";
import BrainTeaserStats from "./BrainTeaserStats";
import BrainTeaserDisplay from "./BrainTeaserDisplay";
import BrainTeaserTimer from "./BrainTeaserTimer";
import BrainTeaserCompletedModal from "./BrainTeaserCompletedModal";
import AnimatedBackground from "../AnimatedBackground";

type BrainTeaserPageProps = {
  initialPuzzle?: any;
  user?: any;
  className?: string;
};

type GameState = "menu" | "playing" | "paused" | "completed" | "instructions";

export default function BrainTeaserPage({ 
  initialPuzzle, 
  user, 
  className = "" 
}: BrainTeaserPageProps) {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>("menu");
  const [currentPuzzle, setCurrentPuzzle] = useState(initialPuzzle);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleStartGame = () => {
    setGameState("playing");
    setScore(0);
    setTimeElapsed(0);
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
          <h1 className="text-2xl font-bold text-white">Brain Teaser</h1>
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
              className="flex flex-col items-center justify-center min-h-[60vh] space-y-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-white">Brain Teaser Challenge</h2>
                <p className="text-white/70 text-lg max-w-md">
                  Test your cognitive abilities with challenging puzzles and brain teasers
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleStartGame}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors duration-200"
                >
                  Start Game
                </button>
                <button
                  onClick={() => setGameState("instructions")}
                  className="bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-colors duration-200"
                >
                  Instructions
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
                gameType="brain-teaser"
                onClose={() => setGameState("menu")}
                onStartGame={handleStartGame}
              />
            </motion.div>
          )}

          {(gameState === "playing" || gameState === "paused") && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <BrainTeaserDisplay
                    puzzle={currentPuzzle}
                    gameState={gameState}
                    onPuzzleComplete={(points) => {
                      setScore(prev => prev + points);
                      // Generate next puzzle
                    }}
                  />
                </div>
                
                <div className="space-y-6">
                  <BrainTeaserTimer
                    isRunning={gameState === "playing"}
                    onTimeUpdate={setTimeElapsed}
                  />
                  
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-2">Score</h3>
                    <p className="text-2xl font-bold text-white">{score}</p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
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
            </motion.div>
          )}

          {gameState === "completed" && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <BrainTeaserCompletedModal
                score={score}
                timeElapsed={timeElapsed}
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
            <BrainTeaserStats onClose={() => setShowStats(false)} />
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
              gameType="brain-teaser"
              onClose={() => setShowLeaderboard(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}