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
import { 
  EmojiPuzzle, 
  EmojiGuessGameDifficulty, 
  DIFFICULTY_CONFIG 
} from '@/types/games/emoji-guess';

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
async function fetchEmoji(difficulty: EmojiGuessGameDifficulty): Promise<{ data: EmojiPuzzle }> {
  try {
    const response = await fetch(`/api/games/emoji/puzzle?difficulty=${difficulty}`);
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
    difficulty: EmojiGuessGameDifficulty;
  };
}): Promise<void> {
  try {
    const response = await fetch('/api/games/emoji/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scoreData),
    });
    if (!response.ok) {
      throw new Error('Failed to submit score');
    }
    console.log('Score submitted successfully:', scoreData);
  } catch (error) {
    console.error('Error submitting score:', error);
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<EmojiGuessGameDifficulty | null>(null);
  const [round, setRound] = useState<number>(0);
  const [achievements, setAchievements] = useState<GameAchievements>({
    firstWin: false,
    streak5: false,
    streak10: false,
    perfectGame: false,
  });

  // Start game with selected difficulty
  const startGameWithDifficulty = (selectedDifficulty: EmojiGuessGameDifficulty): void => {
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
    setRound(1);
    setScore(0);
    setStreak(0);
    setMessage('');
    setMessageType('');
    loadPuzzle(selectedDifficulty);
  };

  // Load a new emoji puzzle from the API
  const loadPuzzle = async (selectedDifficulty?: EmojiGuessGameDifficulty): Promise<void> => {
    const diffToUse = selectedDifficulty || difficulty;
    if (!diffToUse) return;

    try {
      setIsLoading(true);
      console.log('Loading emoji puzzle for difficulty:', diffToUse);
      const response = await fetchEmoji(diffToUse);
      setPuzzle(response.data);
      setGuess('');
      setMessage('');
      setMessageType('');
      setAttempts(0);
      setHintsUsed(0);
      setShowHint(false);
      console.log('Emoji puzzle loaded successfully', { puzzleId: response.data.id, difficulty: diffToUse });
    } catch (error) {
      console.error('Failed to load emoji puzzle', error);
      setMessage('Failed to load puzzle. Please try again.');
      setMessageType('error');
      setPuzzle(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check the user's guess against the answer
  async function checkGuess(): Promise<void> {
    if (!guess.trim()) {
      setMessage('Please enter a guess!');
      setMessageType('error');
      return;
    }

    if (!puzzle || !difficulty) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (guess.trim().toLowerCase() === puzzle.answer.toLowerCase()) {
      // Calculate score based on difficulty, attempts, and hints used
      const diffConfig = DIFFICULTY_CONFIG[difficulty];
      let points = diffConfig.basePoints;
      points -= (newAttempts - 1) * diffConfig.attemptPenalty; // Penalty for multiple attempts
      points -= hintsUsed * diffConfig.hintPenalty; // Penalty for hints
      points = Math.max(points, 10); // Minimum 10 points

      // Add streak bonus
      const streakBonus = Math.floor(streak / 3) * 10;
      points += streakBonus;

      setScore(prevScore => prevScore + points);
      setStreak(prevStreak => prevStreak + 1);
      setRound(prev => prev + 1);
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

      // Hide confetti after animation and load next puzzle
      setTimeout(() => {
        setShowConfetti(false);
        loadPuzzle(difficulty);
      }, 2000);

      try {
        await submitScore({
          game: 'emoji-guess',
          score: points,
          meta: { attempts: newAttempts, hintsUsed, puzzleId: puzzle.id, streak: streak + 1, difficulty }
        });
        console.log('Emoji guess score submitted', { score: points, attempts: newAttempts, streak: streak + 1, difficulty });
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
    if (!difficulty) return;
    const diffConfig = DIFFICULTY_CONFIG[difficulty];
    if (hintsUsed >= diffConfig.hintsAllowed) return;
    setHintsUsed(prev => prev + 1);
    setShowHint(true);
    setScore(prevScore => Math.max(0, prevScore - diffConfig.hintPenalty));
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

  // Show difficulty selection screen if game not started
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden flex items-center justify-center">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              {/* Title */}
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  🎮 Emoji Guess Challenge
                </h1>
                <p className="text-gray-300 text-xl mb-4">
                  Guess 5 emojis and prove your skills!
                </p>
                <p className="text-gray-400 text-lg">
                  Select a difficulty level to begin
                </p>
              </div>

              {/* Difficulty Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Easy */}
                <button
                  onClick={() => startGameWithDifficulty('easy')}
                  className="group relative overflow-hidden rounded-xl bg-linear-to-br from-green-500/20 to-emerald-600/20 border border-green-500/50 p-8 hover:border-green-400 hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">🌱</div>
                    <h3 className="text-3xl font-bold text-green-400 mb-3">Easy</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ {DIFFICULTY_CONFIG.easy.hintsAllowed} Hints available</li>
                      <li>✓ {DIFFICULTY_CONFIG.easy.basePoints} Points per emoji</li>
                      <li>✓ -{DIFFICULTY_CONFIG.easy.attemptPenalty} pts per attempt</li>
                    </ul>
                  </div>
                </button>

                {/* Medium */}
                <button
                  onClick={() => startGameWithDifficulty('medium')}
                  className="group relative overflow-hidden rounded-xl bg-linear-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/50 p-8 hover:border-yellow-400 hover:from-yellow-500/30 hover:to-orange-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">⚡</div>
                    <h3 className="text-3xl font-bold text-yellow-400 mb-3">Medium</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ {DIFFICULTY_CONFIG.medium.hintsAllowed} Hints available</li>
                      <li>✓ {DIFFICULTY_CONFIG.medium.basePoints} Points per emoji</li>
                      <li>✓ -{DIFFICULTY_CONFIG.medium.attemptPenalty} pts per attempt</li>
                    </ul>
                  </div>
                </button>

                {/* Hard */}
                <button
                  onClick={() => startGameWithDifficulty('hard')}
                  className="group relative overflow-hidden rounded-xl bg-linear-to-br from-red-500/20 to-pink-600/20 border border-red-500/50 p-8 hover:border-red-400 hover:from-red-500/30 hover:to-pink-600/30 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4">🔥</div>
                    <h3 className="text-3xl font-bold text-red-400 mb-3">Hard</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ {DIFFICULTY_CONFIG.hard.hintsAllowed} Hint available</li>
                      <li>✓ {DIFFICULTY_CONFIG.hard.basePoints} Points per emoji</li>
                      <li>✓ -{DIFFICULTY_CONFIG.hard.attemptPenalty} pts per attempt</li>
                    </ul>
                  </div>
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-white font-semibold mb-4 text-center text-lg">How to Play</h3>
                <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                  <div className="space-y-2">
                    <p>😊 Guess the emoji combination</p>
                    <p>✅ Complete each emoji to move to the next</p>
                  </div>
                  <div className="space-y-2">
                    <p>💡 Use hints if you get stuck</p>
                    <p>🎯 Complete all 5 emojis to win!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  if (!puzzle) {
    return (
        <EmojiGuessError message={message} onRetry={() => loadPuzzle(difficulty || 'easy')} />
    );
  }

  // Main game UI
  return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-pulse text-3xl opacity-20"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              >
                {['😊', '🎮', '🎯', '🧩', '✨'][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        </div>

        <Confetti show={showConfetti} />

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header with Progress */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-linear-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                🎮 Emoji Guess
              </h1>
              <span className="text-3xl font-bold text-gray-300 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                {round}/5
              </span>
            </div>
            <p className="text-gray-400 text-lg mb-4">
              Difficulty: <span className="text-white font-semibold capitalize flex items-center justify-center gap-2">
                {difficulty && DIFFICULTY_CONFIG[difficulty].emoji} {difficulty}
              </span>
            </p>
            
            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mb-4">
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                <motion.div 
                  className="h-full bg-linear-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((round - 1) / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Emoji Category */}
          <div className="text-center mb-8">
            <p className="text-gray-400 text-lg">
              Category: <span className="text-white font-semibold">{puzzle.category}</span>
            </p>
          </div>

          {/* Emoji Display - Main Game Area */}
          <div className="mb-8 text-center">
            <div className="inline-block bg-linear-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 shadow-xl">
              <EmojiDisplay
                emojis={puzzle.emojis}
                category={puzzle.category}
                difficulty={puzzle.difficulty}
              />
            </div>
          </div>

          {/* Game Area - Grid Layout */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Hint System */}
            <div>
              {difficulty && (
                <HintSystem
                  showHint={showHint}
                  answer={puzzle.answer}
                  hintsUsed={hintsUsed}
                  onUseHint={useHint}
                  maxHints={DIFFICULTY_CONFIG[difficulty].hintsAllowed}
                />
              )}
            </div>

            {/* Guess Input */}
            <div>
              <GuessInput
                guess={guess}
                setGuess={setGuess}
                onSubmit={checkGuess}
                onKeyPress={handleKeyPress}
                disabled={attempts >= 3 && message.includes('Wrong')}
              />
            </div>
          </div>

          {/* Game Stats */}
          <div className="mb-8 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <GameStats
              score={score}
              attempts={attempts}
              hintsUsed={hintsUsed}
              gameStarted={gameStarted}
            />
          </div>

          {/* Message Display */}
          <EmojiGuessMessage message={message} messageType={messageType} />

          {/* Game Controls */}
          <div className="mb-8">
            <EmojiGuessControls
              onNewPuzzle={() => loadPuzzle(difficulty || 'easy')}
              onTryAgain={handleTryAgain}
              isLoading={isLoading}
              attempts={attempts}
              message={message}
            />
          </div>

          {/* Instructions */}
          {attempts < 3 && !message.includes('Correct') && (
            <div className="max-w-4xl mx-auto bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4 text-center">How to Play</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-300">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-purple-400 text-xl">😊</span>
                    <span>Study the emoji combination</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-pink-400 text-xl">💭</span>
                    <span>Think of what it means</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-400 text-xl">✍️</span>
                    <span>Type your guess</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400 text-xl">✅</span>
                    <span>Submit to check</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-yellow-400 text-xl">💡</span>
                    <span>Use hints wisely</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-red-400 text-xl">❌</span>
                    <span>3 attempts per emoji</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Achievement Badges */}
          <div className="mt-8">
            <EmojiGuessAchievements achievements={achievements} />
          </div>

          {/* Leaderboard */}
          <div className="mt-12">
            <Leaderboard gameType="emoji-guess" />
          </div>
        </div>
      </div>
  );
}