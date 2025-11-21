import React, {useEffect, useState} from 'react';
import { startMemory, submitScore } from '../api/Api';
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/Leaderboard';
import { logger, LogTags } from '../lib/logger';

export default function MemoryCard(){
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameWon, setGameWon] = useState(false);

  useEffect(()=> start(), []);

  async function start(){
    try {
      setIsLoading(true);
      logger.info('Starting memory card game', {}, LogTags.MEMORY_CARD);
      const res = await startMemory();
      setCards(res.data.cards || []);
      setFlipped([]);
      setMatched([]);
      setMoves(0);
      setStartTime(Date.now());
      setGameWon(false);
      logger.info('Memory card game started successfully', { cardCount: res.data.cards?.length }, LogTags.MEMORY_CARD);
    } catch (error) {
      logger.error('Failed to start memory game', error, {}, LogTags.MEMORY_CARD);
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  }

  function flipCard(id){
    if(flipped.includes(id) || matched.includes(id) || gameWon) return;
    const next = [...flipped, id];
    setFlipped(next);
    if(next.length===2){
      setMoves(m=>m+1);
      const a = cards.find(c=>c.id===next[0]).value;
      const b = cards.find(c=>c.id===next[1]).value;
      if(a===b){
        const newMatched = [...matched, ...next];
        setMatched(newMatched);
        setFlipped([]);
        if(newMatched.length===cards.length){
          setTimeout(() => onWin(), 500);
        }
      }
      else setTimeout(()=> setFlipped([]), 800);
    }
  }

  async function onWin(){
    const time = Math.floor((Date.now()-startTime)/1000);
    const score = Math.max(0, 100 - moves*2 - time);
    setGameWon(true);
    try {
      await submitScore({ game:'memory-card', score, meta:{moves, time} });
      logger.info('Memory card game won', { score, moves, time }, LogTags.SAVE_SCORE);
    } catch (error) {
      logger.error('Failed to submit memory card score', error, { score }, LogTags.SAVE_SCORE);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text">Loading memory cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-light-text">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🧠 Memory Cards</h1>
          <p className="text-subtle-text">Find all matching pairs to win!</p>
        </div>

        {/* Game Stats */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <span className="text-sm font-medium text-gray-300">MOVES</span>
            <div className="text-2xl font-bold text-white">{moves}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <span className="text-sm font-medium text-gray-300">MATCHED</span>
            <div className="text-2xl font-bold text-white">{matched.length}/{cards.length}</div>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-4 gap-4">
            {cards.map(card => (
              <div
                key={card.id}
                onClick={()=>flipCard(card.id)}
                className={`
                  w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold
                  cursor-pointer transition-all duration-300 transform hover:scale-105
                  shadow-lg border-2
                  ${flipped.includes(card.id) || matched.includes(card.id)
                    ? 'bg-gradient-to-br from-green-400 to-blue-500 text-white border-green-300'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-300 hover:border-pink-300'
                  }
                  ${matched.includes(card.id) ? 'animate-pulse' : ''}
                `}
              >
                {flipped.includes(card.id) || matched.includes(card.id) ? card.value : '❓'}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="memory-card" />
        </div>

        {/* Game Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={start}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            New Game
          </button>
        </div>

        {/* Win Message */}
        {gameWon && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">Congratulations!</h2>
              <p className="text-gray-600 mb-4">You found all the pairs!</p>
              <p className="text-lg font-semibold text-blue-600">Moves: {moves}</p>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="memory-card" />
        </div>
      </div>
    </div>
  );
}
