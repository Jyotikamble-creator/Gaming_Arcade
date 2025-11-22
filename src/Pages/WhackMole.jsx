import React, {useEffect, useState, useRef} from 'react';
import { startWhack, submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/Leaderboard';
import WhackMoleStats from '../components/whackmole/WhackMoleStats';
import WhackMoleGrid from '../components/whackmole/WhackMoleGrid';
import WhackMoleGameOverModal from '../components/whackmole/WhackMoleGameOverModal';

export default function WhackMole(){
  const [grid, setGrid] = useState([]);
  const [active, setActive] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef(null);
  const gameTimerRef = useRef(null);

  useEffect(() => {
    const initializeGame = async () => {
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
    };

    initializeGame();

    // Cleanup function to clear any timers when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, []);

  const restartGame = async () => {
    try {
      setIsLoading(true);
      logger.info('Restarting whack-a-mole game', {}, LogTags.WHACK_MOLE);
      const r = await startWhack();
      const gridSize = r.data.gridSize || 9;
      setGrid(Array.from({length: gridSize}, (_,i)=>i));
      setScore(0);
      setTimeLeft(r.data.duration || 30);
      setGameStarted(false);
      setGameEnded(false);
      setActive(null);
      logger.info('Whack-a-mole restarted', { gridSize, duration: r.data.duration || 30 }, LogTags.WHACK_MOLE);
    } catch (error) {
      logger.error('Failed to restart whack-a-mole', error, {}, LogTags.WHACK_MOLE);
      setGrid(Array.from({length: 9}, (_,i)=>i));
      setTimeLeft(30);
    } finally {
      setIsLoading(false);
    }
  };

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
        <WhackMoleStats
          score={score}
          timeLeft={timeLeft}
          gameStatus={gameEnded ? 'Game Over' : gameStarted ? 'Playing' : 'Ready'}
        />

        {/* Game Grid */}
        <WhackMoleGrid
          grid={grid}
          active={active}
          gameStarted={gameStarted}
          gameEnded={gameEnded}
          onWhack={whack}
        />

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
          <WhackMoleGameOverModal
            score={score}
            onRestart={restartGame}
          />
        )}

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="whack-a-mole" />
        </div>
      </div>
    </div>
  );
}
