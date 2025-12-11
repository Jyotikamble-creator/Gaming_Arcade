import React, { useState, useEffect } from 'react';
import { submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/leaderboard/Leaderboard';
import WordBuilderBoard from '../components/wordbuilder/WordBuilderBoard';
import WordBuilderControls from '../components/wordbuilder/WordBuilderControls';
import WordBuilderStats from '../components/wordbuilder/WordBuilderStats';
import WordBuilderCompletedModal from '../components/wordbuilder/WordBuilderCompletedModal';

// Word challenges with given letters and target words
const wordChallenges = [
  {
    difficulty: 'easy',
    letters: ['C', 'A', 'T', 'S', 'R', 'E'],
    targetWords: ['CAT', 'CATS', 'CAST', 'CARE', 'CASE', 'RACE', 'SCARE', 'CRATE', 'STARE', 'CARES', 'REACT', 'CASTER', 'RECAST', 'TRACES', 'CRATES'],
    minWords: 5
  },
  {
    difficulty: 'easy',
    letters: ['D', 'O', 'G', 'S', 'R', 'E'],
    targetWords: ['DOG', 'DOGS', 'DOSE', 'DOES', 'RODE', 'ROSE', 'GOES', 'SORE', 'REDO', 'DOERS', 'GOERS', 'GORED', 'RODES'],
    minWords: 5
  },
  {
    difficulty: 'medium',
    letters: ['P', 'L', 'A', 'Y', 'E', 'R', 'S'],
    targetWords: ['PLAY', 'PLAYS', 'LAYER', 'RELAY', 'EARLY', 'YEARS', 'SPRAY', 'REPAY', 'LEAPY', 'SLAYER', 'PLAYER', 'PARLEY', 'REPLAY', 'PLAYERS', 'PARSLEY'],
    minWords: 7
  },
  {
    difficulty: 'medium',
    letters: ['T', 'R', 'A', 'I', 'N', 'E', 'D'],
    targetWords: ['TRAIN', 'TRADE', 'TREND', 'DRAIN', 'DINER', 'TREAD', 'RATED', 'RETINA', 'DETAIN', 'RAINED', 'TRAINED'],
    minWords: 7
  },
  {
    difficulty: 'hard',
    letters: ['C', 'R', 'E', 'A', 'T', 'I', 'V', 'E'],
    targetWords: ['CREATE', 'ACTIVE', 'NATIVE', 'REACTIVE', 'CREATIVE'],
    minWords: 3
  },
  {
    difficulty: 'hard',
    letters: ['S', 'T', 'U', 'D', 'E', 'N', 'T', 'S'],
    targetWords: ['STUDENT', 'STUDENTS', 'STUNTED', 'DENTIST', 'NESTLED'],
    minWords: 3
  }
];

export default function WordBuilder() {
  const [difficulty, setDifficulty] = useState('easy');
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [availableLetters, setAvailableLetters] = useState([]);
  const [currentWord, setCurrentWord] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);

  useEffect(() => {
    startNewGame(difficulty);
  }, []);

  // Timer effect
  useEffect(() => {
    if (startTime && !isCompleted) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, isCompleted]);

  function startNewGame(diff) {
    logger.info('Starting new Word Builder game', { difficulty: diff }, LogTags.GAME_LOAD);
    
    const challenges = wordChallenges.filter(c => c.difficulty === diff);
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    setCurrentChallenge(challenge);
    setAvailableLetters(challenge.letters.map((letter, idx) => ({ letter, id: idx, used: false })));
    setCurrentWord([]);
    setFoundWords([]);
    setScore(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    setIsCompleted(false);
    setMessage('');
    setMessageType('');
    setHintsUsed(0);
    setDifficulty(diff);
  }

  function handleLetterClick(letterId) {
    if (isCompleted) return;
    
    const letterObj = availableLetters.find(l => l.id === letterId && !l.used);
    if (!letterObj) return;
    
    // Mark letter as used
    setAvailableLetters(prev => 
      prev.map(l => l.id === letterId ? { ...l, used: true } : l)
    );
    
    // Add to current word
    setCurrentWord(prev => [...prev, { letter: letterObj.letter, id: letterId }]);
    setMessage('');
  }

  function handleRemoveLetter(index) {
    if (isCompleted) return;
    
    const letterToRemove = currentWord[index];
    
    // Mark letter as available again
    setAvailableLetters(prev => 
      prev.map(l => l.id === letterToRemove.id ? { ...l, used: false } : l)
    );
    
    // Remove from current word
    setCurrentWord(prev => prev.filter((_, i) => i !== index));
    setMessage('');
  }

  function handleSubmitWord() {
    if (currentWord.length < 3) {
      showMessage('Word must be at least 3 letters!', 'error');
      return;
    }
    
    const word = currentWord.map(l => l.letter).join('');
    
    // Check if already found
    if (foundWords.includes(word)) {
      showMessage('You already found this word!', 'error');
      clearCurrentWord();
      return;
    }
    
    // Check if valid word
    if (currentChallenge.targetWords.includes(word)) {
      const wordScore = calculateWordScore(word);
      setFoundWords(prev => [...prev, word]);
      setScore(prev => prev + wordScore);
      showMessage(`Great! +${wordScore} points`, 'success');
      clearCurrentWord();
      
      logger.info('Word found', { word, score: wordScore }, LogTags.GAME_COMPLETE);
      
      // Check if completed
      if (foundWords.length + 1 >= currentChallenge.minWords) {
        completeGame();
      }
    } else {
      showMessage('Not a valid word!', 'error');
      clearCurrentWord();
    }
  }

  function handleShuffle() {
    if (isCompleted) return;
    setAvailableLetters(prev => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  }

  function handleHint() {
    if (isCompleted) return;
    
    // Find a word that hasn't been found yet
    const unfoundWords = currentChallenge.targetWords.filter(w => !foundWords.includes(w));
    if (unfoundWords.length === 0) return;
    
    const hintWord = unfoundWords[0];
    showMessage(`Try: ${hintWord}`, 'hint');
    setHintsUsed(prev => prev + 1);
    
    logger.info('Hint used', { hintWord, hintsUsed: hintsUsed + 1 }, LogTags.GAME_COMPLETE);
  }

  function clearCurrentWord() {
    // Return all letters to available
    setAvailableLetters(prev => prev.map(l => ({ ...l, used: false })));
    setCurrentWord([]);
  }

  function calculateWordScore(word) {
    const baseScore = word.length * 10;
    const bonusMultiplier = word.length >= 6 ? 2 : 1;
    return baseScore * bonusMultiplier;
  }

  function showMessage(msg, type) {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  }

  function completeGame() {
    setIsCompleted(true);
    const finalTime = Math.floor((Date.now() - startTime) / 1000);
    
    // Calculate final score
    const timeBonusThreshold = { easy: 180, medium: 240, hard: 300 }[difficulty];
    const timeBonus = finalTime < timeBonusThreshold ? Math.floor((timeBonusThreshold - finalTime) * 2) : 0;
    const hintPenalty = hintsUsed * 50;
    const finalScore = Math.max(score + timeBonus - hintPenalty, 0);
    
    submitScore({
      game: 'word-builder',
      score: finalScore,
      meta: {
        difficulty,
        wordsFound: foundWords.length,
        totalWords: currentChallenge.targetWords.length,
        time: finalTime,
        hintsUsed
      }
    });
    
    logger.info('Word Builder completed', { 
      score: finalScore, 
      wordsFound: foundWords.length, 
      time: finalTime,
      hintsUsed,
      difficulty 
    }, LogTags.SAVE_SCORE);
  }

  if (!currentChallenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text">Loading Word Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-light-text">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            📝 Word Builder
          </h1>
          <p className="text-subtle-text text-lg">Form words from the given letters</p>
        </div>

        {/* Game Stats */}
        <div className="mb-8">
          <WordBuilderStats
            difficulty={difficulty}
            time={elapsedTime}
            wordsFound={foundWords.length}
            totalWords={currentChallenge.targetWords.length}
            minWords={currentChallenge.minWords}
            score={score}
            hintsUsed={hintsUsed}
          />
        </div>

        {/* Message Display */}
        {message && (
          <div className={`text-center mb-6 p-4 rounded-lg ${
            messageType === 'success' ? 'bg-green-500/20 text-green-300' :
            messageType === 'error' ? 'bg-red-500/20 text-red-300' :
            'bg-blue-500/20 text-blue-300'
          }`}>
            <p className="text-lg font-semibold">{message}</p>
          </div>
        )}

        {/* Game Area */}
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center mb-8">
          {/* Word Board */}
          <div className="flex justify-center w-full lg:w-auto">
            <WordBuilderBoard
              availableLetters={availableLetters}
              currentWord={currentWord}
              foundWords={foundWords}
              onLetterClick={handleLetterClick}
              onRemoveLetter={handleRemoveLetter}
            />
          </div>

          {/* Controls */}
          <div className="flex justify-center lg:justify-start w-full lg:w-auto">
            <WordBuilderControls
              onSubmit={handleSubmitWord}
              onClear={clearCurrentWord}
              onShuffle={handleShuffle}
              onHint={handleHint}
              onNewGame={() => startNewGame(difficulty)}
              onDifficultyChange={(diff) => {
                if (window.confirm('Start a new game with different difficulty?')) {
                  startNewGame(diff);
                }
              }}
              difficulty={difficulty}
              isCompleted={isCompleted}
              canSubmit={currentWord.length >= 3}
              hintsUsed={hintsUsed}
              maxHints={5}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="max-w-2xl mx-auto mb-8">
          <Instructions gameType="word-builder" />
        </div>

        {/* Completion Modal */}
        {isCompleted && (
          <WordBuilderCompletedModal
            isOpen={isCompleted}
            score={score}
            wordsFound={foundWords}
            totalWords={currentChallenge.targetWords.length}
            allWords={currentChallenge.targetWords}
            time={elapsedTime}
            difficulty={difficulty}
            hintsUsed={hintsUsed}
            onClose={() => setIsCompleted(false)}
            onNewGame={() => startNewGame(difficulty)}
          />
        )}

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="word-builder" />
        </div>
      </div>
    </div>
  );
}
