import React from 'react';
import { useQuiz } from '../../hooks/useQuiz';

// Components
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';
import Instructions from '../shared/Instructions';
import Leaderboard from '../leaderboard/Leaderboard';
import QuizStats from './QuizStats';
import QuestionCard from './QuestionCard';
import QuizCompletedModal from './QuizCompletedModal';
import AnimatedBackground from '../AnimatedBackground';

/**
 * Main Quiz container component
 */
const QuizContainer = () => {
  const {
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions,
    score,
    isLoading,
    quizCompleted,
    selectedAnswer,
    showResult,
    progress,
    handleAnswer,
    restartQuiz,
    loadQuiz
  } = useQuiz();

  // Loading state
  if (isLoading) {
    return <LoadingSpinner message="Loading quiz questions..." />;
  }

  // Error state - no questions loaded
  if (!questions.length) {
    return (
      <ErrorDisplay 
        title="Failed to Load Quiz"
        message="Unable to load quiz questions. Please check your connection and try again."
        onRetry={loadQuiz}
      />
    );
  }

  // Main quiz render
  return (
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <QuizHeader />

        {/* Progress and Score */}
        <QuizStats
          current={currentIndex}
          total={totalQuestions}
          score={score}
          progress={progress}
        />

        {/* Question Card */}
        <QuestionCard
          question={currentQuestion.q}
          options={currentQuestion.options}
          onAnswer={handleAnswer}
          showResult={showResult}
          selectedAnswer={selectedAnswer}
          correctAnswer={currentQuestion.ans}
        />

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="quiz" />
        </div>

        {/* Quiz Completed Modal */}
        {quizCompleted && (
          <QuizCompletedModal
            score={score}
            totalQuestions={totalQuestions}
            onRestart={restartQuiz}
          />
        )}

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="quiz" />
        </div>
      </div>
    </div>
  );
};

/**
 * Quiz header component
 */
const QuizHeader = () => (
  <div className="text-center mb-8">
    <h1 className="text-4xl font-bold text-white mb-2">🧠 Quiz Challenge</h1>
    <p className="text-subtle-text">Test your knowledge with multiple choice questions!</p>
  </div>
);

export default QuizContainer;