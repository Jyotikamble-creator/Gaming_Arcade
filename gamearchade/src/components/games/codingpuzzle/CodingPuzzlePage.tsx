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

const CODING_PUZZLES: { [key in PuzzleCategory]: any[] } = {
  logic: [
    { id: 1, question: "Write a function that returns true if a number is even", code: "function isEven(n) { // Your code here }", answer: "return n % 2 === 0;", hint: "Use the modulo operator" },
    { id: 2, question: "Write a function to check if a string is a palindrome", code: "function isPalindrome(str) { // Your code here }", answer: "return str === str.split('').reverse().join('');", hint: "Reverse the string and compare" },
    { id: 3, question: "Write a function to find the largest of two numbers", code: "function max(a, b) { // Your code here }", answer: "return a > b ? a : b;", hint: "Use a ternary operator" },
  ],
  patterns: [
    { id: 1, question: "Write a function that returns the next number in the sequence: 1, 1, 2, 3, 5, 8...", code: "function fibonacci(n) { // Your code here }", answer: "if (n <= 1) return n; return fibonacci(n-1) + fibonacci(n-2);", hint: "Each number is the sum of the previous two" },
    { id: 2, question: "Write a function to find the pattern in array [1, 2, 4, 8, 16...]", code: "function nextPower(arr) { // Your code here }", answer: "return arr[arr.length - 1] * 2;", hint: "Each number is double the previous" },
  ],
  algorithms: [
    { id: 1, question: "Write a function to perform binary search on a sorted array", code: "function binarySearch(arr, target) { // Your code here }", answer: "let left = 0, right = arr.length - 1; while (left <= right) { const mid = Math.floor((left + right) / 2); if (arr[mid] === target) return mid; if (arr[mid] < target) left = mid + 1; else right = mid - 1; } return -1;", hint: "Divide the search space in half each time" },
    { id: 2, question: "Write a function to merge two sorted arrays", code: "function merge(arr1, arr2) { // Your code here }", answer: "return [...arr1, ...arr2].sort((a, b) => a - b);", hint: "Combine arrays and sort them" },
  ],
  "data-structures": [
    { id: 1, question: "Write a function to find the length of the longest substring without repeating characters", code: "function lengthOfLongestSubstring(s) { // Your code here }", answer: "const seen = new Set(); let max = 0, start = 0; for (let i = 0; i < s.length; i++) { while (seen.has(s[i])) { seen.delete(s[start++]); } seen.add(s[i]); max = Math.max(max, i - start + 1); } return max;", hint: "Use a sliding window technique" },
    { id: 2, question: "Write a function to find the first non-repeating character in a string", code: "function firstNonRepeating(s) { // Your code here }", answer: "const count = {}; for (const char of s) { count[char] = (count[char] || 0) + 1; } for (const char of s) { if (count[char] === 1) return char; } return null;", hint: "Count character frequencies first" },
  ]
};

function getRandomPuzzle(category: PuzzleCategory) {
  const puzzles = CODING_PUZZLES[category];
  return puzzles[Math.floor(Math.random() * puzzles.length)];
}

export default function CodingPuzzlePage({ 
  initialPuzzle, 
  user, 
  className = "" 
}: CodingPuzzlePageProps) {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>("playing");
  const [currentPuzzle, setCurrentPuzzle] = useState(initialPuzzle);
  const [selectedCategory, setSelectedCategory] = useState<PuzzleCategory>("logic");
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info" | "">("");

  const categories: { id: PuzzleCategory; label: string; description: string }[] = [
    { id: "logic", label: "Logic", description: "Boolean logic and reasoning puzzles" },
    { id: "patterns", label: "Patterns", description: "Sequence and pattern recognition" },
    { id: "algorithms", label: "Algorithms", description: "Algorithm implementation challenges" },
    { id: "data-structures", label: "Data Structures", description: "Array, object, and tree problems" }
  ];

  // Initialize puzzle on mount
  useEffect(() => {
    if (!currentPuzzle && gameState === "playing") {
      setCurrentPuzzle(getRandomPuzzle(selectedCategory));
    }
  }, [gameState, currentPuzzle, selectedCategory]);

  const handleStartGame = (category?: PuzzleCategory) => {
    if (category) {
      setSelectedCategory(category);
    }
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
    setCurrentPuzzle(getRandomPuzzle(selectedCategory));
  };

  const handleBackToMenu = () => {
    setGameState("menu");
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const handlePuzzleSubmit = (solution: string) => {
    // Validate solution against the correct answer
    if (!currentPuzzle || !solution.trim()) {
      setMessage("Please enter a solution!");
      setMessageType("error");
      return;
    }

    // Check if the answer is correct (simple validation)
    const isCorrect = currentPuzzle.answer.toLowerCase().includes(solution.toLowerCase().trim()) || 
                     solution.toLowerCase().trim().includes(currentPuzzle.answer.toLowerCase());
    
    if (isCorrect) {
      const points = 10;
      setScore(prev => prev + points);
      setMessage(`🎉 Correct! You earned ${points} points!`);
      setMessageType("success");
      console.log("Correct answer! Score awarded.");
      
      setTimeout(() => {
        setMessage("");
        setMessageType("");
        handleNextPuzzle();
      }, 2000);
    } else {
      setMessage(`❌ Incorrect! The answer was: ${currentPuzzle.answer.split(";")[0]}`);
      setMessageType("error");
      console.log("Incorrect answer. No points awarded.");
      
      setTimeout(() => {
        setMessage("");
        setMessageType("");
        handleNextPuzzle();
      }, 2000);
    }
  };

  return (
    <div className={`min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden ${className}`}>
      <AnimatedBackground />
      <main className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
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
              <Instructions gameType="coding-puzzle" />
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

                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg text-center font-semibold text-lg ${
                        messageType === "success"
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : messageType === "error"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {message}
                    </motion.div>
                  )}
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
            <Leaderboard gameType="coding-puzzle" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}