import React, { useState, useEffect, useCallback } from 'react';
import TileGrid from '../components/musictiles/TileGrid';
import ScoreDisplay from '../components/musictiles/ScoreDisplay';
import GameControls from '../components/musictiles/GameControls';
import Instructions from '../components/shared/Instructions';
import { saveScore } from '../api/scoreApi';

const MusicTiles = () => {
  const [tiles, setTiles] = useState(Array(16).fill().map(() => ({ active: false, timing: 0 })));
  const [sequence, setSequence] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState('ready'); // ready, playing, paused, gameOver
  const [speed, setSpeed] = useState(1000);

  const generateSequence = useCallback(() => {
    const newSequence = [];
    for (let i = 0; i < level + 3; i++) {
      newSequence.push(Math.floor(Math.random() * 16));
    }
    setSequence(newSequence);
  }, [level]);

  const playSequence = useCallback(() => {
    setGameState('playing');
    setCurrentStep(0);

    const playStep = (step) => {
      if (step >= sequence.length) {
        setGameState('waiting');
        return;
      }

      setTiles(prevTiles => {
        const newTiles = prevTiles.map((tile, index) => ({
          ...tile,
          active: index === sequence[step]
        }));
        return newTiles;
      });

      setTimeout(() => {
        setTiles(prevTiles => prevTiles.map(tile => ({ ...tile, active: false })));
        setTimeout(() => playStep(step + 1), speed / 2);
      }, speed);
    };

    setTimeout(() => playStep(0), 500);
  }, [sequence, speed]);

  const handleTileClick = useCallback((index) => {
    if (gameState !== 'waiting') return;

    if (index === sequence[currentStep]) {
      setScore(prev => prev + 100);
      setCurrentStep(prev => {
        const newStep = prev + 1;
        if (newStep >= sequence.length) {
          // Level complete
          setLevel(prevLevel => prevLevel + 1);
          setSpeed(prevSpeed => Math.max(300, prevSpeed - 50));
          setTimeout(() => {
            generateSequence();
            setTimeout(() => playSequence(), 1000);
          }, 1000);
        }
        return newStep;
      });
    } else {
      // Wrong tile
      setGameState('gameOver');
    }
  }, [gameState, sequence, generateSequence, playSequence]);

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setSpeed(1000);
    setCurrentStep(0);
    generateSequence();
    setTimeout(() => playSequence(), 1000);
  };

  const resetGame = () => {
    setGameState('ready');
    setTiles(Array(16).fill().map(() => ({ active: false, timing: 0 })));
    setSequence([]);
    setCurrentStep(0);
    setScore(0);
    setLevel(1);
    setSpeed(1000);
  };

  const saveGameScore = async () => {
    try {
      await saveScore('music-tiles', score, { level, speed });
      alert(`Score saved! Level: ${level}, Score: ${score}`);
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  return (
    <div className="min-h-screen text-light-text p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">🎵 Music Tiles</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <TileGrid tiles={tiles} onTileClick={handleTileClick} />
            </div>
            <div className="lg:w-64 space-y-4">
              <ScoreDisplay score={score} level={level} gameState={gameState} />
              <GameControls
                gameState={gameState}
                onStart={startGame}
                onReset={resetGame}
                onSave={saveGameScore}
                score={score}
              />
            </div>
          </div>
          
          {/* Instructions */}
          <div className="mt-6">
            <Instructions gameType="music-tiles" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicTiles;