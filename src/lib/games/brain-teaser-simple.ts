// Brain Teaser Game with Difficulty Levels
export type BrainTeaserDifficulty = 'easy' | 'medium' | 'hard';

export interface BrainTeaserQuestion {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  difficulty: BrainTeaserDifficulty;
  category: string;
}

export interface BrainTeaserQuestionSet {
  difficulty: BrainTeaserDifficulty;
  theme: string;
  questions: BrainTeaserQuestion[];
}

export const BRAIN_TEASER_QUESTIONS: Record<BrainTeaserDifficulty, BrainTeaserQuestionSet> = {
  easy: {
    difficulty: 'easy',
    theme: '🌱 Beginner',
    questions: [
      {
        id: 'easy_1',
        question: 'What has a head and a tail but no body?',
        answer: 'coin',
        hint: 'Used for flipping to make decisions',
        difficulty: 'easy',
        category: 'Objects',
      },
      {
        id: 'easy_2',
        question: 'I have hands, but cannot clap. What am I?',
        answer: 'clock',
        hint: 'Found on walls, measures time',
        difficulty: 'easy',
        category: 'Objects',
      },
      {
        id: 'easy_3',
        question: 'What gets wet while drying?',
        answer: 'towel',
        hint: 'You use this after taking a bath',
        difficulty: 'easy',
        category: 'Objects',
      },
      {
        id: 'easy_4',
        question: 'I am always coming but never arrive. What am I?',
        answer: 'tomorrow',
        hint: 'Part of the future',
        difficulty: 'easy',
        category: 'Time',
      },
      {
        id: 'easy_5',
        question: 'What can travel around the world while staying in a corner?',
        answer: 'stamp',
        hint: 'Postal service uses these',
        difficulty: 'easy',
        category: 'Objects',
      },
      {
        id: 'easy_6',
        question: 'I speak without a mouth and hear without ears. What am I?',
        answer: 'echo',
        hint: 'Sound bounces back',
        difficulty: 'easy',
        category: 'Sound',
      },
      {
        id: 'easy_7',
        question: 'What has a face but cannot smile?',
        answer: 'clock',
        hint: 'Time-related',
        difficulty: 'easy',
        category: 'Objects',
      },
      {
        id: 'easy_8',
        question: 'The more you take, the more you leave behind. What am I?',
        answer: 'footsteps',
        hint: 'What you leave when you walk',
        difficulty: 'easy',
        category: 'Actions',
      },
    ],
  },
  medium: {
    difficulty: 'medium',
    theme: '⚡ Intermediate',
    questions: [
      {
        id: 'medium_1',
        question: 'I have cities, but no buildings. I have mountains, but no trees. I have water, but no fish. What am I?',
        answer: 'map',
        hint: 'Used for navigation',
        difficulty: 'medium',
        category: 'Geography',
      },
      {
        id: 'medium_2',
        question: 'I am taken from a mine and shut up in a wooden case, from which I am never released, yet I am used by almost everyone. What am I?',
        answer: 'pencil lead',
        hint: 'Writing instrument core',
        difficulty: 'medium',
        category: 'Objects',
      },
      {
        id: 'medium_3',
        question: 'What comes once in a minute, twice in a moment, and never in one hundred years?',
        answer: 'letter m',
        hint: 'Look at the letters in the words',
        difficulty: 'medium',
        category: 'Logic',
      },
      {
        id: 'medium_4',
        question: 'I am not alive, but I grow. I do not have lungs, but I need air. What am I?',
        answer: 'fire',
        hint: 'Can be dangerous',
        difficulty: 'medium',
        category: 'Nature',
      },
      {
        id: 'medium_5',
        question: 'What question can you never answer "yes" to?',
        answer: 'are you asleep',
        hint: 'Only applies when unconscious',
        difficulty: 'medium',
        category: 'Logic',
      },
      {
        id: 'medium_6',
        question: 'I have keys, but no locks. I have space, but no room. What am I?',
        answer: 'keyboard',
        hint: 'Used for typing',
        difficulty: 'medium',
        category: 'Technology',
      },
      {
        id: 'medium_7',
        question: 'What has a bottom at the top?',
        answer: 'leg',
        hint: 'Part of your body',
        difficulty: 'medium',
        category: 'Anatomy',
      },
      {
        id: 'medium_8',
        question: 'I get smaller every time I take a bath. What am I?',
        answer: 'soap',
        hint: 'Used for cleaning',
        difficulty: 'medium',
        category: 'Objects',
      },
    ],
  },
  hard: {
    difficulty: 'hard',
    theme: '🔥 Advanced',
    questions: [
      {
        id: 'hard_1',
        question: 'If you have me, you want to share me. If you share me, you have not got me. What am I?',
        answer: 'secret',
        hint: 'Something you keep private',
        difficulty: 'hard',
        category: 'Logic',
      },
      {
        id: 'hard_2',
        question: 'The one who makes it sells it. The one who buys it never uses it. The one who uses it never knows they are using it. What is it?',
        answer: 'coffin',
        hint: 'Related to death',
        difficulty: 'hard',
        category: 'Logic',
      },
      {
        id: 'hard_3',
        question: 'What is seen in the middle of March and April that cannot be seen at the beginning or end of either month?',
        answer: 'letter r',
        hint: 'Look at the spelling of the months',
        difficulty: 'hard',
        category: 'Logic',
      },
      {
        id: 'hard_4',
        question: 'I am a word that becomes shorter when you add two letters to me. What am I?',
        answer: 'short',
        hint: 'Add "er" to make it longer in letters but shorter in meaning',
        difficulty: 'hard',
        category: 'Wordplay',
      },
      {
        id: 'hard_5',
        question: 'What can run but never walks, has a mouth but never talks, has a bed but never sleeps?',
        answer: 'river',
        hint: 'Natural water feature',
        difficulty: 'hard',
        category: 'Nature',
      },
      {
        id: 'hard_6',
        question: 'What is black when you buy it, red when you use it, and gray when you throw it away?',
        answer: 'charcoal',
        hint: 'Used in grilling or art',
        difficulty: 'hard',
        category: 'Objects',
      },
      {
        id: 'hard_7',
        question: 'I have cities, but no houses live in them. I have mountains, but no trees grow on them. What am I?',
        answer: 'map',
        hint: 'Navigation tool',
        difficulty: 'hard',
        category: 'Geography',
      },
      {
        id: 'hard_8',
        question: 'What has a spine but no bones?',
        answer: 'book',
        hint: 'You read this',
        difficulty: 'hard',
        category: 'Objects',
      },
    ],
  },
};

