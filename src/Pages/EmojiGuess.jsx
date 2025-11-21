import React, { useEffect, useState } from 'react';
import { fetchEmoji, submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';
import EmojiDisplay from '../components/emojiguess/EmojiDisplay';
import GuessInput from '../components/emojiguess/GuessInput';
import GameStats from '../components/emojiguess/GameStats';
import HintSystem from '../components/emojiguess/HintSystem';
import Confetti from '../components/emojiguess/Confetti';
import StreakCounter from '../components/emojiguess/StreakCounter';
import AnimatedBackground from '../components/emojiguess/AnimatedBackground';
import AchievementBadge from '../components/emojiguess/AchievementBadge';
import ProgressRing from '../components/emojiguess/ProgressRing';
import Leaderboard from '../components/Leaderboard';

export default function EmojiGuess() {
  const [puzzle, setPuzzle] = useState(null);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [achievements, setAchievements] = useState({
    firstWin: false,
    streak5: false,
    streak10: false,
    perfectGame: false
  });
  const [totalGames, setTotalGames] = useState(0);

  useEffect(() => {
    loadPuzzle();
  }, []);

  async function loadPuzzle() {
    try {
      setIsLoading(true);
      logger.info('Loading emoji puzzle', {}, LogTags.EMOJI_GUESS);
      const response = await fetchEmoji();
      setPuzzle(response.data);
      setGuess('');
      setMessage('');
      setMessageType('');
      setAttempts(0);
      setHintsUsed(0);
      setShowHint(false);
      setGameStarted(true);
      logger.info('Emoji puzzle loaded successfully', { puzzleId: response.data.id }, LogTags.EMOJI_GUESS);
    } catch (error) {
      logger.error('Failed to load emoji puzzle', error, {}, LogTags.EMOJI_GUESS);
      setMessage('Failed to load puzzle. Please try again.');
      setMessageType('error');
      setPuzzle(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function checkGuess() {
    if (!guess.trim()) {
      setMessage('Please enter a guess!');
      setMessageType('error');
      return;
    }

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
      setTotalGames(prev => prev + 1);
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
        logger.info('Emoji guess score submitted', { score: points, attempts: newAttempts, streak: streak + 1 }, LogTags.SAVE_SCORE);
      } catch (error) {
        logger.error('Failed to submit emoji guess score', error, { score: points }, LogTags.SAVE_SCORE);
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

  function useHint() {
    if (hintsUsed >= 2) return; // Max 2 hints
    setHintsUsed(prev => prev + 1);
    setShowHint(true);
    setScore(prevScore => Math.max(0, prevScore - 5)); // Hint penalty
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      checkGuess();
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text text-xl font-semibold">Loading emoji puzzle...</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <AnimatedBackground />
        <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl p-8 border border-gray-700 max-w-md w-full text-center relative z-10 shadow-2xl">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-light-text mb-2">Failed to Load Puzzle</h2>
          <p className="text-subtle-text mb-6">{message}</p>
          <button
            onClick={loadPuzzle}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />
      <Confetti show={showConfetti} />

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2 animate-pulse">
            🎭 Emoji Guess
          </h1>
          <p className="text-subtle-text text-lg">Decode the emoji combination and guess what it represents!</p>
          {streak > 0 && (
            <div className="mt-4 flex justify-center">
              <StreakCounter streak={streak} />
            </div>
          )}
        </div>

        {/* Achievement Badges */}
        <div className="mb-6 flex flex-wrap justify-center gap-4">
          {achievements.firstWin && <AchievementBadge type="first-win" unlocked={achievements.firstWin} />}
          {achievements.streak5 && <AchievementBadge type="streak-5" unlocked={achievements.streak5} />}
          {achievements.streak10 && <AchievementBadge type="streak-10" unlocked={achievements.streak10} />}
          {achievements.perfectGame && <AchievementBadge type="perfect-game" unlocked={achievements.perfectGame} />}
        </div>

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

        {/* Message Display */}
        {message && (
          <div className={`mt-6 p-6 rounded-xl border text-center max-w-md mx-auto shadow-2xl transform transition-all duration-300 ${
            messageType === 'success'
              ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400 text-green-300 animate-bounce'
              : messageType === 'error'
              ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400 text-red-300'
              : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400 text-blue-300'
          }`}>
            <p className="font-bold text-lg">{message}</p>
          </div>
        )}

        {/* Game Controls */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={loadPuzzle}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            New Puzzle
          </button>

          {attempts >= 3 && message.includes('Wrong') && (
            <button
              onClick={() => {
                setAttempts(0);
                setMessage('');
                setGuess('');
                setStreak(0);
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          )}
        </div>

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="emoji-guess" />
        </div>
      </div>
    </div>
  );
}
