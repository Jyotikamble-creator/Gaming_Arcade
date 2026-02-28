"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Components
import EmojiDisplay from './EmojiDisplay';
import GuessInput from './GuessInput';
import GameStats from './GameStats';
import HintSystem from './HintSystem';
import Confetti from './Confetti';
import AnimatedBackground from '@/components/AnimatedBackground';
import ProgressRing from './ProgressRing';
import Instructions from '@/components/shared/Instructions';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import EmojiGuessHeader from './EmojiGuessHeader';
import EmojiGuessAchievements from './EmojiGuessAchievements';
import EmojiGuessMessage from './EmojiGuessMessage';
import EmojiGuessControls from './EmojiGuessControls';
import EmojiGuessLoading from './EmojiGuessLoading';
import EmojiGuessError from './EmojiGuessError';

// Types
interface EmojiPuzzle {
  id: string;
  emojis: string;
  answer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

interface GameAchievements {
  firstWin: boolean;
  streak5: boolean;
  streak10: boolean;
  perfectGame: boolean;
}

interface EmojiGuessPageProps {
  user?: any;
  className?: string;
}

type MessageType = 'success' | 'error' | 'info' | '';

// API functions - these would need to be implemented in the gamearchade API
async function fetchEmoji(): Promise<{ data: EmojiPuzzle }> {
  try {
    const response = await fetch('/api/games/emoji/puzzle');
    if (!response.ok) {
      throw new Error('Failed to fetch emoji puzzle');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching emoji puzzle:', error);
    throw error;
  }
}

async function submitScore(scoreData: {
  game: string;
  score: number;
  meta: {
    attempts: number;
    hintsUsed: number;
    puzzleId: string;
    streak: number;
  };
}): Promise<void> {
  try {
    const response = await fetch('/api/scores/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scoreData),
    });
    if (!response.ok) {
      throw new Error('Failed to submit score');
    }
  } catch (error) {
    console.error('Error submitting score:', error);
    throw error;
  }
}

// Main Emoji Guess game component
export default function EmojiGuessPage({ user, className = "" }: EmojiGuessPageProps) {
  const router = useRouter();
  const [puzzle, setPuzzle] = useState<EmojiPuzzle | null>(null);
  const [guess, setGuess] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<MessageType>('');
  const [score, setScore] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [achievements, setAchievements] = useState<GameAchievements>({
    firstWin: false,
    streak5: false,
    streak10: false,
    perfectGame: false,
  });

  useEffect(() => {
    loadPuzzle();
  }, []);

  // Load a new emoji puzzle from the API
  async function loadPuzzle(): Promise<void> {
    try {
      setIsLoading(true);
      console.log('Loading emoji puzzle');
      const response = await fetchEmoji();
      setPuzzle(response.data);
      setGuess('');
      setMessage('');
      setMessageType('');
      setAttempts(0);
      setHintsUsed(0);
      setShowHint(false);
      setGameStarted(true);
      console.log('Emoji puzzle loaded successfully', { puzzleId: response.data.id });
    } catch (error) {
      console.error('Failed to load emoji puzzle', error);
      setMessage('Failed to load puzzle. Please try again.');
      setMessageType('error');
      setPuzzle(null);
    } finally {
      setIsLoading(false);
    }
  }

  // Check the user's guess against the answer
  async function checkGuess(): Promise<void> {
    if (!guess.trim()) {
      setMessage('Please enter a guess!');
      setMessageType('error');
      return;
    }

    if (!puzzle) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (guess.trim().toLowerCase() === puzzle.answer.toLowerCase()) {
      // Calculate score based on difficulty, attempts, and hints used
      let basePoints = 50;
      if (puzzle.difficulty?.toLowerCase() === 'easy') basePoints = 50;
      else if (puzzle.difficulty?.toLowerCase() === 'medium') basePoints = 75;
      else if (puzzle.difficulty?.toLowerCase() === 'hard') basePoints = 100;

      let points = basePoints;
      points -= (newAttempts - 1) * 10; // Penalty for multiple attempts
      points -= hintsUsed * 15; // Penalty for hints
      points = Math.max(points, 10); // Minimum 10 points

      // Add streak bonus
      const streakBonus = Math.floor(streak / 3) * 10;
      points += streakBonus;

      setScore(prevScore => prevScore + points);
      setStreak(prevStreak => prevStreak + 1);
      setShowConfetti(true);

      // Check achievements
      const newAchievements = { ...achievements };
      if (!achievements.firstWin) {
        newAchievements.firstWin = true;
      }
      if (streak + 1 >= 5 && !achievements.streak5) {
        newAchievements.streak5 = true;
      }
      if (streak + 1 >= 10 && !achievements.streak10) {
        newAchievements.streak10 = true;
      }
      if (hintsUsed === 0 && !achievements.perfectGame) {
        newAchievements.perfectGame = true;
      }
      setAchievements(newAchievements);

      let bonusMessage = '';
      if (streakBonus > 0) bonusMessage = ` (+${streakBonus} streak bonus!)`;
      if (Object.values(newAchievements).some(achieved => achieved && !Object.values(achievements).includes(achieved))) {
        bonusMessage += ' 🏆 Achievement unlocked!';
      }

      setMessage(`🎉 Correct! You earned ${points} points!${bonusMessage}`);
      setMessageType('success');

      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 3000);

      try {
        await submitScore({
          game: 'emoji-guess',
          score: points,
          meta: { attempts: newAttempts, hintsUsed, puzzleId: puzzle.id, streak: streak + 1 }
        });
        console.log('Emoji guess score submitted', { score: points, attempts: newAttempts, streak: streak + 1 });
      } catch (error) {
        console.error('Failed to submit emoji guess score', error, { score: points });
      }
    } else {
      setStreak(0); // Reset streak on wrong answer
      if (newAttempts >= 3) {
        setMessage(`❌ Wrong! The correct answer was "${puzzle.answer}". Try a new puzzle!`);
        setMessageType('error');
      } else {
        const remainingAttempts = 3 - newAttempts;
        setMessage(`❌ Try again! ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} left.`);
        setMessageType('error');
      }
    }
  }