/**
 * Get a random question from specified difficulty level
 */
export function getRandomBrainTeaserByDifficulty(difficulty: BrainTeaserDifficulty) {
  const questionSet = BRAIN_TEASER_QUESTIONS[difficulty];
  if (!questionSet) {
    console.error(`[BRAIN_TEASER] Invalid difficulty: ${difficulty}`);
    return getRandomBrainTeaserByDifficulty('medium');
  }

  const questions = questionSet.questions;
  if (!questions || questions.length === 0) {
    console.error(`[BRAIN_TEASER] No questions found for difficulty: ${difficulty}`);
    return {
      id: 'default',
      question: 'What has a head and a tail?',
      answer: 'coin',
      difficulty,
      category: 'Objects',
    };
  }

  return questions[Math.floor(Math.random() * questions.length)];
}

/**
 * Get 5 unique questions for a round
 */
export function getQuestionSequenceForRound(difficulty: BrainTeaserDifficulty, count: number = 5) {
  const questionSet = BRAIN_TEASER_QUESTIONS[difficulty];
  if (!questionSet) {
    console.error(`[BRAIN_TEASER] Invalid difficulty: ${difficulty}`);
    return [];
  }

  const questions = [...questionSet.questions];
  const selectedQuestions = [];
  const actualCount = Math.min(count, questions.length);

  for (let i = 0; i < actualCount; i++) {
    const randomIndex = Math.floor(Math.random() * questions.length);
    const selectedQuestion = questions[randomIndex];

    selectedQuestions.push(selectedQuestion);
    questions.splice(randomIndex, 1);
  }

  return selectedQuestions;
}

/**
 * Calculate score based on difficulty and attempts to answer
 */
export function calculateBrainTeaserScore(
  difficulty: BrainTeaserDifficulty,
  attempts: number,
  timeSpentSeconds: number
): number {
  const difficultyMultiplier = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  const multiplier = difficultyMultiplier[difficulty] || 1;
  const baseScore = 100;
  const penaltyPerAttempt = 10;
  const timeBonus = Math.max(0, 60 - timeSpentSeconds) / 6; // Bonus for speed

  const score = (baseScore * multiplier) - (attempts * penaltyPerAttempt) + timeBonus;

  return Math.max(score, 10);
}

/**
 * Check if an answer is correct (case-insensitive, ignoring extra spaces)
 */
export function validateBrainTeaserAnswer(userAnswer: string, correctAnswer: string): boolean {
  const normalize = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ');
  return normalize(userAnswer) === normalize(correctAnswer);
}
