import React, {useEffect, useState} from 'react';
import { fetchQuiz, submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/leaderboard/Leaderboard';
import QuizStats from '../components/quiz/QuizStats';
import QuestionCard from '../components/quiz/QuestionCard';
import QuizCompletedModal from '../components/quiz/QuizCompletedModal';

export default function Quiz(){
  const [qs, setQs] = useState([]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load(){
    try {
      setIsLoading(true);
      logger.info('Loading quiz questions', {}, LogTags.QUIZ);
      const r = await fetchQuiz();
      setQs(r.data.questions || []);
      setI(0);
      setScore(0);
      setQuizCompleted(false);
      setSelectedAnswer(null);
      setShowResult(false);
      logger.info('Quiz questions loaded', { count: r.data.questions?.length }, LogTags.QUIZ);
    } catch (error) {
      logger.error('Failed to load quiz', error, {}, LogTags.QUIZ);
      // Fallback test data
      setQs([
        { id: 1, q: 'What is 2+2?', options: ['3', '4', '5', '6'], ans: '4' },
        { id: 2, q: 'Capital of France?', options: ['London', 'Berlin', 'Paris', 'Madrid'], ans: 'Paris' },
        { id: 3, q: 'Color of sky?', options: ['Red', 'Blue', 'Green', 'Yellow'], ans: 'Blue' }
      ]);
      setI(0);
      setScore(0);
      setQuizCompleted(false);
      setSelectedAnswer(null);
      setShowResult(false);
    } finally {
      setIsLoading(false);
    }
  }

  function answer(opt){
    setSelectedAnswer(opt);
    setShowResult(true);

    const isCorrect = qs[i].ans === opt;
    if(isCorrect) {
      setScore(s => s + 10);
      logger.debug('Quiz answer correct', { questionIndex: i, score: score + 10 }, LogTags.QUIZ);
    } else {
      logger.debug('Quiz answer incorrect', { questionIndex: i, selected: opt, correct: qs[i].ans }, LogTags.QUIZ);
    }

    // Move to next question after a delay
    setTimeout(() => {
      if(i + 1 === qs.length){
        setQuizCompleted(true);
        submitScore({game:'quiz', playerName:'guest', score: isCorrect ? score + 10 : score, meta:{questionsAnswered: i + 1}});
        logger.info('Quiz completed', { finalScore: isCorrect ? score + 10 : score, questionsAnswered: i + 1 }, LogTags.SAVE_SCORE);
      } else {
        setI(i + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 1500);
  }

  if(isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  if(!qs.length) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl p-8 border border-gray-700 max-w-md w-full text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-light-text mb-2">Failed to Load Quiz</h2>
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

  const q = qs[i];

  return (
    <div className="min-h-screen text-light-text">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🧠 Quiz Challenge</h1>
          <p className="text-subtle-text">Test your knowledge with multiple choice questions!</p>
        </div>

        {/* Progress and Score */}
        <QuizStats
          current={i + 1}
          total={qs.length}
          score={score}
          progress={Math.round(((i + 1) / qs.length) * 100)}
        />

        {/* Question Card */}
        <QuestionCard
          question={q.q}
          options={q.options}
          onAnswer={answer}
          showResult={showResult}
          selectedAnswer={selectedAnswer}
          correctAnswer={q.ans}
        />

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="quiz" />
        </div>

        {/* Quiz Completed */}
        {quizCompleted && (
          <QuizCompletedModal
            score={score}
            totalQuestions={qs.length}
            onRestart={load}
          />
        )}

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="quiz" />
        </div>
      </div>
    </div>
  );
}