  // Use a hint, if available
  function useHint(): void {
    if (hintsUsed >= 2) return; // Max 2 hints
    setHintsUsed(prev => prev + 1);
    setShowHint(true);
    setScore(prevScore => Math.max(0, prevScore - 5)); // Hint penalty
  }

  function handleKeyPress(e: React.KeyboardEvent): void {
    if (e.key === 'Enter') {
      checkGuess();
    }
  }

  // Reset the game
  function handleTryAgain(): void {
    setAttempts(0);
    setMessage('');
    setGuess('');
    setStreak(0);
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return <EmojiGuessLoading />;
  }

  if (!puzzle) {
    return <EmojiGuessError message={message} onRetry={loadPuzzle} />;
  }

  // Main game UI
  return (
    <div className={`min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden ${className}`}>
      <AnimatedBackground />
      <Confetti show={showConfetti} />

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
          <h1 className="text-2xl font-bold text-white">Emoji Guess</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-white text-right">
            <div className="text-sm opacity-70">Welcome back</div>
            <div className="font-semibold">{user?.name || 'Player'}</div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <EmojiGuessHeader streak={streak} />

        {/* Achievement Badges */}
        <EmojiGuessAchievements achievements={achievements} />

        {/* Game Stats */}
        <div className="mb-8">
          <GameStats
            score={score}
            attempts={attempts}
            hintsUsed={hintsUsed}
            gameStarted={gameStarted}
          />
        </div>

        {/* Progress Ring */}
        {gameStarted && attempts > 0 && (
          <div className="flex justify-center mb-6">
            <ProgressRing
              progress={Math.min((attempts / 3) * 100, 100)}
              color={attempts >= 3 ? '#ef4444' : '#10b981'}
            />
          </div>
        )}

        {/* Emoji Display */}
        <div className="mb-8">
          <EmojiDisplay
            emojis={puzzle.emojis}
            category={puzzle.category}
            difficulty={puzzle.difficulty}
          />
        </div>

        {/* Hint System */}
        <div className="mb-6">
          <HintSystem
            showHint={showHint}
            answer={puzzle.answer}
            hintsUsed={hintsUsed}
            onUseHint={useHint}
            maxHints={2}
          />
        </div>

        {/* Guess Input */}
        <div className="mb-6">
          <GuessInput
            guess={guess}
            setGuess={setGuess}
            onSubmit={checkGuess}
            onKeyPress={handleKeyPress}
            disabled={attempts >= 3 && message.includes('Wrong')}
          />
        </div>

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="emoji-guess" />
        </div>

        {/* Message Display */}
        <EmojiGuessMessage message={message} messageType={messageType} />

        {/* Game Controls */}
        <EmojiGuessControls
          onNewPuzzle={loadPuzzle}
          onTryAgain={handleTryAgain}
          isLoading={isLoading}
          attempts={attempts}
          message={message}
        />

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard gameType="emoji-guess" />
        </div>
      </main>
    </div>
  );
}