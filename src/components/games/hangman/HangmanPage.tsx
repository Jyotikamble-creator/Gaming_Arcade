'use client';

import React, { useEffect, useState } from 'react';
import Instructions from '@/components/shared/Instructions';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import HangmanDrawing from './HangmanDrawing';
import WordDisplay from './WordDisplay';
import Keyboard from './Keyboard';
import HangmanStats from './HangmanStats';
import HangmanWinModal from './HangmanWinModal';
import HangmanLoseModal from './HangmanLoseModal';
import AnimatedBackground from '@/components/AnimatedBackground';
import { HangmanDifficulty, DIFFICULTY_CONFIG } from '@/types/games/hangman';

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
  // Difficulty state
  const [difficulty, setDifficulty] = useState<HangmanDifficulty>('medium');
  const [gameStarted, setGameStarted] = useState<boolean>(false);

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

  const diffConfig = DIFFICULTY_CONFIG[difficulty];
  const MAX_WRONG_GUESSES = diffConfig.maxWrongGuesses;
  const BASE_POINTS = diffConfig.basePoints;

  // Word categories with hints - organized by difficulty
  const WORD_CATEGORIES_BY_DIFFICULTY = {
    easy: {
      animals: [
        { word: 'cat', hint: 'Common household pet' },
        { word: 'dog', hint: 'Man\'s best friend' },
        { word: 'bird', hint: 'Animal with wings that flies' },
        { word: 'fish', hint: 'Animal that lives in water' },
        { word: 'bear', hint: 'Large furry animal' },
        { word: 'lion', hint: 'King of the jungle' },
        { word: 'shark', hint: 'Dangerous fish in the ocean' },
        { word: 'eagle', hint: 'Large bird that flies high' },
        { word: 'snake', hint: 'Long reptile with no legs' },
        { word: 'horse', hint: 'Animal people ride on' }
      ],
      countries: [
        { word: 'india', hint: 'Country in Asia with the Taj Mahal' },
        { word: 'japan', hint: 'Island country in East Asia' },
        { word: 'france', hint: 'European country with the Eiffel Tower' },
        { word: 'brazil', hint: 'Large country in South America' },
        { word: 'china', hint: 'Most populated country in the world' },
        { word: 'egypt', hint: 'Country with ancient pyramids' },
        { word: 'canada', hint: 'Country north of USA' },
        { word: 'spain', hint: 'European country with flamenco' },
        { word: 'italy', hint: 'Country famous for pasta and pizza' },
        { word: 'mexico', hint: 'Country south of USA' }
      ],
      fruits: [
        { word: 'apple', hint: 'Red or green fruit' },
        { word: 'banana', hint: 'Yellow curved fruit' },
        { word: 'orange', hint: 'Citrus fruit that\'s orange colored' },
        { word: 'grape', hint: 'Small round fruit often in bunches' },
        { word: 'melon', hint: 'Large green fruit with sweet flesh' },
        { word: 'mango', hint: 'Tropical orange fruit' },
        { word: 'peach', hint: 'Fuzzy round fruit' },
        { word: 'plum', hint: 'Small purple fruit' },
        { word: 'lime', hint: 'Green citrus fruit' },
        { word: 'lemon', hint: 'Yellow citrus fruit that is sour' }
      ],
      technology: [
        { word: 'mouse', hint: 'Device to control a computer' },
        { word: 'phone', hint: 'Device to make calls' },
        { word: 'email', hint: 'Electronic mail sent online' },
        { word: 'chat', hint: 'Real-time text communication' },
        { word: 'video', hint: 'Moving pictures with sound' },
        { word: 'wifi', hint: 'Wireless internet connection' },
        { word: 'cloud', hint: 'Online storage for files' },
        { word: 'server', hint: 'Computer that stores websites' },
        { word: 'robot', hint: 'Machine that can perform tasks' },
        { word: 'virus', hint: 'Harmful computer program' }
      ],
      sports: [
        { word: 'tennis', hint: 'Racket sport played on a court' },
        { word: 'boxing', hint: 'Sport where people fight with gloves' },
        { word: 'golf', hint: 'Sport played on green grass courses' },
        { word: 'rugby', hint: 'Sport similar to football with an oval ball' },
        { word: 'chess', hint: 'Strategic board game' },
        { word: 'darts', hint: 'Game throwing small arrows' },
        { word: 'archery', hint: 'Sport shooting arrows at targets' },
        { word: 'karate', hint: 'Martial art with hand and foot kicks' },
        { word: 'skiing', hint: 'Winter sport on snow' },
        { word: 'skating', hint: 'Moving on ice with special shoes' }
      ],
      nature: [
        { word: 'river', hint: 'Large flowing body of water' },
        { word: 'cloud', hint: 'White fluffy thing in the sky' },
        { word: 'storm', hint: 'Heavy rain and wind weather' },
        { word: 'frost', hint: 'Ice that forms on cold surfaces' },
        { word: 'beach', hint: 'Sandy area by the ocean' },
        { word: 'island', hint: 'Land surrounded by water' },
        { word: 'valley', hint: 'Low area between mountains' },
        { word: 'forest', hint: 'Area with many trees' },
        { word: 'flame', hint: 'Hot fire light' },
        { word: 'sunset', hint: 'When the sun goes down' }
      ]
    },
    medium: {
      animals: [
        { word: 'elephant', hint: 'Largest land animal with a trunk' },
        { word: 'giraffe', hint: 'Tallest animal with a very long neck' },
        { word: 'penguin', hint: 'Flightless bird that lives in cold climates' },
        { word: 'dolphin', hint: 'Intelligent marine mammal that jumps' },
        { word: 'cheetah', hint: 'Fastest land animal with spots' },
        { word: 'octopus', hint: 'Sea creature with eight arms' },
        { word: 'butterfly', hint: 'Colorful insect with beautiful wings' },
        { word: 'crocodile', hint: 'Large reptile that lives in water with powerful jaws' },
        { word: 'antelope', hint: 'Fast running animal with horns' },
        { word: 'flamingo', hint: 'Pink colored bird that stands on one leg' }
      ],
      countries: [
        { word: 'australia', hint: 'Island continent known for kangaroos' },
        { word: 'argentina', hint: 'Country in South America famous for football' },
        { word: 'switzerland', hint: 'European country known for chocolate' },
        { word: 'indonesia', hint: 'Island nation in Southeast Asia' },
        { word: 'portugal', hint: 'Country on the western coast of Europe' },
        { word: 'thailand', hint: 'Country in Southeast Asia' },
        { word: 'scotland', hint: 'Country known for bagpipes' },
        { word: 'vietnam', hint: 'Country in Southeast Asia' },
        { word: 'colombia', hint: 'South American country known for coffee' },
        { word: 'morocco', hint: 'North African country' }
      ],
      fruits: [
        { word: 'strawberry', hint: 'Small red fruit with seeds on the outside' },
        { word: 'pineapple', hint: 'Tropical fruit with spiky skin' },
        { word: 'watermelon', hint: 'Large green fruit with red flesh' },
        { word: 'blueberry', hint: 'Small round blue fruit' },
        { word: 'raspberry', hint: 'Small red berry with bumps' },
        { word: 'papaya', hint: 'Tropical orange fruit' },
        { word: 'coconut', hint: 'Brown tropical fruit with white flesh' },
        { word: 'avocado', hint: 'Green fruit with a large seed' },
        { word: 'dragonfruit', hint: 'Exotic pink fruit with spiky exterior' },
        { word: 'pomegranate', hint: 'Fruit with many seeds inside' }
      ],
      technology: [
        { word: 'computer', hint: 'Electronic device for computing' },
        { word: 'keyboard', hint: 'Device with keys for typing' },
        { word: 'software', hint: 'Programs that run on devices' },
        { word: 'database', hint: 'Organized collection of data' },
        { word: 'algorithm', hint: 'Step-by-step procedure' },
        { word: 'smartphone', hint: 'Mobile computing device' },
        { word: 'programmer', hint: 'Person who writes code' },
        { word: 'interface', hint: 'Design connecting user and system' },
        { word: 'bandwidth', hint: 'Speed of data transmission' },
        { word: 'encryption', hint: 'Scrambling data for security' }
      ],
      sports: [
        { word: 'basketball', hint: 'Sport with hoops and a ball' },
        { word: 'volleyball', hint: 'Sport hitting a ball over a net' },
        { word: 'cricket', hint: 'Bat and ball sport from India' },
        { word: 'baseball', hint: 'American sport with bases' },
        { word: 'swimming', hint: 'Moving through water as sport' },
        { word: 'gymnastics', hint: 'Sport with flips and flexibility' },
        { word: 'badminton', hint: 'Racket sport with shuttlecock' },
        { word: 'lacrosse', hint: 'Sport with sticks and a ball' },
        { word: 'fencing', hint: 'Combat sport with swords' },
        { word: 'equestrian', hint: 'Sport involving horses' }
      ],
      nature: [
        { word: 'mountain', hint: 'Very tall natural elevation' },
        { word: 'rainbow', hint: 'Colorful arc after rain' },
        { word: 'volcano', hint: 'Mountain that erupts with lava' },
        { word: 'thunder', hint: 'Loud sound during storms' },
        { word: 'hurricane', hint: 'Powerful rotating storm' },
        { word: 'waterfall', hint: 'Water falling from height' },
        { word: 'glacier', hint: 'Slow-moving mass of ice' },
        { word: 'desert', hint: 'Dry sandy area' },
        { word: 'canyon', hint: 'Deep valley with steep walls' },
        { word: 'ecosystem', hint: 'Community of organisms' }
      ]
    },
    hard: {
      animals: [
        { word: 'rhinoceros', hint: 'Large animal with one or two horns' },
        { word: 'chimpanzee', hint: 'Great ape with intelligence' },
        { word: 'hippopotamus', hint: 'Large river mammal with big mouth' },
        { word: 'platypus', hint: 'Unique Australian egg-laying mammal' },
        { word: 'chameleon', hint: 'Lizard that changes color' },
        { word: 'tarantula', hint: 'Large venomous spider' },
        { word: 'jellyfish', hint: 'Sea creature with tentacles' },
        { word: 'centipede', hint: 'Creature with many legs' },
        { word: 'penguin', hint: 'Flightless Antarctic bird' },
        { word: 'armadillo', hint: 'Armored mammal from America' }
      ],
      countries: [
        { word: 'kazakhstan', hint: 'Large Central Asian country' },
        { word: 'new_zealand', hint: 'Island country known for LOTR filming' },
        { word: 'bangladesh', hint: 'Country with delta rivers' },
        { word: 'venezuela', hint: 'Country with Angel Falls' },
        { word: 'singapore', hint: 'Small city-state in Asia' },
        { word: 'luxembourg', hint: 'Small European country' },
        { word: 'montenegro', hint: 'Small Balkan country' },
        { word: 'mauritius', hint: 'Island nation off Africa' },
        { word: 'seychelles', hint: 'Small island nation in Indian Ocean' },
        { word: 'liechtenstein', hint: 'Tiny European country between Switzerland and Austria' }
      ],
      fruits: [
        { word: 'blackcurrant', hint: 'Small dark berry' },
        { word: 'passionfruit', hint: 'Exotic fruit with passion in name' },
        { word: 'gooseberry', hint: 'Small tart berry' },
        { word: 'tangerine', hint: 'Small orange-like citrus fruit' },
        { word: 'persimmon', hint: 'Orange fruit from Asia' },
        { word: 'grapefruit', hint: 'Large citrus fruit' },
        { word: 'mulberry', hint: 'Berry from a mulberry tree' },
        { word: 'nectarine', hint: 'Smooth-skinned peach' },
        { word: 'tangerine', hint: 'Type of mandarin orange' },
        { word: 'rambutan', hint: 'Hairy Southeast Asian fruit' }
      ],
      technology: [
        { word: 'blockchain', hint: 'Technology behind cryptocurrencies' },
        { word: 'cybersecurity', hint: 'Protection against digital attacks' },
        { word: 'virtualization', hint: 'Creating virtual computers' },
        { word: 'middleware', hint: 'Software connecting applications' },
        { word: 'cryptography', hint: 'Science of encryption' },
        { word: 'infrastructure', hint: 'Basic systems and facilities' },
        { word: 'optimization', hint: 'Process of improving efficiency' },
        { word: 'synchronization', hint: 'Coordinating timing of processes' },
        { word: 'architecture', hint: 'Overall design of a system' },
        { word: 'authentication', hint: 'Process of verifying identity' }
      ],
      sports: [
        { word: 'triathlon', hint: 'Three-sport competition' },
        { word: 'pentathlon', hint: 'Five-event athletic competition' },
        { word: 'biathlon', hint: 'Skiing and shooting competition' },
        { word: 'decathlon', hint: 'Ten-event athletic competition' },
        { word: 'orienteering', hint: 'Navigation and racing sport' },
        { word: 'bouldering', hint: 'Rock climbing on natural rocks' },
        { word: 'curling', hint: 'Winter sport with sliding stones' },
        { word: 'bobsleigh', hint: 'Winter team sliding sport' },
        { word: 'pentathlete', hint: 'Person competing in five sports' },
        { word: 'mountaineering', hint: 'Climbing mountains as sport' }
      ],
      nature: [
        { word: 'photography', hint: 'Art of capturing light images' },
        { word: 'meteorology', hint: 'Study of weather and atmosphere' },
        { word: 'biodiversity', hint: 'Variety of living organisms' },
        { word: 'geothermal', hint: 'Energy from earth\'s heat' },
        { word: 'seismic', hint: 'Related to earthquakes' },
        { word: 'atmosphere', hint: 'Layer of gas around earth' },
        { word: 'lithosphere', hint: 'Earth\'s solid rocky crust' },
        { word: 'hydrosphere', hint: 'All water on earth' },
        { word: 'biosphere', hint: 'All life on earth' },
        { word: 'stratosphere', hint: 'Layer of atmosphere with ozone' }
      ]
    }
  };

  // Get word categories based on difficulty
  const WORD_CATEGORIES: CategoryInfo = WORD_CATEGORIES_BY_DIFFICULTY[difficulty];

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
            category: category || 'general'
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to submit score');
      }

      const data = await response.json();
      console.log('Hangman score submitted successfully:', data);
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
      let points = BASE_POINTS; // Base points
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

  const handleDifficultySelect = (selectedDifficulty: HangmanDifficulty): void => {
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
  };

  // Start a game with selected category
  const startGame = (selectedCategory: Category): void => {
    const categories = WORD_CATEGORIES;
    const words = categories[selectedCategory];
    
    if (!words || words.length === 0) {
      console.error('No words found for category:', selectedCategory);
      return;
    }

    // Select random word from category
    const randomWord = words[Math.floor(Math.random() * words.length)];
    
    // Reset game state
    setCategory(selectedCategory);
    setWord(randomWord.word.toLowerCase());
    setHint(randomWord.hint);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameWon(false);
    setGameLost(false);
    setIsPlaying(true);
  };

  // Start a fresh game by going back to category selection
  const startFreshGame = (): void => {
    setCategory(null);
    setWord('');
    setHint('');
    setGuessedLetters([]);
    setWrongGuesses(0);
    setScore(0);
    setWordsCompleted(0);
    setGameWon(false);
    setGameLost(false);
    setIsPlaying(false);
  };

  // Move to next word in the same category
  const nextWord = (): void => {
    if (!category) {
      console.error('No category selected');
      return;
    }

    const categories = WORD_CATEGORIES;
    const words = categories[category];

    if (!words || words.length === 0) {
      console.error('No words found for category:', category);
      return;
    }

    // Select random word from category
    const randomWord = words[Math.floor(Math.random() * words.length)];

    // Reset word-specific state but keep score and wordsCompleted
    setWord(randomWord.word.toLowerCase());
    setHint(randomWord.hint);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameWon(false);
    setGameLost(false);
    setIsPlaying(true);
  };

  // Difficulty selection screen
  if (!gameStarted) {
    return (
      <div className={`min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden flex items-center justify-center ${className}`}>
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Title */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                🎯 Hangman
              </h1>
              <p className="text-gray-300 text-xl mb-4">
                Guess the word and test your knowledge!
              </p>
              <p className="text-gray-400 text-lg">
                Select a difficulty level to begin
              </p>
            </div>

            {/* Difficulty Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Easy */}
              <button
                onClick={() => handleDifficultySelect('easy')}
                className="group relative overflow-hidden rounded-xl bg-linear-to-br from-green-500/20 to-emerald-600/20 border border-green-500/50 p-8 hover:border-green-400 hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">🌱</div>
                  <h3 className="text-3xl font-bold text-green-400 mb-3">Easy</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ 8 Wrong Guesses</li>
                    <li>✓ 40 Base Points</li>
                    <li>✓ Perfect for Beginners</li>
                  </ul>
                </div>
              </button>

              {/* Medium */}
              <button
                onClick={() => handleDifficultySelect('medium')}
                className="group relative overflow-hidden rounded-xl bg-linear-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/50 p-8 hover:border-yellow-400 hover:from-yellow-500/30 hover:to-orange-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">⚡</div>
                  <h3 className="text-3xl font-bold text-yellow-400 mb-3">Medium</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ 6 Wrong Guesses</li>
                    <li>✓ 50 Base Points</li>
                    <li>✓ Balanced Challenge</li>
                  </ul>
                </div>
              </button>

              {/* Hard */}
              <button
                onClick={() => handleDifficultySelect('hard')}
                className="group relative overflow-hidden rounded-xl bg-linear-to-br from-red-500/20 to-pink-600/20 border border-red-500/50 p-8 hover:border-red-400 hover:from-red-500/30 hover:to-pink-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">🔥</div>
                  <h3 className="text-3xl font-bold text-red-400 mb-3">Hard</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ 4 Wrong Guesses</li>
                    <li>✓ 70 Base Points</li>
                    <li>✓ Expert Level</li>
                  </ul>
                </div>
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4 text-center text-lg">How to Play</h3>
              <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                <div className="space-y-2">
                  <p>🎯 Guess letters to reveal the hidden word</p>
                  <p>✅ Complete all words in a category</p>
                </div>
                <div className="space-y-2">
                  <p>💡 Use hints to help you guess</p>
                  <p>🏆 Earn points for correct guesses!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-linear-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden ${className}`}>
      <AnimatedBackground />
      
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
                  className="bg-linear-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-6 px-4 rounded-xl transition-all duration-200 shadow-lg hover:scale-105">
                  <div className="text-3xl mb-2">🦁</div>
                  Animals
                </button>

                <button
                  onClick={() => startGame('countries')}
                  className="bg-linear-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-6 px-4 rounded-xl transition-all duration-200 shadow-lg hover:scale-105">
                  <div className="text-3xl mb-2">🌍</div>
                  Countries
                </button>

                <button
                  onClick={() => startGame('fruits')}
                  className="bg-linear-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-6 px-4 rounded-xl transition-all duration-200 shadow-lg hover:scale-105">
                  <div className="text-3xl mb-2">🍎</div>
                  Fruits
                </button>

                <button
                  onClick={() => startGame('technology')}
                  className="bg-linear-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-6 px-4 rounded-xl transition-all duration-200 shadow-lg hover:scale-105">
                  <div className="text-3xl mb-2">💻</div>
                  Technology
                </button>

                <button
                  onClick={() => startGame('sports')}
                  className="bg-linear-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-6 px-4 rounded-xl transition-all duration-200 shadow-lg hover:scale-105">
                  <div className="text-3xl mb-2">⚽</div>
                  Sports
                </button>

                <button
                  onClick={() => startGame('nature')}
                  className="bg-linear-to-br from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-6 px-4 rounded-xl transition-all duration-200 shadow-lg hover:scale-105">
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
                <div className="bg-linear-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-6 border-2 border-yellow-500/40">
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