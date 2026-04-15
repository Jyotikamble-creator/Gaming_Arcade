'use client';

import React, { useState } from 'react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Instructions from '@/components/shared/Instructions';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import WordScrambleStats from '@/components/games/wordscramble/WordScrambleStats';
import WordScrambleDisplay from '@/components/games/wordscramble/WordScrambleDisplay';
import WordScrambleInput from '@/components/games/wordscramble/WordScrambleInput';
import WordScrambleAnswer from '@/components/games/wordscramble/WordScrambleAnswer';
import WordScrambleCompletedModal from '@/components/games/wordscramble/WordScrambleCompletedModal';
import { 
  getRandomWordByDifficulty,
  getWordSequenceForRound,
  calculateSimpleScore,
  WORD_SETS,
  GameDifficulty
} from '@/lib/games/word-scramble';

interface User {
  id: string;
  name: string;
  email?: string;
  displayName?: string;
}

interface WordScramblePageProps {
  user: User | null;
  onBackToDashboard?: () => void;
  className?: string;
}

interface WordData {
  word: string;
  scrambled: string;
  category: string;
  difficulty: GameDifficulty;
}

interface ScoreData {
  game: string;
  score: number;
  difficulty: GameDifficulty;
  metadata: Record<string, any>;
}

const WordScrambleGamePage: React.FC<WordScramblePageProps> = ({ 
  user, 
  onBackToDashboard,
  className 
}) => {
  // Game state
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [wordSequence, setWordSequence] = useState<WordData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [guess, setGuess] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [correct, setCorrect] = useState<boolean>(false);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCompletedModal, setShowCompletedModal] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [gameTime, setGameTime] = useState<number>(0);

  // Load word sequence for a round (5 words)
  const loadWordSequence = async (selectedDiff: GameDifficulty) => {
    try {
      setIsLoading(true);
      
      console.log('[WORD_SCRAMBLE] Loading word sequence for difficulty:', selectedDiff);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const words = getWordSequenceForRound(selectedDiff, 5) as WordData[];
      
      console.log('[WORD_SCRAMBLE] Loaded sequence of', words.length, 'words');
      
      setWordSequence(words);
      setCurrentQuestionIndex(0);
      setRoundScores([]);
      setTotalScore(0);
      
      // Load first word
      if (words.length > 0) {
        setWordData(words[0]);
        setGuess('');
        setAttempts(0);
        setCorrect(false);
        setShowAnswer(false);
        setStartTime(Date.now());
        setGameTime(0);
      }
    } catch (error) {
      console.error('[WORD_SCRAMBLE] Error loading word sequence:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load next word in sequence
  const loadNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex >= wordSequence.length) {
      // All questions completed!
      console.log('[WORD_SCRAMBLE] All questions completed! Final Score:', totalScore);
      submitScore(totalScore);
      setShowCompletedModal(true);
      return;
    }

    const nextWord = wordSequence[nextIndex];
    setCurrentQuestionIndex(nextIndex);
    setWordData(nextWord);
    setGuess('');
    setAttempts(0);
    setCorrect(false);
    setShowAnswer(false);
    setStartTime(Date.now());
    setGameTime(0);
  };

  // Submit guess
  const handleSubmitGuess = async () => {
    if (!wordData || !guess.trim()) return;

    console.log('[WORD_SCRAMBLE] Checking guess:', guess, 'against:', wordData.word);

    const isCorrect = guess.toUpperCase().trim() === wordData.word.toUpperCase();
    
    if (isCorrect) {
      setCorrect(true);
      const roundScore = calculateSimpleScore(difficulty, attempts, wordData.word.length);
      
      // Store score for this question
      const newScores = [...roundScores, roundScore];
      setRoundScores(newScores);
      setTotalScore(prev => prev + roundScore);
      
      console.log('[WORD_SCRAMBLE] Correct! Question Score:', roundScore, 'Total:', totalScore + roundScore);
    } else {
      setAttempts(prev => prev + 1);
      console.log('[WORD_SCRAMBLE] Incorrect. Attempts:', attempts + 1);
    }
  };

  // Reveal answer
  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  // Move to next question
  const handleNextQuestion = () => {
    loadNextQuestion();
  };

  // Start game with difficulty
  const startGame = (selectedDifficulty: GameDifficulty) => {
    console.log('[WORD_SCRAMBLE] Starting game with difficulty:', selectedDifficulty);
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
    loadWordSequence(selectedDifficulty);
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setDifficulty('medium');
    setWordSequence([]);
    setCurrentQuestionIndex(0);
    setWordData(null);
    setGuess('');
    setAttempts(0);
    setCorrect(false);
    setShowAnswer(false);
    setRoundScores([]);
    setTotalScore(0);
    setShowCompletedModal(false);
  };

  // Submit score to leaderboard
  const submitScore = async (finalScore: number) => {
    if (!user) return;

    try {
      const scoreData: ScoreData = {
        game: 'word-scramble',
        score: finalScore,
        difficulty,
        metadata: { attempts, wordLength: wordData?.word.length || 0 }
      };

      await fetch('/api/games/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData),
      });

      console.log('[WORD_SCRAMBLE] Score submitted successfully');
    } catch (error) {
      console.error('[WORD_SCRAMBLE] Error submitting score:', error);
    }
  };

  // Timer effect
  React.useEffect(() => {
    if (gameStarted && startTime && !correct) {
      const interval = setInterval(() => {
        setGameTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStarted, startTime, correct]);

  // Difficulty Selection Screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1),transparent_70%)]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Title */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-yellow-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                🔤 Word Scramble
              </h1>
              <p className="text-gray-300 text-xl mb-4">
                Unscramble the letters and find the hidden word!
              </p>
              <p className="text-gray-400 text-lg">
                Select a difficulty level to begin
              </p>
            </div>

            {/* Difficulty Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {/* Easy */}
              <button
                onClick={() => startGame('easy')}
                className="group relative overflow-hidden rounded-xl bg-linear-to-br from-green-500/20 to-emerald-600/20 border border-green-500/50 p-8 hover:border-green-400 hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">🌱</div>
                  <h3 className="text-3xl font-bold text-green-400 mb-3">Easy</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ 3-4 letter words</li>
                    <li>✓ Common words</li>
                    <li>✓ 1x Points multiplier</li>
                  </ul>
                </div>
              </button>

              {/* Medium */}
              <button
                onClick={() => startGame('medium')}
                className="group relative overflow-hidden rounded-xl bg-linear-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/50 p-8 hover:border-yellow-400 hover:from-yellow-500/30 hover:to-orange-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">⚡</div>
                  <h3 className="text-3xl font-bold text-yellow-400 mb-3">Medium</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ 8-12 letter words</li>
                    <li>✓ Moderate difficulty</li>
                    <li>✓ 2x Points multiplier</li>
                  </ul>
                </div>
              </button>

              {/* Hard */}
              <button
                onClick={() => startGame('hard')}
                className="group relative overflow-hidden rounded-xl bg-linear-to-br from-red-500/20 to-pink-600/20 border border-red-500/50 p-8 hover:border-red-400 hover:from-red-500/30 hover:to-pink-600/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">🔥</div>
                  <h3 className="text-3xl font-bold text-red-400 mb-3">Hard</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ 9-15 letter words</li>
                    <li>✓ Technical terms</li>
                    <li>✓ 3x Points multiplier</li>
                  </ul>
                </div>
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8">
              <h3 className="text-white font-semibold mb-4 text-center text-lg">How to Play</h3>
              <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                <div className="space-y-2">
                  <p>📝 Look at the scrambled letters</p>
                  <p>✏️ Type the correct unscrambled word</p>
                </div>
                <div className="space-y-2">
                  <p>✅ Get it right to earn points</p>
                  <p>💡 Use Reveal for help (harder difficulty = more points)</p>
                </div>
              </div>
            </div>

            {/* Back Button */}
            {onBackToDashboard && (
              <div className="flex justify-center">
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

  // Game Screen
  if (!wordData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading word...</p>
        </div>
      </div>
    );
  }

  // Main game view
  return (
    <div className={`min-h-screen text-white relative overflow-hidden ${className || ''}`}>
      <div className="absolute inset-0 bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-linear-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
            🔤 Word Scramble
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-300">
            <span>Difficulty: <span className="font-bold text-yellow-400 capitalize">{difficulty}</span></span>
            <span className="hidden sm:inline text-gray-500">•</span>
            <span>Question: <span className="font-bold text-blue-400">{currentQuestionIndex}/5</span></span>
            <span className="hidden sm:inline text-gray-500">•</span>
            <span>Score: <span className="font-bold text-green-400">{totalScore}</span></span>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-linear-to-r from-blue-500 to-purple-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentQuestionIndex / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Game Stats */}
        <WordScrambleStats 
          attempts={attempts}
          correct={correct}
          showAnswer={showAnswer}
          score={roundScores[currentQuestionIndex] || 0}
        />

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="word-scramble" />
        </div>

        {/* Game Board */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700 mb-6">
          {/* Scrambled Word Display */}
          <WordScrambleDisplay scrambled={wordData.scrambled} isLoading={isLoading} />

          {/* Answer Display */}
          {showAnswer && (
            <WordScrambleAnswer word={wordData.word} />
          )}

          {/* Input */}
          {!correct && (
            <div className="mt-6">
              <WordScrambleInput 
                guess={guess}
                onChange={setGuess}
                onCheck={handleSubmitGuess}
                onReveal={handleRevealAnswer}
                onNewWord={handleNextQuestion}
                correct={correct}
                showAnswer={showAnswer}
                disabled={isLoading}
                attempts={attempts}
              />
            </div>
          )}

          {/* Correct Message */}
          {correct && (
            <div className="mt-6 text-center">
              <p className="text-2xl font-bold text-green-400 mb-4">🎉 Correct!</p>
              <p className="text-xl text-gray-300 mb-6">Word: <span className="font-bold text-yellow-400">{wordData.word}</span></p>
              <p className="text-lg text-green-400 mb-6">Points: <span className="font-bold">+{roundScores[currentQuestionIndex] || 0}</span></p>
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all duration-200"
              >
                {currentQuestionIndex >= wordSequence.length - 1 ? '📊 View Results' : 'Next Question →'}
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={handleRevealAnswer}
            disabled={showAnswer || correct || isLoading}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            💡 Reveal
          </button>
          
          <button
            onClick={() => {
              submitScore(totalScore);
              setShowCompletedModal(true);
            }}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all duration-200"
          >
            📊 End Game
          </button>
        </div>

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard gameType="word-scramble" />
        </div>
      </div>

      {/* Completed Modal */}
      {showCompletedModal && (
        <WordScrambleCompletedModal 
          score={totalScore}
          onClose={() => {
            setShowCompletedModal(false);
            resetGame();
          }}
        />
      )}
    </div>
  );
};

export default WordScrambleGamePage;
