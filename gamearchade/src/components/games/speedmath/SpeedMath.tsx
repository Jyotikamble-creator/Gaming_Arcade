"use client"
import React, { useState, useEffect, useCallback } from 'react';
import Instructions from '@/components/shared/Instructions';
import SpeedMathProblem from './SpeedMathProblem';
import SpeedMathStats from './SpeedMathStats';
import SpeedMathTimer from './SpeedMathTimer';
import SpeedMathCompletedModal from './SpeedMathCompletedModal';

interface Problem {
  question: string;
  answer: number;
  operation: string;
}

type SpeedMathDifficulty = 'easy' | 'medium' | 'hard';

const GAME_DURATION = 60;

const DIFFICULTY_CONFIG: Record<SpeedMathDifficulty, { label: string; points: number; buttonClass: string; description: string }> = {
  easy: {
    label: 'Easy',
    points: 5,
    buttonClass: 'bg-green-600 text-white shadow-lg shadow-green-500/50 scale-105',
    description: 'Addition & subtraction up to 50'
  },
  medium: {
    label: 'Medium',
    points: 10,
    buttonClass: 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/50 scale-105',
    description: 'Mixed operations up to 100'
  },
  hard: {
    label: 'Hard',
    points: 15,
    buttonClass: 'bg-red-600 text-white shadow-lg shadow-red-500/50 scale-105',
    description: 'Large numbers & challenging problems'
  }
};

export default function SpeedMath() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<SpeedMathDifficulty | null>(null);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [problemsSolved, setProblemsSolved] = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState('');

  // Generate random math problem based on difficulty
  const generateProblem = useCallback((): Problem => {
    const operations = ['+', '-', '*'];
    let num1 = 1;
    let num2 = 1;
    let operation = '+';
    let answer = 2;

    if (!selectedDifficulty) {
      return { question: '1 + 1', answer: 2, operation: '+' };
    }

    if (selectedDifficulty === 'easy') {
      operation = Math.random() > 0.5 ? '+' : '-';
      if (operation === '+') {
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = num1 + num2;
      } else {
        num1 = Math.floor(Math.random() * 30) + 10;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
      }
    } else if (selectedDifficulty === 'medium') {
      operation = operations[Math.floor(Math.random() * operations.length)];
      if (operation === '+') {
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
      } else if (operation === '-') {
        num1 = Math.floor(Math.random() * 100) + 20;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
      } else {
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
      }
    } else {
      operation = operations[Math.floor(Math.random() * operations.length)];
      if (operation === '+') {
        num1 = Math.floor(Math.random() * 100) + 50;
        num2 = Math.floor(Math.random() * 100) + 50;
        answer = num1 + num2;
      } else if (operation === '-') {
        num1 = Math.floor(Math.random() * 200) + 50;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
      } else {
        num1 = Math.floor(Math.random() * 20) + 5;
        num2 = Math.floor(Math.random() * 20) + 5;
        answer = num1 * num2;
      }
    }

    return {
      question: `${num1} ${operation} ${num2}`,
      answer,
      operation
    };
  }, [selectedDifficulty]);

  // Timer effect
  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted) {
      setGameCompleted(true);
      setGameStarted(false);
    }
  }, [gameStarted, timeLeft]);

  const startGame = () => {
    if (!selectedDifficulty) return;

    setGameStarted(true);
    setGameCompleted(false);
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setProblemsSolved(0);
    setTotalProblems(0);
    setStreak(0);
    setBestStreak(0);
    setUserAnswer('');
    setFeedback('');
    setCurrentProblem(generateProblem());
  };

  const onBackToMenu = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setScore(0);
    setProblemsSolved(0);
    setTotalProblems(0);
    setTimeLeft(GAME_DURATION);
    setStreak(0);
    setBestStreak(0);
    setUserAnswer('');
    setFeedback('');
    setCurrentProblem(null);
  };

  const handleSubmit = () => {
    if (!currentProblem || !selectedDifficulty || !userAnswer.trim()) return;

    const isCorrect = parseInt(userAnswer) === currentProblem.answer;
    setTotalProblems((prev) => prev + 1);

    if (isCorrect) {
      const basePoints = DIFFICULTY_CONFIG[selectedDifficulty].points;
      const streakBonus = Math.floor(streak / 3) * 5;
      const points = basePoints + streakBonus;

      setScore((prev) => prev + points);
      setProblemsSolved((prev) => prev + 1);
      setStreak((prev) => {
        const newStreak = prev + 1;
        setBestStreak((currentBest) => Math.max(currentBest, newStreak));
        return newStreak;
      });
      setFeedback(`Correct! +${points} points`);

      setTimeout(() => {
        setCurrentProblem(generateProblem());
        setUserAnswer('');
        setFeedback('');
      }, 500);
    } else {
      setStreak(0);
      setFeedback(`Wrong! Answer was ${currentProblem.answer}`);

      setTimeout(() => {
        setCurrentProblem(generateProblem());
        setUserAnswer('');
        setFeedback('');
      }, 1500);
    }
  };

  const handleSkip = () => {
    setTotalProblems((prev) => prev + 1);
    setStreak(0);
    setFeedback('Skipped');

    setTimeout(() => {
      setCurrentProblem(generateProblem());
      setUserAnswer('');
      setFeedback('');
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && userAnswer.trim()) {
      handleSubmit();
    }
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
        <div className="bg-transparent backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 shadow-2xl text-center max-w-2xl w-full">
          <h1 className="text-4xl font-bold text-white mb-6">Speed Math</h1>
          <p className="text-gray-300 mb-8">Solve as many problems as you can in 60 seconds!</p>

          <div className="max-w-md mx-auto mb-6">
            <Instructions gameType="speed-math" />
          </div>

          <div className="mb-6">
            <p className="text-2xl font-bold text-white mb-4">Choose Difficulty</p>
            <div className="space-y-4 mb-8">
              {(Object.keys(DIFFICULTY_CONFIG) as SpeedMathDifficulty[]).map((difficulty) => (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    selectedDifficulty === difficulty
                      ? DIFFICULTY_CONFIG[difficulty].buttonClass
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {DIFFICULTY_CONFIG[difficulty].label} ({DIFFICULTY_CONFIG[difficulty].points} pts)
                  <div className="text-sm font-normal mt-1">{DIFFICULTY_CONFIG[difficulty].description}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            disabled={!selectedDifficulty}
            className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed disabled:opacity-50 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/50 hover:scale-105 disabled:hover:scale-100"
          >
            {selectedDifficulty ? 'Start Game' : 'Select a Difficulty First'}
          </button>
        </div>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <SpeedMathCompletedModal
        score={score}
        problemsSolved={problemsSolved}
        totalProblems={totalProblems}
        difficulty={selectedDifficulty}
        bestStreak={bestStreak}
        onRestart={startGame}
        onBackToMenu={onBackToMenu}
      />
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <SpeedMathStats
            score={score}
            problemsSolved={problemsSolved}
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