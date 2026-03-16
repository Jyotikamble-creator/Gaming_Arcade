"use client"
import React, { useState, useEffect, useCallback } from 'react';
import SpeedMathProblem from './SpeedMathProblem';
import SpeedMathStats from './SpeedMathStats';
import SpeedMathTimer from './SpeedMathTimer';
import SpeedMathCompletedModal from './SpeedMathCompletedModal';

interface Problem {
  question: string;
  answer: number;
  operation: string;
}

const GAME_DURATION = 60; // 60 seconds

export default function SpeedMath() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState('');

  // Generate random math problems
  const generateProblems = useCallback(() => {
    const operations = ['+', '-', '*'];
    const newProblems: Problem[] = [];

    for (let i = 0; i < 50; i++) {
      const operation = operations[Math.floor(Math.random() * operations.length)];
      let num1: number, num2: number, answer: number;

      switch (operation) {
        case '+':
          num1 = Math.floor(Math.random() * 50) + 1;
          num2 = Math.floor(Math.random() * 50) + 1;
          answer = num1 + num2;
          break;
        case '-':
          num1 = Math.floor(Math.random() * 100) + 50;
          num2 = Math.floor(Math.random() * num1) + 1;
          answer = num1 - num2;
          break;
        case '*':
          num1 = Math.floor(Math.random() * 12) + 1;
          num2 = Math.floor(Math.random() * 12) + 1;
          answer = num1 * num2;
          break;
        default:
          num1 = 1;
          num2 = 1;
          answer = 2;
      }

      newProblems.push({
        question: `${num1} ${operation} ${num2}`,
        answer,
        operation
      });
    }

    return newProblems;
  }, []);

  // Initialize game
  useEffect(() => {
    setProblems(generateProblems());
  }, [generateProblems]);

  // Timer effect
  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameCompleted(true);
    }
  }, [gameStarted, timeLeft]);

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setCurrentProblemIndex(0);
    setStreak(0);
    setBestStreak(0);
    setUserAnswer('');
    setFeedback('');
  };

  const handleSubmit = () => {
    const currentProblem = problems[currentProblemIndex];
    const isCorrect = parseInt(userAnswer) === currentProblem.answer;

    if (isCorrect) {
      setScore(score + 10);
      setStreak(streak + 1);
      setBestStreak(Math.max(bestStreak, streak + 1));
      setFeedback('Correct! +10 points');
    } else {
      setStreak(0);
      setFeedback(`Wrong! Answer was ${currentProblem.answer}`);
    }

    setTimeout(() => {
      if (currentProblemIndex < problems.length - 1) {
        setCurrentProblemIndex(currentProblemIndex + 1);
        setUserAnswer('');
        setFeedback('');
      } else {
        setGameCompleted(true);
      }
    }, 1500);
  };

  const handleSkip = () => {
    setStreak(0);
    setFeedback('Skipped');
    setTimeout(() => {
      if (currentProblemIndex < problems.length - 1) {
        setCurrentProblemIndex(currentProblemIndex + 1);
        setUserAnswer('');
        setFeedback('');
      } else {
        setGameCompleted(true);
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && userAnswer.trim()) {
      handleSubmit();
    }
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 shadow-2xl text-center">
          <h1 className="text-4xl font-bold text-white mb-6">Speed Math</h1>
          <p className="text-gray-300 mb-8">Solve as many math problems as you can in 60 seconds!</p>
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <SpeedMathCompletedModal
        score={score}
        problemsSolved={currentProblemIndex + 1}
        bestStreak={bestStreak}
        onRestart={startGame}
      />
    );
  }

  const currentProblem = problems[currentProblemIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <SpeedMathStats
            score={score}
            problemsSolved={currentProblemIndex + 1}
            streak={streak}
            bestStreak={bestStreak}
          />
          <SpeedMathTimer timeLeft={timeLeft} />
        </div>

        {currentProblem && (
          <SpeedMathProblem
            problem={currentProblem}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            onSubmit={handleSubmit}
            onSkip={handleSkip}
            onKeyPress={handleKeyPress}
            feedback={feedback}
          />
        )}
      </div>
    </div>
  );
}