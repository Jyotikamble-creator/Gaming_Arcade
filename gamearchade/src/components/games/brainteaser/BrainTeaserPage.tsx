"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Instructions from "../../shared/Instructions";
import Leaderboard from "../../leaderboard/Leaderboard";
import BrainTeaserStats from "./BrainTeaserStats";
import BrainTeaserDisplay from "./BrainTeaserDisplay";
import BrainTeaserTimer from "./BrainTeaserTimer";
import BrainTeaserCompletedModal from "./BrainTeaserCompletedModal";
import AnimatedBackground from "../../AnimatedBackground";

type BrainTeaserPageProps = {
  initialPuzzle?: any;
  user?: any;
  className?: string;
};

type GameState = "menu" | "playing" | "paused" | "completed" | "instructions";

const BRAIN_TEASERS = [
  { id: 1, question: "I have cities, but no buildings. I have mountains, but no trees. I have water, but no fish. What am I?", answer: "map" },
  { id: 2, question: "The more you take, the more you leave behind. What am I?", answer: "footsteps" },
  { id: 3, question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?", answer: "echo" },
  { id: 4, question: "What comes once in a minute, twice in a moment, and never in one hundred years?", answer: "letter m" },
  { id: 5, question: "I have hands, but cannot clap. What am I?", answer: "clock" },
  { id: 6, question: "What has a head and a tail but no body?", answer: "coin" },
  { id: 7, question: "I am always coming but never arrive. What am I?", answer: "tomorrow" },
  { id: 8, question: "What can travel around the world while staying in a corner?", answer: "stamp" },
  { id: 9, question: "I am taken from a mine and shut up in a wooden case, from which I am never released, yet I am used by almost everyone. What am I?", answer: "pencil" },
  { id: 10, question: "What gets wet while drying?", answer: "towel" }
];

function getRandomPuzzle() {
  return BRAIN_TEASERS[Math.floor(Math.random() * BRAIN_TEASERS.length)];
}

export default function BrainTeaserPage({ 
  initialPuzzle, 
  user, 
  className = "" 
}: BrainTeaserPageProps) {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>("playing");
  const [currentPuzzle, setCurrentPuzzle] = useState(initialPuzzle);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Initialize puzzle on mount
  useEffect(() => {
    if (!currentPuzzle && gameState === "playing") {
      setCurrentPuzzle(getRandomPuzzle());
    }
  }, [gameState, currentPuzzle]);

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

  const handleNextPuzzle = () => {
    setCurrentPuzzle(getRandomPuzzle());
  };

  const handleBackToMenu = () => {
    setGameState("menu");
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className={`min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden ${className}`}>
      <AnimatedBackground />
      
      {/* Main Content */}
      <main className="relative z-10 p-6">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Instructions */}
          <div className="mb-8">
            <Instructions gameType="brain-teaser" />
          </div>

          {/* Timer and Game Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-3">
              {/* Timer */}
              <div className="mb-6">
                <BrainTeaserTimer
                  isRunning={gameState === "playing"}
                  onTimeUpdate={setTimeElapsed}
                />
              </div>

              {/* Game Display */}
              {(gameState === "playing" || gameState === "paused") && (
                <div>
                  <BrainTeaserDisplay
                    puzzle={currentPuzzle}
                    gameState={gameState}
                    onPuzzleComplete={(points) => {
                      setScore(prev => prev + points);
                      handleNextPuzzle();
                    }}
                  />
                </div>
              )}

              {gameState === "completed" && (
                <BrainTeaserCompletedModal
                  score={score}
                  timeElapsed={timeElapsed}
                  onPlayAgain={() => {
                    setGameState("playing");
                    setScore(0);
                    setTimeElapsed(0);
                  }}
                  onBackToDashboard={handleBackToDashboard}
                />
              )}
            </div>

            {/* Score */}
            <div className="space-y-6">
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
                  onClick={() => {
                    setGameState("playing");
                    setScore(0);
                    setTimeElapsed(0);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  New Game
                </button>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="mt-12">
            <Leaderboard gameType="brain-teaser" />
          </div>
        </div>
      </main>
    </div>
  );
}