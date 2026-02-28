// Speed Math Game Page
import React, { useEffect, useState, useCallback } from 'react';
// API and Logger Imports
import { submitScore } from '@/lib/api/client';
// Logger Imports
import { logger } from '@/lib/logger';
// Component Imports
import Instructions from '../../../components/shared/Instructions';
import Leaderboard from '../../../components/leaderboard/Leaderboard';
import SpeedMathProblem from '../../../components/games/speedmath/SpeedMathProblem';
import SpeedMathStats from '../../../components/games/speedmath/SpeedMathStats';
import SpeedMathTimer from '../../../components/games/speedmath/SpeedMathTimer';
import SpeedMathCompletedModal from '../../../components/games/speedmath/SpeedMathCompletedModal';
import AnimatedBackground from '../../../components/AnimatedBackground';

// Main Speed Math Component
export default function SpeedMath(): JSX.Element {
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentProblem, setCurrentProblem] = useState<{
    question: string;
    answer: number;
    operation: string;
  } | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [problemsSolved, setProblemsSolved] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [totalProblems, setTotalProblems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Generate a new math problem based on difficulty
  const generateProblem = useCallback((): {
    question: string;
    answer: number;
    operation: string;
  } => {
    const operations = ['+', '-', '*'];
    let a: number, b: number, op: string, answer: number;

    if (difficulty === 'easy') {
      op = Math.random() > 0.5 ? '+' : '-';
      if (op === '+') {
        a = Math.floor(Math.random() * 20) + 1;
        b = Math.floor(Math.random() * 20) + 1;
        answer = a + b;
      } else {
        a = Math.floor(Math.random() * 30) + 10;
        b = Math.floor(Math.random() * a) + 1;
        answer = a - b;
      }
    } else if (difficulty === 'medium') {
      op = operations[Math.floor(Math.random() * operations.length)];
      if (op === '+') {
        a = Math.floor(Math.random() * 50) + 1;
        b = Math.floor(Math.random() * 50) + 1;
        answer = a + b;
      } else if (op === '-') {
        a = Math.floor(Math.random() * 100) + 20;
        b = Math.floor(Math.random() * a) + 1;
        answer = a - b;
      } else {
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        answer = a * b;
      }
    } else { // hard
      op = operations[Math.floor(Math.random() * operations.length)];
      if (op === '+') {
        a = Math.floor(Math.random() * 100) + 50;
        b = Math.floor(Math.random() * 100) + 50;
        answer = a + b;
      } else if (op === '-') {
        a = Math.floor(Math.random() * 200) + 50;
        b = Math.floor(Math.random() * a) + 1;
        answer = a - b;
      } else {
        a = Math.floor(Math.random() * 20) + 5;
        b = Math.floor(Math.random() * 20) + 5;
        answer = a * b;
      }
    }

    return {
      question: `${a} ${op} ${b}`,
      answer: answer,
      operation: op
    };
  }, [difficulty]);

  // Start game
  const startGame = useCallback((): void => {
    setIsPlaying(true);
    setGameCompleted(false);
    setScore(0);
    setProblemsSolved(0);
    setStreak(0);
    setBestStreak(0);
    setTotalProblems(0);
    setTimeLeft(60);
    setUserAnswer('');
    setFeedback('');
    setCurrentProblem(generateProblem());
    logger.info('Speed Math game started', { difficulty });
  }, [generateProblem, difficulty]);

  // Timer countdown
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isPlaying) {
      endGame();
    }
  }, [timeLeft, isPlaying]);

  // End game
  const endGame = useCallback(async (): Promise<void> => {
    setIsPlaying(false);
    setGameCompleted(true);

    try {
      await submitScore({
        game: 'speed-math',
        score,
        meta: {
          problemsSolved,
          totalProblems,
          difficulty,
          bestStreak,
          accuracy: totalProblems > 0 ? Math.round((problemsSolved / totalProblems) * 100) : 0
        }
      });
      logger.info('Speed Math game completed', {
        score,
        problemsSolved,
        totalProblems,
        difficulty
      });
    } catch (error) {
      logger.error('Failed to submit Speed Math score', error, {});
    }
  }, [score, problemsSolved, totalProblems, difficulty, bestStreak]);

  // Check answer
  const checkAnswer = useCallback((): void => {
    if (!userAnswer.trim()) return;

    setTotalProblems(prev => prev + 1);
    const isCorrect = parseInt(userAnswer) === currentProblem!.answer;

    if (isCorrect) {
      // Calculate points based on difficulty and streak
      let points = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15;
      const streakBonus = Math.floor(streak / 3) * 5; // Bonus every 3 correct
      points += streakBonus;

      setScore(prev => prev + points);
      setProblemsSolved(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
      setFeedback(`Correct! +${points} points`);

      // Generate new problem after short delay
      setTimeout(() => {
        setCurrentProblem(generateProblem());
        setUserAnswer('');
        setFeedback('');
      }, 500);
    } else {
      setStreak(0);
      setFeedback(`Wrong! Answer was ${currentProblem!.answer}`);

      // Generate new problem after showing correct answer
      setTimeout(() => {
        setCurrentProblem(generateProblem());
        setUserAnswer('');
        setFeedback('');
      }, 1500);
    }
  }, [userAnswer, currentProblem, difficulty, streak, generateProblem]);

  // Handle Enter key
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && userAnswer.trim()) {
      checkAnswer();
    }
  }, [userAnswer, checkAnswer]);

  // Skip problem (no penalty, but breaks streak)
  const skipProblem = useCallback((): void => {
    setStreak(0);
    setTotalProblems(prev => prev + 1);
    setFeedback('Skipped');
    setTimeout(() => {
      setCurrentProblem(generateProblem());
      setUserAnswer('');
      setFeedback('');
    }, 500);
  }, [generateProblem]);

  // Back to difficulty selection
  const backToMenu = useCallback((): void => {
    setGameCompleted(false);
    setIsPlaying(false);
    setScore(0);
    setProblemsSolved(0);
    setStreak(0);
    setBestStreak(0);
    setTotalProblems(0);
    setTimeLeft(60);
    setUserAnswer('');
    setFeedback('');
    setCurrentProblem(null);
  }, []);

  // Render component
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text">Setting up Speed Math...</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">ΓÜí Speed Math</h1>
          <p className="text-gray-300">Solve as many problems as you can in 60 seconds!</p>
        </div>

        {/* Instructions */}
        {!isPlaying && !gameCompleted && (
          <div className="max-w-md mx-auto mb-8">
            <Instructions gameType="speed-math" />
          </div>
        )}

        {/* Start Screen */}
        {!isPlaying && !gameCompleted && (
          <div className="max-w-md mx-auto">
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose Difficulty</h2>

              <div className="space-y-4 mb-8">
                <button
                  onClick={() => setDifficulty('easy')}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${difficulty === 'easy'
                      ? 'bg-green-600 text-white shadow-lg shadow-green-500/50 scale-105'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  ≡ƒƒó Easy (5 pts)
                  <div className="text-sm font-normal mt-1">Addition & subtraction up to 50</div>
                </button>

                <button
                  onClick={() => setDifficulty('medium')}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${difficulty === 'medium'
                      ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/50 scale-105'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  ≡ƒƒí Medium (10 pts)
                  <div className="text-sm font-normal mt-1">Mixed operations up to 100</div>
                </button>

                <button
                  onClick={() => setDifficulty('hard')}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${difficulty === 'hard'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-500/50 scale-105'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  ≡ƒö┤ Hard (15 pts)
                  <div className="text-sm font-normal mt-1">Large numbers & challenging problems</div>
                </button>
              </div>

              <button
                onClick={startGame}
                disabled={!difficulty}
                className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed disabled:opacity-50 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/50 hover:scale-105 disabled:hover:scale-100"
              >
                {difficulty ? 'Start Game Γû╢' : 'Select a Difficulty First'}
              </button>
            </div>
          </div>
        )}

        {/* Game Screen */}
        {isPlaying && currentProblem && (
          <div className="max-w-2xl mx-auto">
            {/* Stats */}
            <SpeedMathStats
              score={score}
              problemsSolved={problemsSolved}
              streak={streak}
              bestStreak={bestStreak}
            />

            {/* Timer */}
            <SpeedMathTimer timeLeft={timeLeft} />

            {/* Problem */}
            <SpeedMathProblem
              problem={currentProblem}
              userAnswer={userAnswer}
              setUserAnswer={setUserAnswer}
              onSubmit={checkAnswer}
              onSkip={skipProblem}
              onKeyPress={handleKeyPress}
              feedback={feedback}
            />
          </div>
        )}

        {/* Game Completed Modal */}
        {gameCompleted && (
          <SpeedMathCompletedModal
            score={score}
            problemsSolved={problemsSolved}
            totalProblems={totalProblems}
            bestStreak={bestStreak}
            difficulty={difficulty}
            onRestart={startGame}
            onBackToMenu={backToMenu}
          />
        )}

        {/* Leaderboard */}
        {!isPlaying && (
          <div className="mt-12">
            <Leaderboard game="speed-math" />
          </div>
        )}
      </div>
    </div>
  );
}