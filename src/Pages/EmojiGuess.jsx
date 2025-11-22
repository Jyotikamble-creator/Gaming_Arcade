import React, { useEffect, useState } from 'react';
import { fetchEmoji, submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';
import EmojiDisplay from '../components/emojiguess/EmojiDisplay';
import GuessInput from '../components/emojiguess/GuessInput';
import GameStats from '../components/emojiguess/GameStats';
import HintSystem from '../components/emojiguess/HintSystem';
import Confetti from '../components/emojiguess/Confetti';
import AnimatedBackground from '../components/AnimatedBackground';
import ProgressRing from '../components/emojiguess/ProgressRing';
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/Leaderboard';
import EmojiGuessHeader from '../components/emojiguess/EmojiGuessHeader';
import EmojiGuessAchievements from '../components/emojiguess/EmojiGuessAchievements';
import EmojiGuessMessage from '../components/emojiguess/EmojiGuessMessage';
import EmojiGuessControls from '../components/emojiguess/EmojiGuessControls';
import EmojiGuessLoading from '../components/emojiguess/EmojiGuessLoading';
import EmojiGuessError from '../components/emojiguess/EmojiGuessError';

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
  const [showConfetti, setShowConfetti] = useState(false);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState({
    firstWin: false,
    streak5: false,
    streak10: false,
    perfectGame: false,
  });

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

  function handleTryAgain() {
    setAttempts(0);
    setMessage('');
    setGuess('');
    setStreak(0);
  }

  if (isLoading) {
    return <EmojiGuessLoading />;
  }

  if (!puzzle) {
    return <EmojiGuessError message={message} onRetry={loadPuzzle} />;
  }

  return (
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />
      <Confetti show={showConfetti} />

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
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
          <Leaderboard game="emoji-guess" />
        </div>
      </div>
    </div>
  );
}
