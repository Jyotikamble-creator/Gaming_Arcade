import { useState, useEffect } from 'react';
import { fetchQuiz, submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';

/**
 * Custom hook for managing quiz state and logic
 */
export const useQuiz = () => {
  // State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Computed values
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  // Load quiz questions
  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      logger.info('Loading quiz questions', {}, LogTags.QUIZ);
      
      const response = await fetchQuiz();
      const quizData = response.data.questions || [];
      
      setQuestions(quizData);
      resetQuizState();
      
      logger.info('Quiz questions loaded', { count: quizData.length }, LogTags.QUIZ);
    } catch (error) {
      logger.error('Failed to load quiz', error, {}, LogTags.QUIZ);
      
      // Fallback test data
      const fallbackQuestions = [
        { 
          id: 1, 
          q: 'What is 2+2?', 
          options: ['3', '4', '5', '6'], 
          ans: '4' 
        },
        { 
          id: 2, 
          q: 'What is the capital of France?', 
          options: ['London', 'Berlin', 'Paris', 'Madrid'], 
          ans: 'Paris' 
        },
        { 
          id: 3, 
          q: 'What color is the sky?', 
          options: ['Red', 'Blue', 'Green', 'Yellow'], 
          ans: 'Blue' 
        }
      ];
      
      setQuestions(fallbackQuestions);
      resetQuizState();
    } finally {
      setIsLoading(false);
    }
  };

  // Reset quiz state
  const resetQuizState = () => {
    setCurrentIndex(0);
    setScore(0);
    setQuizCompleted(false);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  // Handle answer selection
  const handleAnswer = (selectedOption) => {
    if (selectedAnswer || showResult) return; // Prevent multiple selections
    
    setSelectedAnswer(selectedOption);
    setShowResult(true);

    const isCorrect = currentQuestion.ans === selectedOption;
    let newScore = score;
    
    if (isCorrect) {
      newScore = score + 10;
      setScore(newScore);
      logger.debug('Quiz answer correct', { 
        questionIndex: currentIndex, 
        score: newScore 
      }, LogTags.QUIZ);
    } else {
      logger.debug('Quiz answer incorrect', { 
        questionIndex: currentIndex, 
        selected: selectedOption, 
        correct: currentQuestion.ans 
      }, LogTags.QUIZ);
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentIndex + 1 === totalQuestions) {
        // Quiz completed
        setQuizCompleted(true);
        submitQuizScore(newScore);
        logger.info('Quiz completed', { 
          finalScore: newScore, 
          questionsAnswered: currentIndex + 1 
        }, LogTags.SAVE_SCORE);
      } else {
        // Next question
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 1500);
  };

  // Submit quiz score
  const submitQuizScore = async (finalScore) => {
    try {
      await submitScore({
        game: 'quiz',
        playerName: 'guest',
        score: finalScore,
        meta: { questionsAnswered: totalQuestions }
      });
    } catch (error) {
      logger.error('Failed to submit quiz score', error, {}, LogTags.SAVE_SCORE);
    }
  };

  // Restart quiz
  const restartQuiz = () => {
    loadQuiz();
  };

  // Initialize quiz on mount
  useEffect(() => {
    loadQuiz();
  }, []);

  return {
    // State
    questions,
    currentQuestion,
    currentIndex: currentIndex + 1, // 1-based for display
    totalQuestions,
    score,
    isLoading,
    quizCompleted,
    selectedAnswer,
    showResult,
    progress,
    
    // Actions
    handleAnswer,
    restartQuiz,
    loadQuiz
  };
};