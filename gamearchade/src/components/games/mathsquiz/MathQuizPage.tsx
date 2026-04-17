'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../shared/DashboardLayout';
import Instructions from '../../shared/Instructions';
import Leaderboard from '../../leaderboard/Leaderboard';
import ProgressBar from './ProgressBar';
import TimerDisplay from './TimerDisplay';
import ActionButton from './ActionButton';
import MathQuestionCard from './MathQuestionCard';
import AnimatedBackground from '../../AnimatedBackground';

// TypeScript interfaces
interface User {
  id: string;
  name: string;
  email?: string;
  displayName?: string;
}

interface MathQuizPageProps {
  user: User | null;
  onBackToDashboard?: () => void;
  className?: string;
}

interface Question {
  id: number;
  q: string;
  options: string[];
  ans: string;
}

type FeedbackStatus = 'none' | 'correct' | 'incorrect';
type GameDifficulty = 'easy' | 'medium' | 'hard';

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: { questionCount: 10, timePerQuestion: 30, scoreMultiplier: 1, label: 'Easy', emoji: '🌱', color: 'green' },
  medium: { questionCount: 15, timePerQuestion: 20, scoreMultiplier: 2, label: 'Medium', emoji: '⚡', color: 'yellow' },
  hard: { questionCount: 20, timePerQuestion: 10, scoreMultiplier: 3, label: 'Hard', emoji: '🔥', color: 'red' }
};

