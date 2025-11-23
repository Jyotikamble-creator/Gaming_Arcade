import React, {useEffect, useState, useCallback} from 'react';
import { startSimon, submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/leaderboard/Leaderboard';
import SimonSaysStats from '../components/simonsays/SimonSaysStats';
import SimonSaysGrid from '../components/simonsays/SimonSaysGrid';
import SimonSaysGameOverModal from '../components/simonsays/SimonSaysGameOverModal';

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

  useEffect(() => {
    const initializeGame = async () => {
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
    };

    initializeGame();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const restartGame = async () => {
    try {
      setIsLoading(true);
      logger.info('Restarting Simon Says game', {}, LogTags.SIMON_SAYS);
      const r = await startSimon();
      setColors(r.data.colors || ['red', 'blue', 'green', 'yellow']);
      setSeq([]);
      setPlayerSeq([]);
      setRound(0);
      setGameOver(false);
      setGameWon(false);
      setActiveColor(null);
      nextRound([]);
      logger.info('Simon Says restarted', { colors: r.data.colors?.length || 4 }, LogTags.SIMON_SAYS);
    } catch (error) {
      logger.error('Failed to restart Simon Says', error, {}, LogTags.SIMON_SAYS);
      setColors(['red', 'blue', 'green', 'yellow']);
      nextRound([]);
    } finally {
      setIsLoading(false);
    }
  };

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
        <SimonSaysStats
          round={round}
          sequenceLength={seq.length}
          gameStatus={gameWon ? 'Won!' : gameOver ? 'Game Over' : isShowingSequence ? 'Watch...' : 'Your Turn'}
        />

        {/* Color Buttons */}
        <SimonSaysGrid
          colors={colors}
          activeColor={activeColor}
          isShowingSequence={isShowingSequence}
          gameOver={gameOver}
          gameWon={gameWon}
          onPress={press}
        />

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="simon-says" />
        </div>

        {/* Game Over Modal */}
        {(gameOver || gameWon) && (
          <SimonSaysGameOverModal
            gameWon={gameWon}
            round={round}
            onRestart={restartGame}
          />
        )}

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="simon-says" />
        </div>
      </div>
    </div>
  );
}
