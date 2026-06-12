'use client';

import React, { useEffect, useState } from 'react';
import Instructions from '@/components/shared/Instructions';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import Board from './Board';
import GameStats from './GameStats';
import AnimatedBackground from '@/components/AnimatedBackground';
import { 
  generateCardsForDifficulty, 
  getGridColsForDifficulty,
  MemoryCardDifficulty,
  MEMORY_CARD_SETS 
} from '@/lib/games/memory-card';

// TypeScript interfaces
interface User {
  id: string;
  name: string;
  email?: string;
  displayName?: string;
}

interface MemoryCardPageProps {
  user: User | null;
  onBackToDashboard?: () => void;
  className?: string;
}

interface Card {
  id: number;
  value: string;
  category?: string;
}

interface GameStats {
  moves: number;
  pairs: number;
  timeElapsed: number;
  accuracy: number;
}

// API function for submitting score
async function submitScore(scoreData: { game: string; score: number; meta: Record<string, any> }): Promise<void> {
  try {
    const response = await fetch('/api/games/memory/score', {
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

const MemoryCardPage: React.FC<MemoryCardPageProps> = ({ 
  user, 
  onBackToDashboard,
  className 
}) => {
  // Game state
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [gameTime, setGameTime] = useState<number>(0);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<MemoryCardDifficulty>('medium');
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  // Timer effect
  useEffect(() => {
    if (!gameWon && cards.length > 0 && gameStarted) {
      const interval = setInterval(() => {
        setGameTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameWon, cards.length, startTime, gameStarted]);

  // Check for game completion
  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0 && !gameWon) {
      setGameWon(true);
      const finalTime = Math.floor((Date.now() - startTime) / 1000);
      const accuracy = cards.length > 0 ? Math.round(((cards.length / 2) / moves) * 100) : 0;
      
      submitScore({
        game: 'memory-card',
        score: calculateScore(moves, finalTime, cards.length / 2),
        meta: { 
          moves, 
          pairs: cards.length / 2, 
          timeElapsed: finalTime,
          accuracy,
          difficulty
        }
      }).catch(error => {
        console.error('[MEMORY_CARD] Failed to submit score', error);
      });
    }
  }, [matched, cards, gameWon, moves, startTime, difficulty]);

  // Calculate score based on moves and time
  const calculateScore = (moves: number, time: number, pairs: number): number => {
    const perfectMoves = pairs;
    const maxTime = pairs * 10; // 10 seconds per pair
    
    const moveScore = Math.max(0, 1000 - (moves - perfectMoves) * 50);
    const timeScore = Math.max(0, 500 - (time - maxTime) * 5);
    
    return Math.max(100, moveScore + timeScore);
  };

  // Start the game
  async function startGame(selectedDifficulty?: MemoryCardDifficulty): Promise<void> {
    try {
      setIsLoading(true);
      console.log('[MEMORY_CARD_PAGE] startGame called with:', selectedDifficulty);
      
      let diff = selectedDifficulty || difficulty;
      console.log('[MEMORY_CARD_PAGE] diff after selection:', diff, 'current difficulty state:', difficulty);
      
      // Validate difficulty
      if (!diff || !(['easy', 'medium', 'hard'] as const).includes(diff)) {
        console.warn('[MEMORY_CARD_PAGE] Invalid difficulty, using medium');
        diff = 'medium';
      }
      
      console.log('[MEMORY_CARD_PAGE] Starting memory card game with difficulty:', diff);
      
      // Generate cards based on difficulty
      console.log('[MEMORY_CARD_PAGE] Calling generateCardsForDifficulty');
      const generatedCards = generateCardsForDifficulty(diff);
      console.log('[MEMORY_CARD_PAGE] Generated cards:', generatedCards, 'length:', generatedCards?.length);
      
      if (!generatedCards || generatedCards.length === 0) {
        console.error('[MEMORY_CARD_PAGE] generateCardsForDifficulty returned empty or undefined');
        throw new Error(`Failed to generate cards for difficulty: ${diff}`);
      }
      
      console.log('[MEMORY_CARD_PAGE] Setting game state');
      setDifficulty(diff);
      setCards(generatedCards);
      setFlipped([]);
      setMatched([]);
      setMoves(0);
      setGameWon(false);
      setStartTime(Date.now());
      setGameTime(0);
      setIsDisabled(false);
      setGameStarted(true);
      
      console.log('[MEMORY_CARD_PAGE] Memory card game started successfully', { 
        cardCount: generatedCards.length,
        difficulty: diff
      });
    } catch (error) {
      console.error('[MEMORY_CARD_PAGE] Failed to start memory game', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle difficulty select
  const handleDifficultySelect = (selectedDifficulty: MemoryCardDifficulty) => {
    startGame(selectedDifficulty);
  };

  // Handle card flip
  function flipCard(id: number): void {
    if (flipped.includes(id) || matched.includes(id) || isDisabled) return;
    
    const nextFlipped = [...flipped, id];
    setFlipped(nextFlipped);
    
    if (nextFlipped.length === 2) {
      setIsDisabled(true);
      setMoves(m => m + 1);
      
      const cardA = cards.find(c => c.id === nextFlipped[0]);
      const cardB = cards.find(c => c.id === nextFlipped[1]);
      
      if (cardA && cardB && cardA.value === cardB.value) {
        // Match found
        setMatched([...matched, ...nextFlipped]);
        setFlipped([]);
        setIsDisabled(false);
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setFlipped([]);
          setIsDisabled(false);
        }, 800);
      }
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading memory cards...</p>
        </div>
      </div>
    );
  }

  // Difficulty Selection Screen - show BEFORE checking cards
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Title */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                🧠 Memory Match
              </h1>
              <p className="text-gray-300 text-xl mb-4">
                Flip cards and find matching pairs!
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
                  <div className="text-5xl mb-4">⭐</div>
                  <h3 className="text-3xl font-bold text-green-400 mb-3">Easy</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Perfect for beginners
                  </p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>🃏 3 pairs (6 cards)</li>
                    <li>🍎 Fruits theme</li>
                    <li>⚡ Quick rounds</li>
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
                  <div className="text-5xl mb-4">🎯</div>
                  <h3 className="text-3xl font-bold text-yellow-400 mb-3">Medium</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    For average players
                  </p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>🃏 8 pairs (16 cards)</li>
                    <li>🐶 Animals theme</li>
                    <li>⚡ Good challenge</li>
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
                  <p className="text-gray-300 text-sm mb-4">
                    For experts only
                  </p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>🃏 12 pairs (24 cards)</li>
                    <li>🌍 Countries theme</li>
                    <li>⚡ Ultimate test</li>
                  </ul>
                </div>
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4 text-center text-lg">How to Play</h3>
              <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                <div className="space-y-2">
                  <p>🃏 Click cards to flip them</p>
                  <p>🎯 Remember the card positions</p>
                </div>
                <div className="space-y-2">
                  <p>✅ Match all pairs to win</p>
                  <p>⏱️ Try to beat the clock</p>
                </div>
              </div>
            </div>

            {/* Back to Dashboard Button */}
            {onBackToDashboard && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={onBackToDashboard}
                  className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white font-medium rounded-lg transition-all duration-200 border border-gray-600"
                >
                  ← Back to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render the game - but check if cards loaded successfully
  if (gameStarted && (!cards || cards.length === 0)) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <AnimatedBackground />
        <div className="bg-slate-800/90 backdrop-blur-lg rounded-xl p-8 border border-slate-700 max-w-md w-full text-center relative z-10 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-4">Failed to Load Cards</h2>
          <p className="text-slate-400 mb-6">Unable to load memory cards. Please try again.</p>
          <button
            onClick={() => startGame(difficulty)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="w-full mt-3 bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render the game
  return (
    <div className={`min-h-screen text-white relative overflow-hidden ${className || ''}`}>
      <div className="absolute inset-0 bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Game Stats */}
        <GameStats 
          moves={moves} 
          matched={matched.length} 
          total={cards.length} 
          time={gameTime}
          isGameWon={gameWon}
        />

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="memory-card" />
        </div>

        {/* Game Board */}
        <Board
          cards={cards}
          flipped={flipped}
          matched={matched}
          onCardClick={flipCard}
          disabled={isDisabled}
          difficulty={difficulty}
        />

        {/* New Game Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => startGame(difficulty)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
          >
            New Game
          </button>
        </div>

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard gameType="memory-card" />
        </div>
      </div>

      {/* Game Won Modal */}
      {gameWon && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md w-full">
            <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Congratulations!</h2>
            <p className="text-slate-600 mb-2">You completed the game!</p>
            <div className="bg-slate-100 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-slate-800">
                  <span className="font-semibold">Moves:</span> <span className="text-slate-700 font-bold">{moves}</span>
                </div>
                <div className="text-slate-800">
                  <span className="font-semibold">Time:</span> <span className="text-slate-700 font-bold">{gameTime}s</span>
                </div>
                <div className="text-slate-800">
                  <span className="font-semibold">Pairs:</span> <span className="text-slate-700 font-bold">{cards.length / 2}</span>
                </div>
                <div className="text-slate-800">
                  <span className="font-semibold">Score:</span> <span className="text-slate-700 font-bold">{calculateScore(moves, gameTime, cards.length / 2)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => startGame(difficulty)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Play Again
              </button>
              {onBackToDashboard && (
                <button
                  onClick={onBackToDashboard}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryCardPage;