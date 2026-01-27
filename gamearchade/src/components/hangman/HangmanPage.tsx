'use client';

import React, { useEffect, useState } from 'react';
import Instructions from '../shared/Instructions';
import Leaderboard from '../leaderboard/Leaderboard';
import HangmanDrawing from './HangmanDrawing';
import WordDisplay from './WordDisplay';
import Keyboard from './Keyboard';
import HangmanStats from './HangmanStats';
import HangmanWinModal from './HangmanWinModal';
import HangmanLoseModal from './HangmanLoseModal';
import AnimatedBackground from '../AnimatedBackground';

// TypeScript interfaces
interface User {
  id: string;
  name: string;
  email?: string;
  displayName?: string;
}

interface HangmanPageProps {
  user: User | null;
  onBackToDashboard?: () => void;
  className?: string;
}

interface WordData {
  word: string;
  hint: string;
}

type Category = 'animals' | 'countries' | 'fruits' | 'technology' | 'sports' | 'nature';

interface CategoryInfo {
  [key: string]: WordData[];
}

const HangmanPage: React.FC<HangmanPageProps> = ({ 
  user, 
  onBackToDashboard,
  className 
}) => {
  // Game state
  const [category, setCategory] = useState<Category | null>(null);
  const [word, setWord] = useState<string>('');
  const [hint, setHint] = useState<string>('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [wordsCompleted, setWordsCompleted] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [gameLost, setGameLost] = useState<boolean>(false);

  const MAX_WRONG_GUESSES = 6;

  // Word categories with hints
  const WORD_CATEGORIES: CategoryInfo = {
    animals: [
      { word: 'elephant', hint: 'Largest land animal with a trunk' },
      { word: 'giraffe', hint: 'Tallest animal with a very long neck' },
      { word: 'penguin', hint: 'Flightless bird that lives in cold climates' },
      { word: 'dolphin', hint: 'Intelligent marine mammal that jumps' },
      { word: 'kangaroo', hint: 'Australian animal that hops and carries babies in a pouch' },
      { word: 'cheetah', hint: 'Fastest land animal with spots' },
      { word: 'rhinoceros', hint: 'Large animal with one or two horns on its nose' },
      { word: 'octopus', hint: 'Sea creature with eight arms' },
      { word: 'butterfly', hint: 'Colorful insect with beautiful wings' },
      { word: 'crocodile', hint: 'Large reptile that lives in water with powerful jaws' }
    ],
    countries: [
      { word: 'australia', hint: 'Island continent known for kangaroos and Sydney Opera House' },
      { word: 'brazil', hint: 'Largest South American country, famous for football and carnival' },
      { word: 'canada', hint: 'Second largest country, known for maple syrup' },
      { word: 'denmark', hint: 'Scandinavian country, home of LEGO' },
      { word: 'egypt', hint: 'Ancient civilization with pyramids and the Sphinx' },
      { word: 'france', hint: 'European country with the Eiffel Tower' },
      { word: 'germany', hint: 'European country known for cars and beer festivals' },
      { word: 'india', hint: 'Asian country with the Taj Mahal' },
      { word: 'japan', hint: 'Island nation known for sushi and technology' },
      { word: 'mexico', hint: 'Country south of USA, famous for tacos' }
    ],
    fruits: [
      { word: 'strawberry', hint: 'Small red fruit with seeds on the outside' },
      { word: 'pineapple', hint: 'Tropical fruit with spiky skin and sweet yellow flesh' },
      { word: 'watermelon', hint: 'Large green fruit with red flesh and black seeds' },
      { word: 'blueberry', hint: 'Small round blue fruit often in muffins' },
      { word: 'raspberry', hint: 'Small red or black berry with tiny bumps' },
      { word: 'mango', hint: 'Tropical orange fruit with large pit' },
      { word: 'orange', hint: 'Citrus fruit that shares its name with a color' },
      { word: 'banana', hint: 'Yellow curved fruit that monkeys love' },
      { word: 'coconut', hint: 'Hard brown tropical fruit with white flesh and milk' },
      { word: 'papaya', hint: 'Large orange tropical fruit with black seeds' }
    ],
    technology: [
      { word: 'computer', hint: 'Electronic device you use to browse the internet' },
      { word: 'keyboard', hint: 'Device with keys you press to type' },
      { word: 'software', hint: 'Programs and applications that run on computers' },
      { word: 'internet', hint: 'Global network connecting billions of devices' },
      { word: 'database', hint: 'Organized collection of digital information' },
      { word: 'algorithm', hint: 'Step-by-step procedure to solve a problem' },
      { word: 'programming', hint: 'Writing code to create software' },
      { word: 'smartphone', hint: 'Mobile device that can make calls and run apps' },
      { word: 'wireless', hint: 'Technology that works without cables' },
      { word: 'blockchain', hint: 'Technology behind cryptocurrencies' }
    ],
    sports: [
      { word: 'basketball', hint: 'Sport where you shoot a ball through a hoop' },
      { word: 'football', hint: 'Sport played with feet and a round ball (soccer)' },
      { word: 'volleyball', hint: 'Sport where you hit a ball over a net with hands' },
      { word: 'cricket', hint: 'Bat and ball sport popular in England and India' },
      { word: 'baseball', hint: 'American sport with bats, balls, and bases' },
      { word: 'swimming', hint: 'Moving through water as a sport' },
      { word: 'gymnastics', hint: 'Sport involving flips, bars, and flexibility' },
      { word: 'badminton', hint: 'Racket sport played with a shuttlecock' },
      { word: 'tennis', hint: 'Racket sport played on a court with a net' },
      { word: 'hockey', hint: 'Sport played on ice with sticks and a puck' }
    ],
    nature: [
      { word: 'mountain', hint: 'Very tall natural elevation of land' },
      { word: 'rainbow', hint: 'Colorful arc in the sky after rain' },
      { word: 'volcano', hint: 'Mountain that can erupt with lava' },
      { word: 'thunder', hint: 'Loud sound during a storm after lightning' },
      { word: 'hurricane', hint: 'Powerful rotating storm with strong winds' },
      { word: 'waterfall', hint: 'Water falling from a height' },
      { word: 'glacier', hint: 'Slow-moving mass of ice' },
      { word: 'desert', hint: 'Dry sandy area with very little rain' },
      { word: 'forest', hint: 'Large area covered with trees' },
      { word: 'ocean', hint: 'Vast body of salt water' }
    ]
  };

  // Get a random word from selected category
  const getRandomWord = (selectedCategory: Category): WordData => {
    const items = WORD_CATEGORIES[selectedCategory];
    return items[Math.floor(Math.random() * items.length)];
  };

  // Start new game
  const startGame = (selectedCategory: Category): void => {
    const wordData = getRandomWord(selectedCategory);

    setCategory(selectedCategory);
    setWord(wordData.word);
    setHint(wordData.hint);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setIsPlaying(true);
    setGameWon(false);
    setGameLost(false);

    console.log('Hangman game started', { 
      category: selectedCategory, 
      wordLength: wordData.word.length 
    });
  };

  // Start fresh game (reset everything)
  const startFreshGame = (): void => {
    setCategory(null);
    setWord('');
    setHint('');
    setGuessedLetters([]);
    setWrongGuesses(0);
    setScore(0);
    setWordsCompleted(0);
    setIsPlaying(false);
    setGameWon(false);
    setGameLost(false);
  };

  // Continue to next word (same category)
  const nextWord = (): void => {
    if (!category) return;
    
    const wordData = getRandomWord(category);

    setWord(wordData.word);
    setHint(wordData.hint);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameWon(false);
    setGameLost(false);
  };

  // Handle letter guess
  const handleGuess = (letter: string): void => {
    if (guessedLetters.includes(letter) || gameWon || gameLost) return;

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    if (!word.includes(letter)) {
      setWrongGuesses(prev => prev + 1);
    }
  };

  // Submit score to API
  const submitFinalScore = async (): Promise<void> => {
    try {
      const response = await fetch('/api/games/hangman/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game: 'hangman',
          score: score,
          meta: {
            wordsCompleted,
            category
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit score');
      }

      console.log('Hangman score submitted successfully');
    } catch (error) {
      console.error('Failed to submit hangman score:', error);
    }
  };

  // Check win/lose conditions
  useEffect(() => {
    if (!isPlaying || !word) return;

    // Check if won
    const wordLetters = word.split('');
    const isWon = wordLetters.every(letter => guessedLetters.includes(letter));

    if (isWon && !gameWon) {
      setGameWon(true);
      setWordsCompleted(prev => prev + 1);

      // Calculate score
      let points = 50; // Base points
      points += (MAX_WRONG_GUESSES - wrongGuesses) * 10; // Bonus for fewer mistakes
      if (word.length > 7) points += 20; // Bonus for longer words

      setScore(prev => prev + points);

      console.log('Hangman word completed', { word, points, wrongGuesses });
    }

    // Check if lost
    if (wrongGuesses >= MAX_WRONG_GUESSES && !gameLost) {
      setGameLost(true);
      submitFinalScore();

      console.log('Hangman game lost', { word, wordsCompleted });
    }
  }, [guessedLetters, wrongGuesses, word, isPlaying, gameWon, gameLost, score, wordsCompleted, category]);

  const handleBackToDashboard = (): void => {
    if (onBackToDashboard) {
      onBackToDashboard();
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden ${className}`}>
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToDashboard}
            className="text-white/80 hover:text-white transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-white">Word Puzzle</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-white text-right">
            <div className="text-sm opacity-70">Welcome back</div>
            <div className="font-semibold">{user?.name || 'Player'}</div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Game Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🎯 Word Puzzle</h1>
          <p className="text-white/70">Guess the word before you run out of attempts!</p>
        </div>

        {/* Instructions */}
        {!isPlaying && (
          <div className="max-w-md mx-auto mb-8">
            <Instructions gameType="hangman" />
          </div>
        )}

        {/* Category Selection */}
        {!isPlaying && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose a Category</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button
                  onClick={() => startGame('animals')}
                  className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-6 px-4 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
                >
                  <div className="text-3xl mb-2">🦁</div>
                  Animals
                </button>

                <button
                  onClick={() => startGame('countries')}
                  className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-6 px-4 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
                >
                  <div className="text-3xl mb-2">🌍</div>
                  Countries
                </button>

                <button
                  onClick={() => startGame('fruits')}
                  className="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-6 px-4 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
                >
                  <div className="text-3xl mb-2">🍎</div>
                  Fruits
                </button>

                <button
                  onClick={() => startGame('technology')}
                  className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-6 px-4 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
                >
                  <div className="text-3xl mb-2">💻</div>
                  Technology
                </button>

                <button
                  onClick={() => startGame('sports')}
                  className="bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-6 px-4 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
                >
                  <div className="text-3xl mb-2">⚽</div>
                  Sports
                </button>

                <button
                  onClick={() => startGame('nature')}
                  className="bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-6 px-4 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
                >
                  <div className="text-3xl mb-2">🌲</div>
                  Nature
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Screen */}
        {isPlaying && !gameWon && !gameLost && (
          <div className="max-w-4xl mx-auto">
            {/* Stats */}
            <HangmanStats
              score={score}
              wordsCompleted={wordsCompleted}
              wrongGuesses={wrongGuesses}
              maxGuesses={MAX_WRONG_GUESSES}
              category={category}
            />

            {/* Main Game Area */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Hangman Drawing */}
              <HangmanDrawing wrongGuesses={wrongGuesses} />

              {/* Word Display and Clue */}
              <div className="space-y-6">
                <WordDisplay word={word} guessedLetters={guessedLetters} />

                {/* Clue Section */}
                <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-6 border-2 border-yellow-500/40">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">💡</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-yellow-300 mb-2">Clue:</h3>
                      <p className="text-white text-base leading-relaxed">{hint}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyboard */}
            <Keyboard
              guessedLetters={guessedLetters}
              onGuess={handleGuess}
              word={word}
            />
          </div>
        )}

        {/* Win Modal */}
        {gameWon && (
          <HangmanWinModal
            word={word}
            wrongGuesses={wrongGuesses}
            maxGuesses={MAX_WRONG_GUESSES}
            score={score}
            wordsCompleted={wordsCompleted}
            onNextWord={nextWord}
            onBackToMenu={startFreshGame}
          />
        )}

        {/* Lose Modal */}
        {gameLost && (
          <HangmanLoseModal
            word={word}
            score={score}
            wordsCompleted={wordsCompleted}
            onTryAgain={startFreshGame}
          />
        )}

        {/* Leaderboard */}
        {!isPlaying && (
          <div className="mt-12">
            <Leaderboard gameType="hangman" />
          </div>
        )}
      </main>
    </div>
  );
};

export default HangmanPage;