// API functions for math quiz
async function fetchMathQuestions(): Promise<{ data: { questions: Question[] } }> {
  try {
    const response = await fetch('/api/games/math', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching math questions:', error);
    // Return fallback questions
    return {
      data: {
        questions: [
          { id: 1, q: '2 + 2 = ?', options: ['3', '4', '5', '6'], ans: '4' },
          { id: 2, q: '5 × 3 = ?', options: ['12', '15', '18', '20'], ans: '15' },
          { id: 3, q: '10 - 7 = ?', options: ['2', '3', '4', '5'], ans: '3' },
          { id: 4, q: '8 ÷ 2 = ?', options: ['3', '4', '5', '6'], ans: '4' },
          { id: 5, q: '6 + 9 = ?', options: ['13', '15', '16', '17'], ans: '15' },
          { id: 6, q: '4 × 7 = ?', options: ['26', '28', '30', '32'], ans: '28' },
          { id: 7, q: '20 - 8 = ?', options: ['10', '12', '14', '16'], ans: '12' },
          { id: 8, q: '15 ÷ 3 = ?', options: ['4', '5', '6', '7'], ans: '5' },
          { id: 9, q: '9 + 6 = ?', options: ['14', '15', '16', '17'], ans: '15' },
          { id: 10, q: '7 × 8 = ?', options: ['54', '56', '58', '60'], ans: '56' }
        ]
      }
    };
  }
}

async function submitScore(scoreData: { game: string; score: number; difficulty: GameDifficulty; meta: Record<string, any> }): Promise<void> {
  try {
    const response = await fetch('/api/scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        game: scoreData.game,
        score: scoreData.score,
        meta: { ...scoreData.meta, difficulty: scoreData.difficulty }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit score');
    }

    console.log('Score submitted successfully:', scoreData);
  } catch (error) {
    console.error('Error submitting score:', error);
  }
}

const MathQuizPage: React.FC<MathQuizPageProps> = ({ 
  user, 
  onBackToDashboard,
  className 
}) => {
  // Game state
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>('none');

  useEffect(() => {
    if (gameStarted && difficulty) {
      load(difficulty);
    }
  }, [gameStarted, difficulty]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted && !isLoading) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !quizCompleted) {
      handleAnswer(null);
    }
  }, [timeLeft, quizCompleted, isLoading]);

  // Function to load math questions from API
  async function load(selectedDifficulty: GameDifficulty): Promise<void> {
    try {
      setIsLoading(true);
      console.log('[MATH_QUIZ] Loading math questions for difficulty:', selectedDifficulty);
      const res = await fetchMathQuestions();
      const settings = DIFFICULTY_SETTINGS[selectedDifficulty];
      const selectedQuestions = (res.data.questions || []).slice(0, settings.questionCount);
      setQuestions(selectedQuestions);
      setIndex(0);
      setScore(0);
      setQuizCompleted(false);
      setTimeLeft(settings.timePerQuestion);
      setSelectedAnswer(null);
      setFeedbackStatus('none');
      console.log('[MATH_QUIZ] Math questions loaded', { count: selectedQuestions.length, difficulty: selectedDifficulty });
    } catch (error) {
      console.error('[MATH_QUIZ] Failed to load math questions', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle answer selection
  function handleAnswer(selectedOption: string | null): void {
    if (feedbackStatus !== 'none') return;

    const correct = questions[index]?.ans === selectedOption;
    const settings = DIFFICULTY_SETTINGS[difficulty];
    setSelectedAnswer(selectedOption);
    setFeedbackStatus(correct ? 'correct' : 'incorrect');

    if (correct) {
      const baseScore = 10 * settings.scoreMultiplier;
      setScore(s => s + baseScore);
    }

    // Proceed to next question after a delay
    setTimeout(() => {
      const nextIndex = index + 1;
      if (nextIndex >= questions.length) {
        const finalScore = correct ? score + (10 * settings.scoreMultiplier) : score;
        setQuizCompleted(true);
        submitScore({ 
          game: 'math-quiz', 
          score: finalScore, 
          difficulty,
          meta: { questionsAnswered: index + 1, correctAnswers: Math.floor(finalScore / (10 * settings.scoreMultiplier)), multiplier: settings.scoreMultiplier } 
        });
        console.log('[MATH_QUIZ] Math quiz completed', { finalScore, difficulty });
      } else {
        setIndex(nextIndex);
        setTimeLeft(settings.timePerQuestion);
        setSelectedAnswer(null);
        setFeedbackStatus('none');
      }
    }, 1500);
  }

  // Skip current question
  function skipQuestion(): void {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    const nextIndex = index + 1;
    if (nextIndex >= questions.length) {
      setQuizCompleted(true);
      submitScore({ 
        game: 'math-quiz', 
        score, 
        difficulty,
        meta: { questionsAnswered: index + 1, skippedQuestions: 1, multiplier: settings.scoreMultiplier } 
      });
    } else {
      setIndex(nextIndex);
      setTimeLeft(settings.timePerQuestion);
      setSelectedAnswer(null);
      setFeedbackStatus('none');
    }
  }

  // Start game with difficulty
  const startGame = (selectedDifficulty: GameDifficulty) => {
    console.log('[MATH_QUIZ] Starting game with difficulty:', selectedDifficulty);
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setDifficulty('medium');
    setQuestions([]);
    setIndex(0);
    setScore(0);
    setQuizCompleted(false);
    setIsLoading(false);
  };

  // Difficulty Selection Screen
  if (!gameStarted) {
    return (
      <DashboardLayout showBackButton={true} backLink="/dashboard">
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              {/* Title */}
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  ➕ Math Quiz
                </h1>
                <p className="text-gray-300 text-xl mb-4">
                  Test your math skills!
                </p>
                <p className="text-gray-400 text-lg">
                  Select a difficulty level to begin
                </p>
              </div>

              {/* Difficulty Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {/* Easy */}
                <button
                  onClick={() => startGame('easy')}
                  className="group relative overflow-hidden rounded-xl bg-linear-to-br from-green-500/20 to-emerald-600/20 border border-green-500/50 p-8 hover:border-green-400 hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">🌱</div>
                    <h3 className="text-3xl font-bold text-green-400 mb-3">Easy</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 10 questions</li>
                      <li>✓ 30 seconds per question</li>
                      <li>✓ 1x Points multiplier</li>
                    </ul>
                  </div>
                </button>

                {/* Medium */}
                <button
                  onClick={() => startGame('medium')}
                  className="group relative overflow-hidden rounded-xl bg-linear-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/50 p-8 hover:border-yellow-400 hover:from-yellow-500/30 hover:to-orange-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">⚡</div>
                    <h3 className="text-3xl font-bold text-yellow-400 mb-3">Medium</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 15 questions</li>
                      <li>✓ 20 seconds per question</li>
                      <li>✓ 2x Points multiplier</li>
                    </ul>
                  </div>
                </button>

                {/* Hard */}
                <button
                  onClick={() => startGame('hard')}
                  className="group relative overflow-hidden rounded-xl bg-linear-to-br from-red-500/20 to-pink-600/20 border border-red-500/50 p-8 hover:border-red-400 hover:from-red-500/30 hover:to-pink-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">🔥</div>
                    <h3 className="text-3xl font-bold text-red-400 mb-3">Hard</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ 20 questions</li>
                      <li>✓ 10 seconds per question</li>
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
                    <p>📝 Read each math question</p>
                    <p>✅ Select your answer</p>
                  </div>
                  <div className="space-y-2">
                    <p>⏱️ Answer before time runs out</p>
                    <p>🏆 Beat your best score!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <DashboardLayout showBackButton={true} backLink="/dashboard">
        <div className="min-h-screen flex items-center justify-center">
          <AnimatedBackground />
          <div className="text-center relative z-10">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading math questions...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Render error state if no questions
  if (!questions.length) {
    return (
      <DashboardLayout showBackButton={true} backLink="/dashboard">
        <div className="min-h-screen flex items-center justify-center px-4">
          <AnimatedBackground />
          <div className="bg-slate-800/90 backdrop-blur-lg rounded-xl p-8 border border-slate-700 max-w-md w-full text-center relative z-10 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Failed to Load Questions</h2>
            <p className="text-slate-400 mb-6">Unable to load math questions. Please try again.</p>
            <button
              onClick={() => setGameStarted(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full mt-3 bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const q = questions[index];

  if (!q) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">No question found</p>
        </div>
      </div>
    );
  }

  // Render the quiz
  return (
    <DashboardLayout showBackButton={true} backLink="/dashboard">
      <div className={`min-h-screen text-white relative overflow-hidden ${className || ''}`}>
        <div className="absolute inset-0 bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
        <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="math-quiz" />
        </div>

        {/* Progress and Score */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 flex-wrap">
          <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl p-4 text-center border border-slate-700 shadow-lg">
            <span className="text-sm text-slate-400 uppercase tracking-wider">DIFFICULTY</span>
            <div className="text-2xl font-bold"><span className="mr-2">{DIFFICULTY_SETTINGS[difficulty].emoji}</span>{DIFFICULTY_SETTINGS[difficulty].label}</div>
          </div>
          <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl p-4 text-center border border-slate-700 shadow-lg">
            <span className="text-sm text-slate-400 uppercase tracking-wider">QUESTION</span>
            <div className="text-2xl font-bold text-white">{index}/{questions.length}</div>
          </div>
          <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl p-4 text-center border border-slate-700 shadow-lg">
            <span className="text-sm text-slate-400 uppercase tracking-wider">SCORE</span>
            <div className="text-2xl font-bold text-green-400">{score}</div>
          </div>
          <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl p-4 text-center border border-slate-700 shadow-lg">
            <span className="text-sm text-slate-400 uppercase tracking-wider">TIME</span>
            <TimerDisplay minutes={Math.floor(timeLeft / 60)} seconds={timeLeft % 60} />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-8">
          <ProgressBar current={index} total={questions.length} />
        </div>

        {/* Question Card */}
        <MathQuestionCard
          question={q.q}
          options={q.options}
          onAnswer={handleAnswer}
          feedbackStatus={feedbackStatus}
          selectedAnswer={selectedAnswer}
          correctAnswer={q.ans}
        />

        {/* Skip Button */}
        <div className="mb-8">
          <ActionButton onSkip={skipQuestion} />
        </div>

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard gameType="math-quiz" />
        </div>
      </div>

      {/* Quiz Completed Modal */}
      {quizCompleted && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl p-8 text-center shadow-2xl max-w-md w-full border border-slate-700">
            <h2 className="text-3xl font-bold text-green-400 mb-4">🎉 Quiz Completed!</h2>
            
            {/* Difficulty Badge */}
            <div className={`inline-block mb-4 px-4 py-2 rounded-lg font-bold text-white ${
              difficulty === 'easy' ? 'bg-green-600/30 border border-green-500' :
              difficulty === 'medium' ? 'bg-yellow-600/30 border border-yellow-500' :
              'bg-red-600/30 border border-red-500'
            }`}>
              <span className="mr-2">{DIFFICULTY_SETTINGS[difficulty].emoji}</span>
              {DIFFICULTY_SETTINGS[difficulty].label} Mode - {DIFFICULTY_SETTINGS[difficulty].scoreMultiplier}x Points
            </div>
            
            <p className="text-slate-300 mb-2">Your final score:</p>
            <div className="bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-600">
              <p className="text-5xl font-bold text-green-400">{score}</p>
              <p className="text-slate-400 text-sm mt-2">points</p>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Questions answered: <span className="text-white font-semibold">{index + 1}/{questions.length}</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => resetGame()}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Play Again
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};

export default MathQuizPage;