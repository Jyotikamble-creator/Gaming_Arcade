import React, { useState, useEffect } from 'react';
import { submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/leaderboard/Leaderboard';
import BrainTeaserStats from '../components/brainteaser/BrainTeaserStats';
import BrainTeaserDisplay from '../components/brainteaser/BrainTeaserDisplay';
import BrainTeaserTimer from '../components/brainteaser/BrainTeaserTimer';
import BrainTeaserCompletedModal from '../components/brainteaser/BrainTeaserCompletedModal';

const GAME_DURATION = 60; // 60 seconds
const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star', 'hexagon'];
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'];
const PATTERNS = ['horizontal', 'vertical', 'diagonal', 'zigzag'];

export default function BrainTeaser() {
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [score, setScore] = useState(0);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Generate Match Shape puzzle
  const generateMatchShapePuzzle = () => {
    const targetShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const targetColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    const options = [];
    const correctIndex = Math.floor(Math.random() * 4);
    
    for (let i = 0; i < 4; i++) {
      if (i === correctIndex) {
        options.push({ shape: targetShape, color: targetColor });
      } else {
        // Create similar but different options
        const wrongShape = Math.random() > 0.5 ? targetShape : SHAPES[Math.floor(Math.random() * SHAPES.length)];
        const wrongColor = Math.random() > 0.5 ? targetColor : COLORS[Math.floor(Math.random() * COLORS.length)];
        
        // Ensure it's not exactly the same
        if (wrongShape === targetShape && wrongColor === targetColor) {
          options.push({ 
            shape: SHAPES[(SHAPES.indexOf(targetShape) + 1) % SHAPES.length], 
            color: targetColor 
          });
        } else {
          options.push({ shape: wrongShape, color: wrongColor });
        }
      }
    }
    
    return {
      type: 'match-shape',
      question: `Find the shape that matches:`,
      target: { shape: targetShape, color: targetColor },
      options,
      correctAnswer: correctIndex,
      points: 10
    };
  };

  // Generate Find Odd One puzzle
  const generateFindOddPuzzle = () => {
    const baseShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const baseColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const oddIndex = Math.floor(Math.random() * 5);
    
    const options = [];
    for (let i = 0; i < 5; i++) {
      if (i === oddIndex) {
        // The odd one differs in one property
        const differBy = Math.random() > 0.5 ? 'shape' : 'color';
        if (differBy === 'shape') {
          options.push({ 
            shape: SHAPES[(SHAPES.indexOf(baseShape) + 1) % SHAPES.length], 
            color: baseColor 
          });
        } else {
          options.push({ 
            shape: baseShape, 
            color: COLORS[(COLORS.indexOf(baseColor) + 1) % COLORS.length] 
          });
        }
      } else {
        options.push({ shape: baseShape, color: baseColor });
      }
    }
    
    return {
      type: 'find-odd',
      question: 'Find the odd one out:',
      options,
      correctAnswer: oddIndex,
      points: 15
    };
  };

  // Generate Pattern Test puzzle
  const generatePatternPuzzle = () => {
    const patternLength = 4;
    const shapes = [];
    const patternType = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    
    // Create a repeating pattern
    const basePattern = [
      SHAPES[Math.floor(Math.random() * SHAPES.length)],
      SHAPES[Math.floor(Math.random() * SHAPES.length)],
      SHAPES[Math.floor(Math.random() * SHAPES.length)]
    ];
    
    for (let i = 0; i < patternLength; i++) {
      shapes.push(basePattern[i % basePattern.length]);
    }
    
    // What comes next?
    const nextShape = basePattern[patternLength % basePattern.length];
    
    // Create options
    const options = [nextShape];
    while (options.length < 4) {
      const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      if (!options.includes(randomShape)) {
        options.push(randomShape);
      }
    }
    
    // Shuffle options
    const correctAnswer = 0;
    const shuffledOptions = options.sort(() => Math.random() - 0.5);
    const newCorrectAnswer = shuffledOptions.indexOf(nextShape);
    
    return {
      type: 'pattern',
      question: 'What comes next in the pattern?',
      pattern: shapes,
      options: shuffledOptions,
      correctAnswer: newCorrectAnswer,
      points: 20
    };
  };

  // Generate random puzzle
  const generatePuzzle = () => {
    const puzzleTypes = [generateMatchShapePuzzle, generateFindOddPuzzle, generatePatternPuzzle];
    const randomType = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)];
    return randomType();
  };

  // Start game
  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setPuzzlesSolved(0);
    setStreak(0);
    setBestStreak(0);
    setGameCompleted(false);
    setCurrentPuzzle(generatePuzzle());
    
    logger.info('Brain Teaser game started', {}, LogTags.WORD_GUESS);
  };

  // Handle answer
  const handleAnswer = (selectedIndex) => {
    if (!currentPuzzle || feedback) return;

    const isCorrect = selectedIndex === currentPuzzle.correctAnswer;
    
    if (isCorrect) {
      const points = currentPuzzle.points + (streak >= 3 ? Math.floor(streak / 3) * 5 : 0);
      setScore(prev => prev + points);
      setPuzzlesSolved(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        return newStreak;
      });
      
      setFeedback({ type: 'success', message: `Correct! +${points} points` });
      
      logger.info('Brain teaser solved', { 
        type: currentPuzzle.type, 
        points,
        streak: streak + 1 
      }, LogTags.WORD_GUESS);
    } else {
      setStreak(0);
      setFeedback({ type: 'error', message: 'Wrong answer!' });
    }
    
    // Next puzzle after short delay
    setTimeout(() => {
      setFeedback(null);
      setCurrentPuzzle(generatePuzzle());
    }, 1000);
  };

  // Timer countdown
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameCompleted(true);
          
          // Submit score
          submitScore({
            game: 'brain-teaser',
            score,
            meta: {
              puzzlesSolved,
              bestStreak,
              timeUsed: GAME_DURATION
            }
          }).catch(error => {
            logger.error('Failed to submit Brain Teaser score', error, {}, LogTags.SAVE_SCORE);
          });
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameCompleted, score, puzzlesSolved, bestStreak]);

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🧠 Brain Teasers</h1>
          <p className="text-gray-300">Test your visual reasoning and pattern recognition!</p>
        </div>

        {/* Instructions */}
        {!gameStarted && !gameCompleted && (
          <div className="max-w-md mx-auto mb-8">
            <Instructions gameType="brain-teaser" />
          </div>
        )}

        {/* Start Button */}
        {!gameStarted && !gameCompleted && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 shadow-2xl text-center">
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-xl py-6 px-12 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
              >
                Start Challenge
              </button>
              <p className="mt-4 text-gray-400">
                Solve as many puzzles as you can in {GAME_DURATION} seconds!
              </p>
            </div>
          </div>
        )}

        {/* Game Screen */}
        {gameStarted && !gameCompleted && currentPuzzle && (
          <div className="max-w-4xl mx-auto">
            {/* Timer */}
            <BrainTeaserTimer timeLeft={timeLeft} totalTime={GAME_DURATION} />

            {/* Stats */}
            <BrainTeaserStats
              score={score}
              puzzlesSolved={puzzlesSolved}
              streak={streak}
              bestStreak={bestStreak}
            />

            {/* Puzzle Display */}
            <BrainTeaserDisplay
              puzzle={currentPuzzle}
              onAnswer={handleAnswer}
              feedback={feedback}
            />
          </div>
        )}

        {/* Completed Modal */}
        {gameCompleted && (
          <BrainTeaserCompletedModal
            score={score}
            puzzlesSolved={puzzlesSolved}
            bestStreak={bestStreak}
            onPlayAgain={startGame}
            onBackToMenu={() => window.location.href = '/dashboard'}
          />
        )}

        {/* Leaderboard */}
        {!gameStarted && !gameCompleted && (
          <div className="mt-12">
            <Leaderboard game="brain-teaser" />
          </div>
        )}
      </div>
    </div>
  );
}
