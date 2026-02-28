'use client';

import React, { useEffect, useState } from 'react';
import Instructions from '@/components/shared/Instructions';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import Board from './Board';
import GameStats from './GameStats';
import AnimatedBackground from '@/components/AnimatedBackground';

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

// API functions for memory card game
async function startMemoryGame(): Promise<{ data: { cards: Card[] } }> {
  try {
    const response = await fetch('/api/games/memory', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch memory cards');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching memory cards:', error);
    // Return fallback cards
    return {
      data: {
        cards: [
          { id: 0, value: '🍎', category: 'fruits' },
          { id: 1, value: '🍌', category: 'fruits' },
          { id: 2, value: '🍇', category: 'fruits' },
          { id: 3, value: '🍊', category: 'fruits' },
          { id: 4, value: '🍓', category: 'fruits' },
          { id: 5, value: '🍑', category: 'fruits' },
          { id: 6, value: '🥝', category: 'fruits' },
          { id: 7, value: '🍍', category: 'fruits' },
          { id: 8, value: '🍎', category: 'fruits' },
          { id: 9, value: '🍌', category: 'fruits' },
          { id: 10, value: '🍇', category: 'fruits' },
          { id: 11, value: '🍊', category: 'fruits' },
          { id: 12, value: '🍓', category: 'fruits' },
          { id: 13, value: '🍑', category: 'fruits' },
          { id: 14, value: '🥝', category: 'fruits' },
          { id: 15, value: '🍍', category: 'fruits' },
        ]
      }
    };
  }
}

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [gameTime, setGameTime] = useState<number>(0);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  useEffect(() => {
    startGame();
  }, []);

  // Timer effect
  useEffect(() => {
    if (!gameWon && cards.length > 0) {
      const interval = setInterval(() => {
        setGameTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameWon, cards.length, startTime]);

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
          accuracy
        }
      }).catch(error => {
        console.error('[MEMORY_CARD] Failed to submit score', error);
      });
    }
  }, [matched, cards, gameWon, moves, startTime]);

  // Calculate score based on moves and time
  const calculateScore = (moves: number, time: number, pairs: number): number => {
    const perfectMoves = pairs;
    const maxTime = pairs * 10; // 10 seconds per pair
    
    const moveScore = Math.max(0, 1000 - (moves - perfectMoves) * 50);
    const timeScore = Math.max(0, 500 - (time - maxTime) * 5);
    
    return Math.max(100, moveScore + timeScore);
  };

  // Start the game
  async function startGame(): Promise<void> {
    try {
      setIsLoading(true);
      console.log('[MEMORY_CARD] Starting memory card game');
      const res = await startMemoryGame();
      setCards(res.data.cards || []);
      setFlipped([]);
      setMatched([]);
      setMoves(0);
      setGameWon(false);
      setStartTime(Date.now());
      setGameTime(0);
      setIsDisabled(false);
      console.log('[MEMORY_CARD] Memory card game started successfully', { cardCount: res.data.cards?.length });
    } catch (error) {
      console.error('[MEMORY_CARD] Failed to start memory game', error);
    } finally {
      setIsLoading(false);
    }
  }

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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading memory cards...</p>
        </div>
      </div>
    );
  }

  // Render error state if no cards
  if (!cards.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <AnimatedBackground />
        <div className="bg-slate-800/90 backdrop-blur-lg rounded-xl p-8 border border-slate-700 max-w-md w-full text-center relative z-10 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-4">Failed to Load Cards</h2>
          <p className="text-slate-400 mb-6">Unable to load memory cards. Please try again.</p>
          <button
            onClick={startGame}
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
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🧠 Memory Cards</h1>
          <p className="text-slate-400 text-lg">Find all matching pairs to win!</p>
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="mt-4 bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              ← Back to Dashboard
            </button>
          )}
        </div>

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
        />

        {/* New Game Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={startGame}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
          >
            New Game
          </button>
        </div>

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="memory-card" />
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
                <div>
                  <span className="font-semibold">Moves:</span> {moves}
                </div>
                <div>
                  <span className="font-semibold">Time:</span> {gameTime}s
                </div>
                <div>
                  <span className="font-semibold">Pairs:</span> {cards.length / 2}
                </div>
                <div>
                  <span className="font-semibold">Score:</span> {calculateScore(moves, gameTime, cards.length / 2)}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={startGame}
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