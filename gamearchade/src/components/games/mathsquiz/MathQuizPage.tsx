'use client';

import React, { useEffect, useState } from 'react';
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

async function submitScore(scoreData: { game: string; score: number; meta: Record<string, any> }): Promise<void> {
  try {
    const response = await fetch('/api/games/math/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scoreData),
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>('none');

  useEffect(() => {
    load();
  }, []);

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
  async function load(): Promise<void> {
    try {
      setIsLoading(true);
      console.log('[MATH_QUIZ] Loading math questions');
      const res = await fetchMathQuestions();
      setQuestions(res.data.questions || []);
      setIndex(0);
      setScore(0);
      setQuizCompleted(false);
      setTimeLeft(30);
      setSelectedAnswer(null);
      setFeedbackStatus('none');
      console.log('[MATH_QUIZ] Math questions loaded', { count: res.data.questions?.length });
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
    setSelectedAnswer(selectedOption);
    setFeedbackStatus(correct ? 'correct' : 'incorrect');

    if (correct) {
      setScore(s => s + 10);
    }

    // Proceed to next question after a delay
    setTimeout(() => {
      const nextIndex = index + 1;
      if (nextIndex >= questions.length) {
        const finalScore = correct ? score + 10 : score;
        setQuizCompleted(true);
        submitScore({ 
          game: 'math-quiz', 
          score: finalScore, 
          meta: { questionsAnswered: index + 1, correctAnswers: Math.floor(finalScore / 10) } 
        });
        console.log('[MATH_QUIZ] Math quiz completed', { finalScore });
      } else {
        setIndex(nextIndex);
        setTimeLeft(30);
        setSelectedAnswer(null);
        setFeedbackStatus('none');
      }
    }, 1500);
  }

  // Skip current question
  function skipQuestion(): void {
    const nextIndex = index + 1;
    if (nextIndex >= questions.length) {
      setQuizCompleted(true);
      submitScore({ 
        game: 'math-quiz', 
        score, 
        meta: { questionsAnswered: index + 1, skippedQuestions: 1 } 
      });
    } else {
      setIndex(nextIndex);
      setTimeLeft(30);
      setSelectedAnswer(null);
      setFeedbackStatus('none');
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading math questions...</p>
        </div>
      </div>
    );
  }

  // Render error state if no questions
  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <AnimatedBackground />
        <div className="bg-slate-800/90 backdrop-blur-lg rounded-xl p-8 border border-slate-700 max-w-md w-full text-center relative z-10 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-4">Failed to Load Questions</h2>
          <p className="text-slate-400 mb-6">Unable to load math questions. Please try again.</p>
          <button
            onClick={load}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="w-full mt-3 bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  const q = questions[index];

  if (!q) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">No question found</p>
        </div>
      </div>
    );
  }

  // Render the quiz
  return (
    <div className={`min-h-screen text-white relative overflow-hidden ${className || ''}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🧮 Math Quiz</h1>
          <p className="text-slate-400 text-lg">Test your math skills!</p>
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="mt-4 bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              ← Back to Dashboard
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="math-quiz" />
        </div>

        {/* Progress and Score */}
        <div className="flex justify-center gap-6 mb-8 flex-wrap">
          <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl p-4 text-center border border-slate-700 shadow-lg">
            <span className="text-sm text-slate-400 uppercase tracking-wider">QUESTION</span>
            <div className="text-2xl font-bold text-white">{index + 1}/{questions.length}</div>
          </div>
          <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl p-4 text-center border border-slate-700 shadow-lg">
            <span className="text-sm text-slate-400 uppercase tracking-wider">SCORE</span>
            <div className="text-2xl font-bold text-white">{score}</div>
          </div>
          <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl p-4 text-center border border-slate-700 shadow-lg">
            <span className="text-sm text-slate-400 uppercase tracking-wider">TIME</span>
            <TimerDisplay minutes={Math.floor(timeLeft / 60)} seconds={timeLeft % 60} />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-8">
          <ProgressBar current={index + 1} total={questions.length} />
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
          <Leaderboard game="math-quiz" />
        </div>
      </div>

      {/* Quiz Completed Modal */}
      {quizCompleted && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md w-full">
            <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Quiz Completed!</h2>
            <p className="text-slate-600 mb-2">Your final score:</p>
            <p className="text-4xl font-bold text-blue-600 mb-4">{score} points</p>
            <p className="text-sm text-slate-500 mb-6">
              Questions answered: {index + 1}/{questions.length}
            </p>
            <div className="flex gap-3">
              <button
                onClick={load}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Play Again
              </button>
              {onBackToDashboard && (
                <button
                  onClick={onBackToDashboard}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MathQuizPage;