import React,{useEffect, useState} from 'react';
import { fetchMathQuestions, submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/Leaderboard';

export default function MathQuiz(){
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(()=> load(), []);

  async function load(){
    try {
      setIsLoading(true);
      logger.info('Loading math questions', {}, LogTags.MATH_QUIZ);
      const res = await fetchMathQuestions();
      setQuestions(res.data.questions || []);
      setIndex(0);
      setScore(0);
      setQuizCompleted(false);
      logger.info('Math questions loaded', { count: res.data.questions?.length }, LogTags.MATH_QUIZ);
    } catch (error) {
      logger.error('Failed to load math questions', error, {}, LogTags.MATH_QUIZ);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }

  function answer(opt){
    const correct = questions[index].ans === opt;
    if(correct){ setScore(s=>s+10); }
    logger.debug('Math quiz answer', { questionIndex: index, correct, score: correct ? score + 10 : score }, LogTags.MATH_QUIZ);

    const nextIndex = index + 1;
    if(nextIndex >= questions.length){
      setQuizCompleted(true);
      submitScore({ game:'math-quiz', score, player:'guest' });
      logger.info('Math quiz completed', { finalScore: score }, LogTags.SAVE_SCORE);
      return;
    }
    setIndex(nextIndex);
  }

  if(isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text">Loading math questions...</p>
        </div>
      </div>
    );
  }

  if(!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl p-8 border border-gray-700 max-w-md w-full text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-light-text mb-2">Failed to Load Questions</h2>
          <button
            onClick={load}
            className="w-full bg-primary-blue hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 mt-4"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const q = questions[index];

  return (
    <div className="min-h-screen text-light-text">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🧮 Math Quiz</h1>
          <p className="text-subtle-text">Test your math skills with challenging questions!</p>
        </div>

        {/* Progress and Score */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <span className="text-sm font-medium text-gray-300">QUESTION</span>
            <div className="text-2xl font-bold text-white">{index + 1}/{questions.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <span className="text-sm font-medium text-gray-300">SCORE</span>
            <div className="text-2xl font-bold text-white">{score}</div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8 text-center shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">{q.q}</h2>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {q.options.map((option, i) => (
              <button
                key={i}
                onClick={() => answer(option)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="math-quiz" />
        </div>

        {/* Quiz Completed */}
        {quizCompleted && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">Quiz Completed!</h2>
              <p className="text-gray-600 mb-4">Your final score:</p>
              <p className="text-4xl font-bold text-blue-600 mb-6">{score} points</p>
              <button
                onClick={load}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
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
