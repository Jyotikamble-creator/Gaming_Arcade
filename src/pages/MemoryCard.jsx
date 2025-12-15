// Memory card game page component.
import React, { useEffect, useState } from 'react';
// API functions
import { startMemory, submitScore } from '../api/Api';
// Components
import Board from '../components/memorycard/Board';
// logger 
import { logger, LogTags } from '../lib/logger';

// MemoryCard page component
export default function MemoryCard() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    start();
  }, []);

  // Start the game
  async function start() {
    try {
      setIsLoading(true);
      logger.info('Starting memory card game', {}, LogTags.MEMORY_CARD);
      const res = await startMemory();
      setCards(res.data.cards || []);
      setFlipped([]);
      setMatched([]);
      setMoves(0);
      logger.info('Memory card game started successfully', { cardCount: res.data.cards?.length }, LogTags.MEMORY_CARD);
    } catch (error) {
      logger.error('Failed to start memory game', error, {}, LogTags.MEMORY_CARD);
      // Fallback to static cards if API fails
      setCards([
        { id: 0, value: '🍎' },
        { id: 1, value: '🍌' },
        { id: 2, value: '🍇' },
        { id: 3, value: '🍊' },
        { id: 4, value: '🍎' },
        { id: 5, value: '🍌' },
        { id: 6, value: '🍇' },
        { id: 7, value: '🍊' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle card flip
  function flipCard(id) {
    if (flipped.includes(id) || matched.includes(id)) return;
    const next = [...flipped, id];
    setFlipped(next);
    if (next.length === 2) {
      setMoves(m => m + 1);
      const a = cards.find(c => c.id === next[0]).value;
      const b = cards.find(c => c.id === next[1]).value;
      if (a === b) {
        setMatched([...matched, ...next]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  }

  // Start a new game
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading memory cards...</p>
        </div>
      </div>
    );
  }

  // Render the game
  return (
    <div className="min-h-screen text-light-text">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🧠 Memory Cards</h1>
          <p className="text-gray-400">Find all matching pairs to win!</p>
          <p className="text-sm text-gray-500 mt-2">Moves: {moves} | Matched: {matched.length}/{cards.length}</p>
        </div>

        <Board
          cards={cards}
          flipped={flipped}
          matched={matched}
          onCardClick={flipCard}
          disabled={false}
        />

        <div className="flex justify-center mt-8">
          <button
            onClick={start}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
