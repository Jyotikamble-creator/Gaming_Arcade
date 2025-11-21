import React, {useEffect, useState, useRef} from 'react';
import { startWhack, submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/Leaderboard';

export default function WhackAMole(){
  const [grid, setGrid] = useState([]);
  const [active, setActive] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef(null);
  const gameTimerRef = useRef(null);

  useEffect(()=> init(), []);

  async function init(){
    try {
      setIsLoading(true);
      logger.info('Starting whack-a-mole game', {}, LogTags.WHACK_MOLE);
      const r = await startWhack();
      const gridSize = r.data.gridSize || 9;
      setGrid(Array.from({length: gridSize}, (_,i)=>i));
      setScore(0);
      setTimeLeft(r.data.duration || 30);
      setGameStarted(false);
      setGameEnded(false);
      setActive(null);
      logger.info('Whack-a-mole initialized', { gridSize, duration: r.data.duration || 30 }, LogTags.WHACK_MOLE);
    } catch (error) {
      logger.error('Failed to start whack-a-mole', error, {}, LogTags.WHACK_MOLE);
      setGrid(Array.from({length: 9}, (_,i)=>i));
      setTimeLeft(30);
    } finally {
      setIsLoading(false);
    }
  }

  function startGame(){
    setGameStarted(true);
    logger.info('Whack-a-mole game started', {}, LogTags.WHACK_MOLE);

    // Mole popping timer
    timerRef.current = setInterval(()=> {
      setActive(Math.floor(Math.random()*grid.length));
    }, 800);

    // Game duration timer
    gameTimerRef.current = setInterval(()=> {
      setTimeLeft(prev => {
        if(prev <= 1){
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function whack(i){
    if(i === active && gameStarted && !gameEnded){
      setScore(s => s + 10);
      setActive(null);
      logger.debug('Mole whacked', { score: score + 10 }, LogTags.WHACK_MOLE);
    }
  }

  async function endGame(){
    setGameEnded(true);
    clearInterval(timerRef.current);
    clearInterval(gameTimerRef.current);
    setActive(null);

    await submitScore({game:'whack-a-mole', score, meta:{duration: 30 - timeLeft}});
    logger.info('Whack-a-mole game ended', { finalScore: score, timePlayed: 30 - timeLeft }, LogTags.SAVE_SCORE);
  }

  if(isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text">Setting up the mole holes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-light-text">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🔨 Whack-a-Mole</h1>
          <p className="text-subtle-text">Hit the moles as fast as you can!</p>
        </div>

        {/* Game Stats */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <span className="text-sm font-medium text-gray-300">SCORE</span>
            <div className="text-2xl font-bold text-white">{score}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <span className="text-sm font-medium text-gray-300">TIME LEFT</span>
            <div className="text-2xl font-bold text-white">{timeLeft}s</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <span className="text-sm font-medium text-gray-300">STATUS</span>
            <div className="text-lg font-bold text-white">
              {gameEnded ? 'Game Over' : gameStarted ? 'Playing' : 'Ready'}
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-6 shadow-2xl">
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {grid.map(i => (
              <div
                key={i}
                onClick={() => whack(i)}
                className={`aspect-square rounded-xl border-4 border-gray-600 flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                  i === active && gameStarted && !gameEnded
                    ? 'bg-orange-500 border-orange-400 shadow-lg shadow-orange-500/50'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {i === active && gameStarted && !gameEnded && (
                  <div className="text-4xl animate-bounce">🐭</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        {!gameStarted && !gameEnded && (
          <div className="text-center mb-6">
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-xl"
            >
              Start Game
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="whack-a-mole" />
        </div>

        {/* Game Over Modal */}
        {gameEnded && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">Game Over!</h2>
              <p className="text-gray-600 mb-2">Your final score:</p>
              <p className="text-4xl font-bold text-blue-600 mb-6">{score} points</p>
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
          <Leaderboard game="whack-a-mole" />
        </div>
      </div>
    </div>
  );
}
