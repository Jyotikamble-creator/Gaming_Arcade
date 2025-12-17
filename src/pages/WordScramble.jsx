// Page component for the Word Scramble game.
import React, { useEffect, useState } from 'react';
// API and logging imports
import { fetchScramble, submitScore } from '../api/Api';
// Logger
import { logger, LogTags } from '../lib/logger';
// Component imports
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/leaderboard/Leaderboard';
import WordScrambleStats from '../components/wordscramble/WordScrambleStats';
import WordScrambleDisplay from '../components/wordscramble/WordScrambleDisplay';
import WordScrambleInput from '../components/wordscramble/WordScrambleInput';
import WordScrambleAnswer from '../components/wordscramble/WordScrambleAnswer';

// Main Word Scramble page component
export default function WordScramble() {
  const [data, setData] = useState({ word: 'REACT', scrambled: 'TCAER' });
  const [guess, setGuess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    load();
  }, []);

  // Load a new scrambled word from the API
  async function load() {
    try {
      setIsLoading(true);
      logger.info('Loading word scramble', {}, LogTags.WORD_SCRAMBLE);
      const r = await fetchScramble();
      setData(r.data);
      setGuess('');
      setAttempts(0);
      setCorrect(false);
      setShowAnswer(false);
      logger.info('Word scramble loaded', { word: r.data?.word }, LogTags.WORD_SCRAMBLE);
    } catch (error) {
      logger.error('Failed to load scramble', error, {}, LogTags.WORD_SCRAMBLE);
      // Keep test data if API fails
    } finally {
      setIsLoading(false);
    }
  }

  // Check if the guess is correct
  async function check() {
    const isCorrect = guess.toUpperCase() === data.word.toUpperCase();
    setAttempts(prev => prev + 1);

    if (isCorrect) {
      setCorrect(true);
      const score = Math.max(100 - (attempts * 10), 10);
      await submitScore({ game: 'word-scramble', score, meta: { attempts: attempts + 1, word: data.word } });
      logger.info('Word scramble correct', { score, attempts: attempts + 1, word: data.word }, LogTags.SAVE_SCORE);
    } else {
      logger.debug('Word scramble incorrect attempt', { attempt: attempts + 1, guess, word: data.word }, LogTags.WORD_SCRAMBLE);
    }
  }

  // Reveal the correct answer
  function revealAnswer() {
    setShowAnswer(true);
    logger.debug('Word scramble answer revealed', { word: data.word }, LogTags.WORD_SCRAMBLE);
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text">Loading scrambled word...</p>
        </div>
      </div>
    );
  }

  // Render main game UI
  return (
    <div className="min-h-screen text-light-text">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🔀 Word Scramble</h1>
          <p className="text-subtle-text">Unscramble the letters to form a word!</p>
        </div>

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="word-scramble" />
        </div>

        {/* Stats */}
        <WordScrambleStats
          attempts={attempts}
          correct={correct}
          showAnswer={showAnswer}
        />

        {/* Scrambled Word */}
        <WordScrambleDisplay scrambled={data.scrambled} />

        {/* Input and Controls */}
        <WordScrambleInput
          guess={guess}
          onChange={(e) => setGuess(e.target.value)}
          onCheck={check}
          onReveal={revealAnswer}
          onNewWord={load}
          correct={correct}
          showAnswer={showAnswer}
        />

        {/* Answer Reveal */}
        <WordScrambleAnswer word={data.word} show={correct || showAnswer} />

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="word-scramble" />
        </div>
      </div>
    </div>
  );
}
