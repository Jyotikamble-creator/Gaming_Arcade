import React, {useEffect, useState, useCallback} from 'react';
import { startSimon, submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/Leaderboard';

export default function SimonSays(){
  const [colors, setColors] = useState([]);
  const [seq, setSeq] = useState([]);
  const [playerSeq, setPlayerSeq] = useState([]);
  const [round, setRound] = useState(0);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeColor, setActiveColor] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(()=> init(), []);

  async function init(){
    try {
      setIsLoading(true);
      logger.info('Starting Simon Says game', {}, LogTags.SIMON_SAYS);
      const r = await startSimon();
      setColors(r.data.colors || ['red', 'blue', 'green', 'yellow']);
      setSeq([]);
      setPlayerSeq([]);
      setRound(0);
      setGameOver(false);
      setGameWon(false);
      setActiveColor(null);
      nextRound([]);
      logger.info('Simon Says initialized', { colors: r.data.colors?.length || 4 }, LogTags.SIMON_SAYS);
    } catch (error) {
      logger.error('Failed to start Simon Says', error, {}, LogTags.SIMON_SAYS);
      setColors(['red', 'blue', 'green', 'yellow']);
      nextRound([]);
    } finally {
      setIsLoading(false);
    }
  }

  const nextRound = useCallback((prev) => {
    const next = [...prev, colors[Math.floor(Math.random()*colors.length)]];
    setSeq(next);
    setPlayerSeq([]);
    setRound(next.length);
    setIsShowingSequence(true);

    // Show sequence with animation
    let i = 0;
    const showNext = () => {
      if(i < next.length){
        setActiveColor(next[i]);
        setTimeout(() => {
          setActiveColor(null);
          i++;
          setTimeout(showNext, 300);
        }, 600);
      } else {
        setIsShowingSequence(false);
      }
    };
    setTimeout(showNext, 1000);
  }, [colors]);

  function press(c){
    if(isShowingSequence || gameOver || gameWon) return;

    const pos = playerSeq.length;
    const newSeq = [...playerSeq, c];
    setPlayerSeq(newSeq);

    // Visual feedback
    setActiveColor(c);
    setTimeout(() => setActiveColor(null), 200);

    if(seq[pos] !== c){
      // Wrong sequence
      setGameOver(true);
      const score = round - 1;
      submitScore({game:'simon-says', score, meta:{roundsCompleted: round - 1}});
      logger.info('Simon Says game over - wrong sequence', { score, round }, LogTags.SAVE_SCORE);
    } else if(newSeq.length === seq.length){
      // Round completed
      if(newSeq.length === 10){
        // Game won
        setGameWon(true);
        submitScore({game:'simon-says', score: 100, meta:{roundsCompleted: 10}});
        logger.info('Simon Says game won', { score: 100 }, LogTags.SAVE_SCORE);
      } else {
        // Next round
        setTimeout(() => nextRound(seq), 1000);
      }
    }
  }

  const getColorClasses = (color) => {
    const baseClasses = 'w-24 h-24 rounded-full font-bold text-white text-xl transition-all duration-200 transform hover:scale-105 shadow-lg';
    const colorMap = {
      red: 'bg-red-500 hover:bg-red-600',
      blue: 'bg-blue-500 hover:bg-blue-600',
      green: 'bg-green-500 hover:bg-green-600',
      yellow: 'bg-yellow-500 hover:bg-yellow-600'
    };

    let classes = `${baseClasses} ${colorMap[color] || 'bg-gray-500'}`;

    if(activeColor === color){
      classes += ' ring-4 ring-white scale-110 brightness-125';
    }

    if(isShowingSequence || gameOver || gameWon){
      classes += ' cursor-not-allowed opacity-75';
    }

    return classes;
  };

  if(isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text">Setting up Simon Says...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-light-text">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎯 Simon Says</h1>
          <p className="text-subtle-text">Repeat the color sequence to advance!</p>
        </div>

        {/* Game Stats */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <span className="text-sm font-medium text-gray-300">ROUND</span>
            <div className="text-2xl font-bold text-white">{round}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <span className="text-sm font-medium text-gray-300">SEQUENCE LENGTH</span>
            <div className="text-2xl font-bold text-white">{seq.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <span className="text-sm font-medium text-gray-300">STATUS</span>
            <div className="text-lg font-bold text-white">
              {gameWon ? 'Won!' : gameOver ? 'Game Over' : isShowingSequence ? 'Watch...' : 'Your Turn'}
            </div>
          </div>
        </div>

        {/* Color Buttons */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-6 shadow-2xl">
          <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => press(c)}
                disabled={isShowingSequence || gameOver || gameWon}
                className={getColorClasses(c)}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="simon-says" />
        </div>

        {/* Game Over Modal */}
        {(gameOver || gameWon) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
              <div className="text-6xl mb-4">{gameWon ? '🎉' : '😞'}</div>
              <h2 className="text-3xl font-bold mb-4">
                {gameWon ? 'Congratulations!' : 'Game Over'}
              </h2>
              <p className="text-gray-600 mb-2">
                {gameWon ? 'You completed all 10 rounds!' : `You reached round ${round}`}
              </p>
              <p className="text-4xl font-bold text-blue-600 mb-6">
                {gameWon ? '100 points' : `${round - 1} points`}
              </p>
              <button
                onClick={init}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="simon-says" />
        </div>
      </div>
    </div>
  );
}
