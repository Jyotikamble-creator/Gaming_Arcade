import { useState, useCallback } from 'react';
import {
  QuizQuestion,
  QuizDifficulty,
  QuizCategory
} from '@/types/games/quiz';

interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  selectedAnswer: string | null;
  showResult: boolean;
  isCompleted: boolean;
  isLoading: boolean;
  difficulty: QuizDifficulty | null;
  gameStarted: boolean;
}

interface UseQuizReturn {
  quizState: QuizState;
  currentQuestion: QuizQuestion | null;
  handleAnswer: (answer: string) => void;
  handleRestart: () => void;
  startQuiz: (difficulty: QuizDifficulty) => void;
  currentIndex: number;
  totalQuestions: number;
  score: number;
  difficulty: QuizDifficulty | null;
  gameStarted: boolean;
  isCompleted: boolean;
  selectedAnswer: string | null;
  showResult: boolean;
}

// Question bank organized by difficulty
const questionBank = {
  easy: [
    {
      id: 1,
      q: 'What is the capital of France?',
      options: ['London', 'Paris', 'Berlin', 'Madrid'],
      ans: 'Paris',
      category: 'geography' as QuizCategory,
      difficulty: 'easy' as QuizDifficulty,
      points: 10
    },
    {
      id: 2,
      q: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      ans: 'Mars',
      category: 'science' as QuizCategory,
      difficulty: 'easy' as QuizDifficulty,
      points: 10
    },
    {
      id: 3,
      q: 'What is 5 + 3?',
      options: ['6', '7', '8', '9'],
      ans: '8',
      category: 'mathematics' as QuizCategory,
      difficulty: 'easy' as QuizDifficulty,
      points: 10
    },
    {
      id: 4,
      q: 'Who wrote Romeo and Juliet?',
      options: ['Oscar Wilde', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
      ans: 'William Shakespeare',
      category: 'literature' as QuizCategory,
      difficulty: 'easy' as QuizDifficulty,
      points: 10
    },
    {
      id: 5,
      q: 'What is the largest ocean on Earth?',
      options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
      ans: 'Pacific Ocean',
      category: 'geography' as QuizCategory,
      difficulty: 'easy' as QuizDifficulty,
      points: 10
    }
  ],
  medium: [
    {
      id: 1,
      q: 'In what year did the Titanic sink?',
      options: ['1912', '1905', '1920', '1898'],
      ans: '1912',
      category: 'history' as QuizCategory,
      difficulty: 'medium' as QuizDifficulty,
      points: 20
    },
    {
      id: 2,
      q: 'What is the chemical symbol for Gold?',
      options: ['Go', 'Gd', 'Au', 'Ag'],
      ans: 'Au',
      category: 'science' as QuizCategory,
      difficulty: 'medium' as QuizDifficulty,
      points: 20
    },
    {
      id: 3,
      q: 'Which programming language is known as the "language of the web"?',
      options: ['Python', 'JavaScript', 'Java', 'C++'],
      ans: 'JavaScript',
      category: 'programming' as QuizCategory,
      difficulty: 'medium' as QuizDifficulty,
      points: 20
    },
    {
      id: 4,
      q: 'What is the square root of 144?',
      options: ['10', '11', '12', '13'],
      ans: '12',
      category: 'mathematics' as QuizCategory,
      difficulty: 'medium' as QuizDifficulty,
      points: 20
    },
    {
      id: 5,
      q: 'Who painted the Mona Lisa?',
      options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'],
      ans: 'Leonardo da Vinci',
      category: 'arts' as QuizCategory,
      difficulty: 'medium' as QuizDifficulty,
      points: 20
    }
  ],
  hard: [
    {
      id: 1,
      q: 'What is the Higgs boson primarily responsible for?',
      options: ['Gravity', 'Mass', 'Energy', 'Motion'],
      ans: 'Mass',
      category: 'science' as QuizCategory,
      difficulty: 'hard' as QuizDifficulty,
      points: 50
    },
    {
      id: 2,
      q: 'In what year was the first iPhone released?',
      options: ['2005', '2007', '2008', '2010'],
      ans: '2007',
      category: 'technology' as QuizCategory,
      difficulty: 'hard' as QuizDifficulty,
      points: 50
    },
    {
      id: 3,
      q: 'What does API stand for?',
      options: ['Application Programming Interface', 'Advanced Programming Instruction', 'Application Process Instruction', 'Advanced Process Interface'],
      ans: 'Application Programming Interface',
      category: 'programming' as QuizCategory,
      difficulty: 'hard' as QuizDifficulty,
      points: 50
    },
    {
      id: 4,
      q: 'What is the integral of x^2 from 0 to 3?',
      options: ['6', '9', '12', '15'],
      ans: '9',
      category: 'mathematics' as QuizCategory,
      difficulty: 'hard' as QuizDifficulty,
      points: 50
    },
    {
      id: 5,
      q: 'Which element has the highest atomic number found in nature?',
      options: ['Uranium', 'Thorium', 'Plutonium', 'Neptunium'],
      ans: 'Uranium',
      category: 'science' as QuizCategory,
      difficulty: 'hard' as QuizDifficulty,
      points: 50
    }
  ]
};

export function useQuiz(): UseQuizReturn {
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentIndex: 0,
    score: 0,
    selectedAnswer: null,
    showResult: false,
    isCompleted: false,
    isLoading: false,
    difficulty: null,
    gameStarted: false
  });

  const startQuiz = useCallback((difficulty: QuizDifficulty) => {
    // Get questions for this difficulty level and shuffle
    const selectedQuestions = [...(questionBank[difficulty as keyof typeof questionBank] || questionBank.medium)].sort(() => Math.random() - 0.5);

    setQuizState({
      questions: selectedQuestions,
      currentIndex: 0,
      score: 0,
      selectedAnswer: null,
      showResult: false,
      isCompleted: false,
      isLoading: false,
      difficulty: difficulty,
      gameStarted: true
    });
  }, []);

  const handleAnswer = useCallback((answer: string) => {
    if (quizState.isCompleted) return;

    const currentQuestion = quizState.questions[quizState.currentIndex];
    const isCorrect = answer === currentQuestion.ans;
    const pointsEarned = isCorrect ? (currentQuestion.points || 10) : 0;

    setQuizState(prevState => ({
      ...prevState,
      selectedAnswer: answer,
      showResult: true,
      score: prevState.score + pointsEarned
    }));

    // Move to next question after delay
    setTimeout(() => {
      setQuizState(prevState => {
        if (prevState.currentIndex >= prevState.questions.length - 1) {
          // Quiz is complete
          return {
            ...prevState,
            isCompleted: true,
            selectedAnswer: null,
            showResult: false
          };
        } else {
          // Move to next question
          return {
            ...prevState,
            currentIndex: prevState.currentIndex + 1,
            selectedAnswer: null,
            showResult: false
          };
        }
      });
    }, 800);
  }, [quizState.isCompleted, quizState.currentIndex, quizState.questions]);

  const handleRestart = useCallback(() => {
    setQuizState({
      questions: [],
      currentIndex: 0,
      score: 0,
      selectedAnswer: null,
      showResult: false,
      isCompleted: false,
      isLoading: false,
      difficulty: null,
      gameStarted: false
    });
  }, []);

  const currentQuestion = quizState.questions[quizState.currentIndex] || null;

  return {
    quizState,
    currentQuestion,
    handleAnswer,
    handleRestart,
    startQuiz,
    currentIndex: quizState.currentIndex,
    totalQuestions: quizState.questions.length,
    score: quizState.score,
    difficulty: quizState.difficulty,
    gameStarted: quizState.gameStarted,
    isCompleted: quizState.isCompleted,
    selectedAnswer: quizState.selectedAnswer,
    showResult: quizState.showResult
  };
}
