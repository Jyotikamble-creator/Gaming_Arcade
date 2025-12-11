import React, { useState, useEffect } from 'react';
import { submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/leaderboard/Leaderboard';
import PuzzleDisplay from '../components/codingpuzzle/PuzzleDisplay';
import PuzzleInput from '../components/codingpuzzle/PuzzleInput';
import PuzzleStats from '../components/codingpuzzle/PuzzleStats';
import PuzzleHint from '../components/codingpuzzle/PuzzleHint';
import PuzzleCompletedModal from '../components/codingpuzzle/PuzzleCompletedModal';

// Puzzle categories with questions
const PUZZLE_CATEGORIES = {
  patterns: [
    {
      question: "What comes next in the sequence? 2, 4, 8, 16, 32, ?",
      answer: "64",
      hint: "Each number is multiplied by 2",
      difficulty: "easy"
    },
    {
      question: "Complete the pattern: 1, 1, 2, 3, 5, 8, 13, ?",
      answer: "21",
      hint: "Fibonacci sequence - add previous two numbers",
      difficulty: "medium"
    },
    {
      question: "What's next? 100, 90, 81, 73, 66, ?",
      answer: "60",
      hint: "Subtract 10, then 9, then 8, then 7, then 6...",
      difficulty: "medium"
    },
    {
      question: "Find the missing number: 3, 9, 27, 81, ?",
      answer: "243",
      hint: "Each number is multiplied by 3",
      difficulty: "easy"
    },
    {
      question: "Continue the sequence: 1, 4, 9, 16, 25, ?",
      answer: "36",
      hint: "Perfect squares: 1², 2², 3², 4², 5², ?",
      difficulty: "easy"
    }
  ],
  codeOutput: [
    {
      question: "What does this print?\nfor i in range(3):\n    print(i * 2)",
      answer: "0 2 4",
      hint: "Loop runs 3 times (0,1,2), each multiplied by 2",
      difficulty: "easy"
    },
    {
      question: "What's the output?\nx = 5\ny = x + 3\nprint(x * y)",
      answer: "40",
      hint: "x=5, y=8, so 5*8=40",
      difficulty: "easy"
    },
    {
      question: "Predict the result:\nlist = [1, 2, 3]\nprint(list[1] + list[2])",
      answer: "5",
      hint: "Index 1 is 2, index 2 is 3. 2+3=5",
      difficulty: "easy"
    },
    {
      question: "What prints?\ncount = 0\nfor i in range(5):\n    if i % 2 == 0:\n        count += 1\nprint(count)",
      answer: "3",
      hint: "Count even numbers: 0, 2, 4 (3 total)",
      difficulty: "medium"
    },
    {
      question: "Output?\nresult = 1\nfor i in range(1, 4):\n    result *= i\nprint(result)",
      answer: "6",
      hint: "Factorial: 1*1*2*3=6",
      difficulty: "medium"
    }
  ],
  logic: [
    {
      question: "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?",
      answer: "yes",
      hint: "Follow the chain: Bloops → Razzies → Lazzies",
      difficulty: "easy"
    },
    {
      question: "A bat and ball cost $1.10. The bat costs $1 more than the ball. How much does the ball cost? (in cents)",
      answer: "5",
      hint: "If ball = x, bat = x+100, so x + x+100 = 110",
      difficulty: "hard"
    },
    {
      question: "How many times can you subtract 10 from 100?",
      answer: "1",
      hint: "After first subtraction, it's not 100 anymore",
      difficulty: "easy"
    },
    {
      question: "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
      answer: "5",
      hint: "Each machine makes 1 widget in 5 minutes",
      difficulty: "medium"
    },
    {
      question: "What's the minimum number of cuts needed to divide a cake into 8 equal pieces?",
      answer: "3",
      hint: "Cut vertically twice (4 pieces), then horizontally once",
      difficulty: "medium"
    }
  ],
  bitwise: [
    {
      question: "What is 5 & 3 in binary operation? (AND operation)",
      answer: "1",
      hint: "5=101, 3=011, AND gives 001 = 1",
      difficulty: "hard"
    },
    {
      question: "What is 6 | 3 in binary operation? (OR operation)",
      answer: "7",
      hint: "6=110, 3=011, OR gives 111 = 7",
      difficulty: "hard"
    },
    {
      question: "What is 5 ^ 3 in binary operation? (XOR operation)",
      answer: "6",
      hint: "5=101, 3=011, XOR gives 110 = 6",
      difficulty: "hard"
    },
    {
      question: "What is 8 >> 2? (Right shift by 2)",
      answer: "2",
      hint: "8=1000, shift right by 2 gives 10 = 2",
      difficulty: "hard"
    },
    {
      question: "What is 3 << 2? (Left shift by 2)",
      answer: "12",
      hint: "3=11, shift left by 2 gives 1100 = 12",
      difficulty: "hard"
    }
  ]
};

const DIFFICULTY_POINTS = {
  easy: 10,
  medium: 20,
  hard: 30
};

const TOTAL_PUZZLES = 10;

export default function CodingPuzzle() {
  const [category, setCategory] = useState(null);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [usedPuzzles, setUsedPuzzles] = useState([]);

  // Get random puzzle from category
  const getRandomPuzzle = (selectedCategory) => {
    const categoryPuzzles = PUZZLE_CATEGORIES[selectedCategory];
    const availablePuzzles = categoryPuzzles.filter(
      (puzzle, index) => !usedPuzzles.includes(`${selectedCategory}-${index}`)
    );
    
    if (availablePuzzles.length === 0) {
      return null;
    }
    
    const randomPuzzle = availablePuzzles[Math.floor(Math.random() * availablePuzzles.length)];
    const puzzleIndex = categoryPuzzles.indexOf(randomPuzzle);
    setUsedPuzzles([...usedPuzzles, `${selectedCategory}-${puzzleIndex}`]);
    
    return randomPuzzle;
  };

  // Start game
  const startGame = (selectedCategory) => {
    const puzzle = getRandomPuzzle(selectedCategory);
    
    setCategory(selectedCategory);
    setCurrentPuzzle(puzzle);
    setUserAnswer('');
    setScore(0);
    setPuzzlesSolved(0);
    setStreak(0);
    setBestStreak(0);
    setShowHint(false);
    setFeedback(null);
    setIsPlaying(true);
    setGameCompleted(false);
    setUsedPuzzles([]);
    
    logger.info('Coding Puzzle game started', { category: selectedCategory }, LogTags.WORD_GUESS);
  };

  // Handle answer submission
  const handleSubmit = () => {
    if (!userAnswer.trim()) return;

    const isCorrect = userAnswer.trim().toLowerCase() === currentPuzzle.answer.toLowerCase();
    
    if (isCorrect) {
      // Calculate score
      let points = DIFFICULTY_POINTS[currentPuzzle.difficulty];
      if (!showHint) points += 5; // Bonus for not using hint
      if (streak >= 2) points += streak * 2; // Streak bonus
      
      setScore(prev => prev + points);
      setPuzzlesSolved(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        return newStreak;
      });
      
      setFeedback({ type: 'success', message: `Correct! +${points} points` });
      
      logger.info('Coding puzzle solved', { 
        difficulty: currentPuzzle.difficulty, 
        points,
        streak: streak + 1 
      }, LogTags.WORD_GUESS);
      
      // Check if game completed
      if (puzzlesSolved + 1 >= TOTAL_PUZZLES) {
        setTimeout(() => {
          setGameCompleted(true);
          setIsPlaying(false);
          
          submitScore({
            game: 'coding-puzzle',
            score: score + points,
            meta: {
              puzzlesSolved: puzzlesSolved + 1,
              category,
              bestStreak: Math.max(bestStreak, streak + 1)
            }
          }).catch(error => {
            logger.error('Failed to submit Coding Puzzle score', error, {}, LogTags.SAVE_SCORE);
          });
        }, 1500);
      } else {
        // Load next puzzle
        setTimeout(() => {
          const nextPuzzle = getRandomPuzzle(category);
          setCurrentPuzzle(nextPuzzle);
          setUserAnswer('');
          setShowHint(false);
          setFeedback(null);
        }, 1500);
      }
    } else {
      setStreak(0);
      setFeedback({ type: 'error', message: 'Incorrect! Try again.' });
      
      setTimeout(() => {
        setFeedback(null);
      }, 2000);
    }
  };

  // Toggle hint
  const toggleHint = () => {
    setShowHint(!showHint);
  };

  // Skip puzzle
  const skipPuzzle = () => {
    setStreak(0);
    const nextPuzzle = getRandomPuzzle(category);
    
    if (nextPuzzle) {
      setCurrentPuzzle(nextPuzzle);
      setUserAnswer('');
      setShowHint(false);
      setFeedback(null);
    }
  };

  // Back to menu
  const backToMenu = () => {
    setCategory(null);
    setCurrentPuzzle(null);
    setIsPlaying(false);
    setGameCompleted(false);
  };

  // Play again
  const playAgain = () => {
    startGame(category);
  };

  return (
    <div className="min-h-screen text-light-text">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🧩 Coding Puzzle Solver</h1>
          <p className="text-gray-300">Test your programming logic and pattern recognition!</p>
        </div>

        {/* Instructions */}
        {!isPlaying && !gameCompleted && (
          <div className="max-w-md mx-auto mb-8">
            <Instructions gameType="coding-puzzle" />
          </div>
        )}

        {/* Category Selection */}
        {!isPlaying && !gameCompleted && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose a Puzzle Type</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => startGame('patterns')}
                  className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-8 px-6 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
                >
                  <div className="text-4xl mb-3">🔢</div>
                  <div className="text-xl mb-2">Number Patterns</div>
                  <div className="text-sm text-blue-200">Find the next number in sequences</div>
                </button>
                
                <button
                  onClick={() => startGame('codeOutput')}
                  className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-8 px-6 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
                >
                  <div className="text-4xl mb-3">💻</div>
                  <div className="text-xl mb-2">Code Output</div>
                  <div className="text-sm text-green-200">Predict what the code will print</div>
                </button>
                
                <button
                  onClick={() => startGame('logic')}
                  className="bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-8 px-6 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
                >
                  <div className="text-4xl mb-3">🧠</div>
                  <div className="text-xl mb-2">Logic Puzzles</div>
                  <div className="text-sm text-orange-200">Solve brain teasers and riddles</div>
                </button>
                
                <button
                  onClick={() => startGame('bitwise')}
                  className="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-8 px-6 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
                >
                  <div className="text-4xl mb-3">⚡</div>
                  <div className="text-xl mb-2">Bitwise Operations</div>
                  <div className="text-sm text-red-200">Binary calculations and shifts</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Screen */}
        {isPlaying && currentPuzzle && (
          <div className="max-w-3xl mx-auto">
            {/* Stats */}
            <PuzzleStats
              score={score}
              puzzlesSolved={puzzlesSolved}
              totalPuzzles={TOTAL_PUZZLES}
              streak={streak}
              bestStreak={bestStreak}
            />

            {/* Puzzle Display */}
            <PuzzleDisplay
              puzzle={currentPuzzle}
              puzzleNumber={puzzlesSolved + 1}
              totalPuzzles={TOTAL_PUZZLES}
            />

            {/* Hint */}
            {showHint && (
              <PuzzleHint hint={currentPuzzle.hint} />
            )}

            {/* Input */}
            <PuzzleInput
              userAnswer={userAnswer}
              setUserAnswer={setUserAnswer}
              onSubmit={handleSubmit}
              onSkip={skipPuzzle}
              onToggleHint={toggleHint}
              showHint={showHint}
              feedback={feedback}
            />
          </div>
        )}

        {/* Completed Modal */}
        {gameCompleted && (
          <PuzzleCompletedModal
            score={score}
            puzzlesSolved={puzzlesSolved}
            bestStreak={bestStreak}
            category={category}
            onPlayAgain={playAgain}
            onBackToMenu={backToMenu}
          />
        )}

        {/* Leaderboard */}
        {!isPlaying && !gameCompleted && (
          <div className="mt-12">
            <Leaderboard game="coding-puzzle" />
          </div>
        )}
      </div>
    </div>
  );
}
