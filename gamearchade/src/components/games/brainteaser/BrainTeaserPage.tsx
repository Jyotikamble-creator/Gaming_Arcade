"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Instructions from "../../shared/Instructions";
import Leaderboard from "../../leaderboard/Leaderboard";
import BrainTeaserStats from "./BrainTeaserStats";
import BrainTeaserDisplay from "./BrainTeaserDisplay";
import BrainTeaserCompletedModal from "./BrainTeaserCompletedModal";
import AnimatedBackground from "../../AnimatedBackground";
import {
  getQuestionSequenceForRound,
  calculateBrainTeaserScore,
  validateBrainTeaserAnswer,
  type BrainTeaserDifficulty,
  type BrainTeaserQuestion,
} from "@/lib/games/brain-teaser-simple";

interface User {
  id: string;
  name: string;
  email?: string;
  displayName?: string;
}

interface BrainTeaserPageProps {
  user?: User | null;
  className?: string;
}

interface ScoreData {
  game: string;
  score: number;
  difficulty: BrainTeaserDifficulty;
  metadata: Record<string, any>;
}

const BrainTeaserPage: React.FC<BrainTeaserPageProps> = ({
  user,
  className = "",
}) => {
  const router = useRouter();

  // Game state
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<BrainTeaserDifficulty>("medium");
  const [questionSequence, setQuestionSequence] = useState<BrainTeaserQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<BrainTeaserQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [attempts, setAttempts] = useState<number>(0);
  const [answered, setAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCompletedModal, setShowCompletedModal] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [gameTime, setGameTime] = useState<number>(0);

  // Load question sequence for a round (5 questions)
  const loadQuestionSequence = async (selectedDiff: BrainTeaserDifficulty) => {
    try {
      setIsLoading(true);

      console.log("[BRAIN_TEASER] Loading question sequence for difficulty:", selectedDiff);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const questions = getQuestionSequenceForRound(selectedDiff, 5);

      console.log("[BRAIN_TEASER] Loaded sequence of", questions.length, "questions");

      setQuestionSequence(questions);
      setCurrentQuestionIndex(0);
      setRoundScores([]);
      setTotalScore(0);

      // Load first question
      if (questions.length > 0) {
        setCurrentQuestion(questions[0]);
        setUserAnswer("");
        setAttempts(0);
        setAnswered(false);
        setIsCorrect(false);
        setStartTime(Date.now());
        setGameTime(0);
      }
    } catch (error) {
      console.error("[BRAIN_TEASER] Error loading question sequence:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load next question in sequence
  const loadNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex >= questionSequence.length) {
      // All questions completed!
      console.log("[BRAIN_TEASER] All questions completed! Final Score:", totalScore);
      submitScore(totalScore);
      setShowCompletedModal(true);
      return;
    }

    const nextQuestion = questionSequence[nextIndex];
    setCurrentQuestionIndex(nextIndex);
    setCurrentQuestion(nextQuestion);
    setUserAnswer("");
    setAttempts(0);
    setAnswered(false);
    setIsCorrect(false);
    setStartTime(Date.now());
    setGameTime(0);
  };

  // Submit answer
  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim()) return;

    console.log("[BRAIN_TEASER] Checking answer:", userAnswer, "against:", currentQuestion.answer);

    const correct = validateBrainTeaserAnswer(userAnswer, currentQuestion.answer);

    if (correct) {
      setIsCorrect(true);
      setAnswered(true);
      const questionScore = calculateBrainTeaserScore(difficulty, attempts, gameTime);

      // Store score for this question
      const newScores = [...roundScores, questionScore];
      setRoundScores(newScores);
      setTotalScore((prev) => prev + questionScore);

      console.log(
        "[BRAIN_TEASER] Correct! Question Score:",
        questionScore,
        "Total:",
        totalScore + questionScore
      );
    } else {
      setAttempts((prev) => prev + 1);
      console.log("[BRAIN_TEASER] Incorrect. Attempts:", attempts + 1);
    }
  };

  // Reveal hint
  const handleRevealHint = () => {
    // Hint reveal logic
    console.log("[BRAIN_TEASER] Hint revealed:", currentQuestion?.hint);
  };

  // Move to next question
  const handleNextQuestion = () => {
    loadNextQuestion();
  };

  // Start game with difficulty
  const startGame = (selectedDifficulty: BrainTeaserDifficulty) => {
    console.log("[BRAIN_TEASER] Starting game with difficulty:", selectedDifficulty);
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
    loadQuestionSequence(selectedDifficulty);
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setDifficulty("medium");
    setQuestionSequence([]);
    setCurrentQuestionIndex(0);
    setCurrentQuestion(null);
    setUserAnswer("");
    setAttempts(0);
    setAnswered(false);
    setIsCorrect(false);
    setRoundScores([]);
    setTotalScore(0);
    setShowCompletedModal(false);
  };

  // Submit score to leaderboard
  const submitScore = async (finalScore: number) => {
    if (!user) return;

    try {
      const scoreData: ScoreData = {
        game: "brain-teaser",
        score: finalScore,
        difficulty,
        metadata: { attempts, questionsAnswered: currentQuestionIndex + 1 },
      };

      await fetch("/api/games/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scoreData),
      });

      console.log("[BRAIN_TEASER] Score submitted successfully");
    } catch (error) {
      console.error("[BRAIN_TEASER] Error submitting score:", error);
    }
  };

  // Timer effect
  React.useEffect(() => {
    if (gameStarted && startTime && !isCorrect) {
      const interval = setInterval(() => {
        setGameTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStarted, startTime, isCorrect]);

  // Difficulty Selection Screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Title */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-yellow-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                🧠 Brain Teaser
              </h1>
              <p className="text-gray-300 text-xl mb-4">
                Test your logic and reasoning skills!
              </p>
              <p className="text-gray-400 text-lg">
                Select a difficulty level to begin
              </p>
            </div>

            {/* Difficulty Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {/* Easy */}
              <button
                onClick={() => startGame("easy")}
                className="group relative overflow-hidden rounded-xl bg-linear-to-br from-green-500/20 to-emerald-600/20 border border-green-500/50 p-8 hover:border-green-400 hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">🌱</div>
                  <h3 className="text-3xl font-bold text-green-400 mb-3">Easy</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ Simple riddles</li>
                    <li>✓ Common objects</li>
                    <li>✓ 1x Points multiplier</li>
                  </ul>
                </div>
              </button>

              {/* Medium */}
              <button
                onClick={() => startGame("medium")}
                className="group relative overflow-hidden rounded-xl bg-linear-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/50 p-8 hover:border-yellow-400 hover:from-yellow-500/30 hover:to-orange-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">⚡</div>
                  <h3 className="text-3xl font-bold text-yellow-400 mb-3">Medium</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ Tricky questions</li>
                    <li>✓ Creative thinking</li>
                    <li>✓ 2x Points multiplier</li>
                  </ul>
                </div>
              </button>

              {/* Hard */}
              <button
                onClick={() => startGame("hard")}
                className="group relative overflow-hidden rounded-xl bg-linear-to-br from-red-500/20 to-pink-600/20 border border-red-500/50 p-8 hover:border-red-400 hover:from-red-500/30 hover:to-pink-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">🔥</div>
                  <h3 className="text-3xl font-bold text-red-400 mb-3">Hard</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ Complex riddles</li>
                    <li>✓ Deep logic</li>
                    <li>✓ 3x Points multiplier</li>
                  </ul>
                </div>
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8">
              <h3 className="text-white font-semibold mb-4 text-center text-lg">How to Play</h3>
              <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                <div className="space-y-2">
                  <p>📝 Read the brain teaser carefully</p>
                  <p>✏️ Type your answer in the input field</p>
                </div>
                <div className="space-y-2">
                  <p>✅ Get it right to earn points</p>
                  <p>💡 Use hints to help you (affects scoring)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading question...</p>
        </div>
      </div>
    );
  }

  // Main game view
  return (
    <div className={`min-h-screen text-white relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
      <AnimatedBackground />

      <div className="container mx-auto px-4 py-8 max-w-3xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-linear-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
            🧠 Brain Teaser
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-300">
            <span>Difficulty: <span className="font-bold text-yellow-400 capitalize">{difficulty}</span></span>
            <span className="hidden sm:inline text-gray-500">•</span>
            <span>Question: <span className="font-bold text-blue-400">{currentQuestionIndex}/5</span></span>
            <span className="hidden sm:inline text-gray-500">•</span>
            <span>Score: <span className="font-bold text-green-400">{totalScore}</span></span>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-linear-to-r from-blue-500 to-purple-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentQuestionIndex / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Game Stats */}
        <BrainTeaserStats
          attempts={attempts}
          answered={answered}
          isCorrect={isCorrect}
          score={roundScores[currentQuestionIndex] || 0}
        />

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="brain-teaser" />
        </div>

        {/* Game Board */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700 mb-6">
          {/* Question Display */}
          <div className="mb-8">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-gray-700">
              <p className="text-2xl leading-relaxed text-white font-semibold">
                {currentQuestion.question}
              </p>
              <p className="text-sm text-gray-400 mt-4">Category: <span className="text-gray-300">{currentQuestion.category}</span></p>
            </div>
          </div>

          {/* Answer Input */}
          {!isCorrect && (
            <div className="mb-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-white text-lg font-semibold mb-4 text-center">
                  Your Answer
                </h3>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitAnswer();
                  }}
                  className="space-y-4"
                >
                  <div className="flex justify-center">
                    <div className="relative w-full max-w-md">
                      <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        disabled={answered}
                        placeholder={answered ? "Answer submitted" : "Enter your answer..."}
                        className={`
                          w-full px-4 py-3 text-xl font-semibold text-center rounded-lg border-2
                          transition-all duration-200 focus:outline-none focus:ring-2
                          ${answered
                          ? "bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed"
                          : "bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
                        }
                        `}
                        maxLength={50}
                      />

                      {userAnswer && !answered && (
                        <button
                          type="button"
                          onClick={() => setUserAnswer("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      type="submit"
                      disabled={!userAnswer.trim() || answered}
                      className={`
                        px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 transform
                        ${!userAnswer.trim() || answered
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-linear-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white hover:scale-105 shadow-lg"
                      }
                      `}
                    >
                      {isCorrect ? "✓ Correct!" : "🎯 Submit Answer"}
                    </button>

                    {!isCorrect && !answered && currentQuestion.hint && (
                      <button
                        type="button"
                        onClick={handleRevealHint}
                        className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        💡 Hint: {currentQuestion.hint}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Correct Message */}
          {isCorrect && (
            <div className="mt-6 text-center">
              <p className="text-2xl font-bold text-green-400 mb-4">🎉 Correct!</p>
              <p className="text-xl text-gray-300 mb-6">
                Answer: <span className="font-bold text-yellow-400">{currentQuestion.answer}</span>
              </p>
              <p className="text-lg text-green-400 mb-6">
                Points: <span className="font-bold">+{roundScores[currentQuestionIndex] || 0}</span>
              </p>
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all duration-200"
              >
                {currentQuestionIndex >= questionSequence.length - 1 ? "📊 View Results" : "Next Question →"}
              </button>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard gameType="brain-teaser" />
        </div>
      </div>

      {/* Completed Modal */}
      {showCompletedModal && (
        <BrainTeaserCompletedModal
          score={totalScore}
          onClose={() => {
            setShowCompletedModal(false);
            resetGame();
          }}
        />
      )}
    </div>
  );
};

export default BrainTeaserPage;