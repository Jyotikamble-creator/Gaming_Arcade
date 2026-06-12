/**
 * Utility functions and question bank for Quiz Game
 */

import type {
  QuizQuestion,
  QuizQuestionSafe,
  QuizCategory,
  QuizDifficulty,
  QuizPerformance,
  QuizGrade
} from '@/types/games/quiz';

/**
 * Complete question bank with multiple categories and difficulties
 */
export const QUESTION_BANK: QuizQuestion[] = [
  // General Knowledge - Easy
  { id: 1, q: "What is 2+2?", options: ["3", "4", "5", "6"], ans: "4", category: 'general', difficulty: 'easy', points: 10 },
  { id: 2, q: "Capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], ans: "Paris", category: 'geography', difficulty: 'easy', points: 10 },
  { id: 3, q: "Color of sky?", options: ["Red", "Blue", "Green", "Yellow"], ans: "Blue", category: 'general', difficulty: 'easy', points: 10 },
  
  // Science - Medium
  { id: 4, q: "What is the largest planet in our solar system?", options: ["Mars", "Jupiter", "Saturn", "Venus"], ans: "Jupiter", category: 'science', difficulty: 'medium', points: 15 },
  { id: 6, q: "What is the chemical symbol for water?", options: ["H2O", "CO2", "O2", "NaCl"], ans: "H2O", category: 'science', difficulty: 'medium', points: 15 },
  { id: 11, q: "Which element has atomic number 1?", options: ["Helium", "Hydrogen", "Lithium", "Beryllium"], ans: "Hydrogen", category: 'science', difficulty: 'medium', points: 15 },
  { id: 13, q: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], ans: "Mars", category: 'science', difficulty: 'medium', points: 15 },
  
  // Arts - Medium
  { id: 5, q: "Who painted the Mona Lisa?", options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"], ans: "Leonardo da Vinci", category: 'arts', difficulty: 'medium', points: 15 },
  
  // Programming - Medium
  { id: 7, q: 'Which programming language is known as the "mother of all languages"?', options: ["Python", "C", "Assembly", "Java"], ans: "C", category: 'programming', difficulty: 'medium', points: 15 },
  
  // Mathematics - Easy
  { id: 8, q: "What is the square root of 144?", options: ["10", "12", "14", "16"], ans: "12", category: 'mathematics', difficulty: 'easy', points: 10 },
  
  // Geography - Easy
  { id: 9, q: "Which ocean is the largest?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], ans: "Pacific", category: 'geography', difficulty: 'easy', points: 10 },
  { id: 12, q: "What is the capital of Japan?", options: ["Seoul", "Beijing", "Tokyo", "Bangkok"], ans: "Tokyo", category: 'geography', difficulty: 'easy', points: 10 },
  
  // History - Medium
  { id: 10, q: "What year did World War II end?", options: ["1944", "1945", "1946", "1947"], ans: "1945", category: 'history', difficulty: 'medium', points: 15 },
  
  // Additional Science Questions
  { id: 14, q: "What is the speed of light?", options: ["299,792 km/s", "150,000 km/s", "500,000 km/s", "100,000 km/s"], ans: "299,792 km/s", category: 'science', difficulty: 'hard', points: 20 },
  { id: 15, q: "What gas do plants absorb from the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], ans: "Carbon Dioxide", category: 'science', difficulty: 'easy', points: 10 },
  
  // Technology Questions
  { id: 16, q: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Computer Processing Utility"], ans: "Central Processing Unit", category: 'technology', difficulty: 'easy', points: 10 },
  { id: 17, q: "Who founded Microsoft?", options: ["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Larry Page"], ans: "Bill Gates", category: 'technology', difficulty: 'medium', points: 15 },
  
  // Mathematics Questions
  { id: 18, q: "What is the value of Pi (to 2 decimal places)?", options: ["3.12", "3.14", "3.16", "3.18"], ans: "3.14", category: 'mathematics', difficulty: 'easy', points: 10 },
  { id: 19, q: "What is 15% of 200?", options: ["25", "30", "35", "40"], ans: "30", category: 'mathematics', difficulty: 'medium', points: 15 },
  { id: 20, q: "What is the area of a circle with radius 5?", options: ["78.54", "50", "25", "31.42"], ans: "78.54", category: 'mathematics', difficulty: 'hard', points: 20 },
  
  // Literature Questions
  { id: 21, q: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], ans: "William Shakespeare", category: 'literature', difficulty: 'easy', points: 10 },
  { id: 22, q: "What is the first book in the Harry Potter series?", options: ["Chamber of Secrets", "Philosopher's Stone", "Prisoner of Azkaban", "Goblet of Fire"], ans: "Philosopher's Stone", category: 'literature', difficulty: 'easy', points: 10 },
  
  // Sports Questions
  { id: 23, q: "How many players are on a soccer team?", options: ["9", "10", "11", "12"], ans: "11", category: 'sports', difficulty: 'easy', points: 10 },
  { id: 24, q: "In which sport is 'love' a score?", options: ["Basketball", "Tennis", "Golf", "Cricket"], ans: "Tennis", category: 'sports', difficulty: 'medium', points: 15 },
  
  // History Questions
  { id: 25, q: "Who was the first President of the United States?", options: ["Thomas Jefferson", "George Washington", "Abraham Lincoln", "John Adams"], ans: "George Washington", category: 'history', difficulty: 'easy', points: 10 },
  { id: 26, q: "In which year did the Berlin Wall fall?", options: ["1987", "1989", "1991", "1993"], ans: "1989", category: 'history', difficulty: 'medium', points: 15 },
  
  // Programming Questions
  { id: 27, q: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"], ans: "Hyper Text Markup Language", category: 'programming', difficulty: 'easy', points: 10 },
  { id: 28, q: "Which programming language is primarily used for iOS development?", options: ["Java", "Swift", "Python", "C++"], ans: "Swift", category: 'programming', difficulty: 'medium', points: 15 },
  { id: 29, q: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], ans: "O(log n)", category: 'programming', difficulty: 'hard', points: 20 },
  
  // Expert Level Questions
  { id: 30, q: "What is the Planck constant approximately equal to?", options: ["6.626 × 10⁻³⁴ J·s", "3.14 × 10⁻³⁴ J·s", "9.81 × 10⁻³⁴ J·s", "1.60 × 10⁻³⁴ J·s"], ans: "6.626 × 10⁻³⁴ J·s", category: 'science', difficulty: 'expert', points: 25 }
];

/**
 * Get questions by category
 */
export function getQuestionsByCategory(category: QuizCategory): QuizQuestion[] {
  return QUESTION_BANK.filter(q => q.category === category);
}

/**
 * Get questions by difficulty
 */
export function getQuestionsByDifficulty(difficulty: QuizDifficulty): QuizQuestion[] {
  return QUESTION_BANK.filter(q => q.difficulty === difficulty);
}

/**
 * Get questions by category and difficulty
 */
export function getQuestionsByCategoryAndDifficulty(
  category: QuizCategory,
  difficulty: QuizDifficulty
): QuizQuestion[] {
  return QUESTION_BANK.filter(q => q.category === category && q.difficulty === difficulty);
}

/**
 * Get random questions
 */
export function getRandomQuestions(
  count: number,
  category?: QuizCategory,
  difficulty?: QuizDifficulty
): QuizQuestion[] {
  let pool = [...QUESTION_BANK];

  // Filter by category
  if (category) {
    pool = pool.filter(q => q.category === category);
  }

  // Filter by difficulty
  if (difficulty) {
    pool = pool.filter(q => q.difficulty === difficulty);
  }

  // Shuffle using Fisher-Yates
  const shuffled = shuffleArray(pool);

  // Return requested count
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Strip answer from question (for client)
 */
export function stripAnswer(question: QuizQuestion): QuizQuestionSafe {
  const { ans, explanation, ...safe } = question;
  return safe;
}

/**
 * Strip answers from multiple questions
 */
export function stripAnswers(questions: QuizQuestion[]): QuizQuestionSafe[] {
  return questions.map(stripAnswer);
}

/**
 * Shuffle question options
 */
export function shuffleOptions(question: QuizQuestion): QuizQuestion {
  return {
    ...question,
    options: shuffleArray(question.options)
  };
}

/**
 * Calculate performance rating based on accuracy
 */
export function getPerformanceRating(accuracy: number): QuizPerformance {
  if (accuracy === 100) return 'Quiz Master';
  if (accuracy >= 90) return 'Excellent';
  if (accuracy >= 80) return 'Very Good';
  if (accuracy >= 70) return 'Good';
  if (accuracy >= 60) return 'Average';
  if (accuracy >= 50) return 'Below Average';
  return 'Needs Improvement';
}

/**
 * Calculate grade based on accuracy
 */
export function getGrade(accuracy: number): QuizGrade {
  if (accuracy >= 97) return 'A+';
  if (accuracy >= 93) return 'A';
  if (accuracy >= 90) return 'A-';
  if (accuracy >= 87) return 'B+';
  if (accuracy >= 83) return 'B';
  if (accuracy >= 80) return 'B-';
  if (accuracy >= 77) return 'C+';
  if (accuracy >= 73) return 'C';
  if (accuracy >= 70) return 'C-';
  if (accuracy >= 60) return 'D';
  return 'F';
}

/**
 * Get performance message
 */
export function getPerformanceMessage(performance: QuizPerformance): string {
  const messages: Record<QuizPerformance, string> = {
    'Quiz Master': 'Perfect! You are a Quiz Master! 🏆',
    'Excellent': 'Excellent work! Outstanding performance! ⭐',
    'Very Good': 'Very good! You did great! 🌟',
    'Good': 'Good job! Keep up the good work! 👍',
    'Average': 'Average performance. You can do better! 💪',
    'Below Average': 'Below average. More practice needed. 📚',
    'Needs Improvement': 'Keep practicing to improve! 📖'
  };

  return messages[performance];
}

/**
 * Get all available categories
 */
export function getAllCategories(): QuizCategory[] {
  return Array.from(new Set(QUESTION_BANK.map(q => q.category)));
}

/**
 * Get category display name
 */
export function getCategoryName(category: QuizCategory): string {
  const names: Record<QuizCategory, string> = {
    general: 'General Knowledge',
    science: 'Science',
    history: 'History',
    geography: 'Geography',
    mathematics: 'Mathematics',
    programming: 'Programming',
    arts: 'Arts & Culture',
    sports: 'Sports',
    literature: 'Literature',
    technology: 'Technology'
  };

  return names[category] || category;
}

/**
 * Get difficulty display name
 */
export function getDifficultyName(difficulty: QuizDifficulty): string {
  const names: Record<QuizDifficulty, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    expert: 'Expert'
  };

  return names[difficulty];
}

/**
 * Get difficulty points multiplier
 */
export function getDifficultyMultiplier(difficulty: QuizDifficulty): number {
  const multipliers: Record<QuizDifficulty, number> = {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0,
    expert: 2.5
  };

  return multipliers[difficulty];
}

/**
 * Calculate total possible score
 */
export function calculateMaxScore(questions: QuizQuestion[]): number {
  return questions.reduce((sum, q) => sum + (q.points || 10), 0);
}

/**
 * Validate answer
 */
export function validateAnswer(question: QuizQuestion, answer: string): boolean {
  return question.ans === answer;
}

/**
 * Get question count by category
 */
export function getQuestionCountByCategory(): Record<QuizCategory, number> {
  const counts: Partial<Record<QuizCategory, number>> = {};
  
  QUESTION_BANK.forEach(q => {
    counts[q.category] = (counts[q.category] || 0) + 1;
  });

  return counts as Record<QuizCategory, number>;
}

/**
 * Get question count by difficulty
 */
export function getQuestionCountByDifficulty(): Record<QuizDifficulty, number> {
  const counts: Partial<Record<QuizDifficulty, number>> = {};
  
  QUESTION_BANK.forEach(q => {
    counts[q.difficulty] = (counts[q.difficulty] || 0) + 1;
  });

  return counts as Record<QuizDifficulty, number>;
}
