// Reaction Time Tester Game Component
import React, { useState, useEffect, useRef } from 'react';
// API functions
import { submitScore } from '../api/Api';
// Logger
import { logger, LogTags } from '../lib/logger';
// Components
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/leaderboard/Leaderboard';
import ReactionStats from '../components/reactiontime/ReactionStats';
import ReactionDisplay from '../components/reactiontime/ReactionDisplay';
import ReactionCompletedModal from '../components/reactiontime/ReactionCompletedModal';
import AnimatedBackground from '../components/AnimatedBackground';

// Constants
const TOTAL_ROUNDS = 5;
const MIN_WAIT_TIME = 2000; // 2 seconds
const MAX_WAIT_TIME = 5000; // 5 seconds

// Reaction Time Page Component
export default function ReactionTime() {
  const [gameState, setGameState] = useState('idle'); // idle, waiting, ready, clicked, completed
  const [currentRound, setCurrentRound] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [tooEarly, setTooEarly] = useState(false);
  const [averageTime, setAverageTime] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);

  const timeoutRef = useRef(null);

  // Start the game
  const startGame = () => {
    setCurrentRound(0);
    setReactionTimes([]);
    setAverageTime(0);
    setBestTime(null);
    setGameCompleted(false);
    setTooEarly(false);
    setGameState('ready-to-start');

    logger.info('Reaction Time game started', {}, LogTags.WORD_GUESS);
  };

  // Start a new round
  const startRound = () => {
    setTooEarly(false);
    setGameState('waiting');

    // Random delay between MIN_WAIT_TIME and MAX_WAIT_TIME
    const waitTime = Math.random() * (MAX_WAIT_TIME - MIN_WAIT_TIME) + MIN_WAIT_TIME;

    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      setStartTime(Date.now());
    }, waitTime);
  };

  // Handle click
  const handleClick = () => {
    if (gameState === 'waiting') {
      // Clicked too early
      setTooEarly(true);
      setGameState('idle');
      clearTimeout(timeoutRef.current);

      setTimeout(() => {
        setTooEarly(false);
      }, 2000);

      return;
    }

    if (gameState === 'ready') {
      // Calculate reaction time
      const reactionTime = Date.now() - startTime;
      const newReactionTimes = [...reactionTimes, reactionTime];
      setReactionTimes(newReactionTimes);
      setGameState('clicked');

      // Update best time
      if (bestTime === null || reactionTime < bestTime) {
        setBestTime(reactionTime);
      }

      logger.info('Reaction recorded', { reactionTime, round: currentRound + 1 }, LogTags.WORD_GUESS);

      // Check if game is complete
      if (currentRound + 1 >= TOTAL_ROUNDS) {
        const avg = Math.round(newReactionTimes.reduce((a, b) => a + b, 0) / newReactionTimes.length);
        setAverageTime(avg);

        setTimeout(() => {
          setGameCompleted(true);

          // Calculate score (lower time = higher score)
          // Perfect score of 500 for avg 200ms, decreasing as avg increases
          const score = Math.max(0, Math.round(500 - (avg - 200) * 0.5));

          submitScore({
            game: 'reaction-time',
            score,
            meta: {
              averageTime: avg,
              bestTime: Math.min(...newReactionTimes),
              allTimes: newReactionTimes
            }
          }).catch(error => {
            logger.error('Failed to submit Reaction Time score', error, {}, LogTags.SAVE_SCORE);
          });
        }, 1500);
      } else {
        // Next round
        setTimeout(() => {
          setCurrentRound(prev => prev + 1);
          setGameState('idle');
        }, 1500);
      }
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Get performance rating
  const getPerformanceRating = (avg) => {
    if (avg < 250) return { text: '🏆 Lightning Fast!', color: 'text-yellow-300' };
    if (avg < 300) return { text: '⚡ Excellent!', color: 'text-green-300' };
    if (avg < 350) return { text: '👍 Good!', color: 'text-blue-300' };
    if (avg < 400) return { text: '👌 Average', color: 'text-purple-300' };
    return { text: '💪 Keep Practicing!', color: 'text-orange-300' };
  };

  // Render
  return (
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />
      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">⚡ Reaction Time Tester</h1>
          <p className="text-gray-300">Test your reflexes and reaction speed!</p>
        </div>

        {/* Instructions */}
        {gameState === 'idle' && currentRound === 0 && !gameCompleted && (
          <div className="max-w-md mx-auto mb-8">
            <Instructions gameType="reaction-time" />
          </div>
        )}

        {/* Start Button */}
        {gameState === 'idle' && currentRound === 0 && !gameCompleted && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-indigo-500/30 shadow-2xl text-center">
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xl py-6 px-12 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
              >
                Start Test
              </button>
              <p className="mt-4 text-gray-400">
                You'll complete {TOTAL_ROUNDS} rounds
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        {gameState !== 'idle' && !gameCompleted && (
          <ReactionStats
            currentRound={currentRound}
            totalRounds={TOTAL_ROUNDS}
            reactionTimes={reactionTimes}
            bestTime={bestTime}
          />
        )}

        {/* Reaction Display Area */}
        {gameState !== 'idle' && !gameCompleted && (
          <ReactionDisplay
            gameState={gameState}
            tooEarly={tooEarly}
            currentRound={currentRound}
            totalRounds={TOTAL_ROUNDS}
            reactionTimes={reactionTimes}
            onStartRound={startRound}
            onClick={handleClick}
          />
        )}

        {/* Completed Modal */}
        {gameCompleted && (
          <ReactionCompletedModal
            averageTime={averageTime}
            bestTime={bestTime}
            reactionTimes={reactionTimes}
            performanceRating={getPerformanceRating(averageTime)}
            onPlayAgain={startGame}
            onBackToMenu={() => window.location.href = '/dashboard'}
          />
        )}

        {/* Leaderboard */}
        {gameState === 'idle' && currentRound === 0 && !gameCompleted && (
          <div className="mt-12">
            <Leaderboard game="reaction-time" />
          </div>
        )}
      </div>
    </div>
  );
}
