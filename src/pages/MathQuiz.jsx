// MathQuiz page component that manages the math quiz game logic and UI.
import React, { useEffect, useState } from 'react';
// API functions
import { fetchMathQuestions, submitScore } from '../api/Api';
// Logger
import { logger, LogTags } from '../lib/logger';
// Components
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/leaderboard/Leaderboard';
import ProgressBar from '../components/mathsquiz/ProgressBar';
import TimerDisplay from '../components/mathsquiz/TimerDisplay';
import ActionButton from '../components/mathsquiz/ActionButton';
import MathQuestionCard from '../components/mathsquiz/MathQuestionCard';

// MathQuiz page component
export default function MathQuiz() {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedbackStatus, setFeedbackStatus] = useState('none');

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
  async function load() {
    try {
      setIsLoading(true);
      logger.info('Loading math questions', {}, LogTags.MATH_QUIZ);
      const res = await fetchMathQuestions();
      setQuestions(res.data.questions || []);
      setIndex(0);
      setScore(0);
      setQuizCompleted(false);
      setTimeLeft(30);
      setSelectedAnswer(null);
      setFeedbackStatus('none');
      logger.info('Math questions loaded', { count: res.data.questions?.length }, LogTags.MATH_QUIZ);
    } catch (error) {
      logger.error('Failed to load math questions', error, {}, LogTags.MATH_QUIZ);
      // Fallback to static questions if API fails
      setQuestions([
        { id: 1, q: '2 + 2 = ?', options: ['3', '4', '5', '6'], ans: '4' },
        { id: 2, q: '5 * 3 = ?', options: ['12', '15', '18', '20'], ans: '15' },
        { id: 3, q: '10 - 7 = ?', options: ['2', '3', '4', '5'], ans: '3' }
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle answer selection
  function handleAnswer(selectedOption) {
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
        setQuizCompleted(true);
        submitScore({ game: 'math-quiz', score: correct ? score + 10 : score, meta: { questionsAnswered: index + 1 } });
        logger.info('Math quiz completed', { finalScore: correct ? score + 10 : score }, LogTags.SAVE_SCORE);
      } else {
        setIndex(nextIndex);
        setTimeLeft(30);
        setSelectedAnswer(null);
        setFeedbackStatus('none');
      }
    }, 1500);
  }

  // Skip current question
  function skipQuestion() {
    const nextIndex = index + 1;
    if (nextIndex >= questions.length) {
      setQuizCompleted(true);
      submitScore({ game: 'math-quiz', score, meta: { questionsAnswered: index + 1 } });
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading math questions...</p>
        </div>
      </div>
    );
  }

  // Render error state if no questions
  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-white mb-4">Failed to Load Questions</h2>
          <button
            onClick={load}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const q = questions[index];

  // Render the quiz
  return (
    <div className="min-h-screen text-light-text">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🧮 Math Quiz</h1>
          <p className="text-gray-400">Test your math skills!</p>
        </div>

        {/* Progress and Score */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <span className="text-sm text-gray-400">QUESTION</span>
            <div className="text-2xl font-bold text-white">{index + 1}/{questions.length}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <span className="text-sm text-gray-400">SCORE</span>
            <div className="text-2xl font-bold text-white">{score}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <span className="text-sm text-gray-400">TIME</span>
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

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="math-quiz" />
        </div>

        {/* Quiz Completed */}
        {quizCompleted && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
              <h2 className="text-3xl font-bold text-green-600 mb-4">Quiz Completed!</h2>
              <p className="text-gray-600 mb-4">Your final score:</p>
              <p className="text-4xl font-bold text-blue-600 mb-6">{score} points</p>
              <button
                onClick={load}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                Take Quiz Again
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="math-quiz" />
        </div>
      </div>
    </div>
  );
}
