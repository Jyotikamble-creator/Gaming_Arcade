import React, {useEffect, useState} from 'react';
import { fetchScramble, submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';
import Instructions from '../components/shared/Instructions';

export default function WordScramble(){
  const [data, setData] = useState({ word: 'REACT', scrambled: 'TCAER' });
  const [guess, setGuess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load(){
    try {
      setIsLoading(true);
      logger.info('Loading word scramble', {}, LogTags.WORD_SCRAMBLE);
      const r = await fetchScramble();
      setData(r.data);
      setGuess('');
      setAttempts(0);
      setCorrect(false);
      setShowAnswer(false);
      logger.info('Word scramble loaded', { word: r.data?.word }, LogTags.WORD_SCRAMBLE);
    } catch (error) {
      logger.error('Failed to load scramble', error, {}, LogTags.WORD_SCRAMBLE);
      // Keep test data if API fails
    } finally {
      setIsLoading(false);
    }
  }

  async function check(){
    const isCorrect = guess.toUpperCase() === data.word.toUpperCase();
    setAttempts(prev => prev + 1);

    if(isCorrect){
      setCorrect(true);
      const score = Math.max(100 - (attempts * 10), 10);
      await submitScore({game:'word-scramble', score, meta:{attempts: attempts + 1, word: data.word}});
      logger.info('Word scramble correct', { score, attempts: attempts + 1, word: data.word }, LogTags.SAVE_SCORE);
    } else {
      logger.debug('Word scramble incorrect attempt', { attempt: attempts + 1, guess, word: data.word }, LogTags.WORD_SCRAMBLE);
    }
  }

  function revealAnswer(){
    setShowAnswer(true);
    logger.debug('Word scramble answer revealed', { word: data.word }, LogTags.WORD_SCRAMBLE);
  }

  if(isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text">Loading scrambled word...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-light-text">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🔀 Word Scramble</h1>
          <p className="text-subtle-text">Unscramble the letters to form a word!</p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <span className="text-sm font-medium text-gray-300">ATTEMPTS</span>
            <div className="text-2xl font-bold text-white">{attempts}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <span className="text-sm font-medium text-gray-300">STATUS</span>
            <div className="text-lg font-bold text-white">
              {correct ? 'Correct!' : showAnswer ? 'Revealed' : 'Guessing...'}
            </div>
          </div>
        </div>

        {/* Scrambled Word */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-6 text-center shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">Scrambled Word:</h2>
          <div className="text-4xl font-mono font-bold text-yellow-400 mb-6 tracking-wider">
            {data.scrambled.split('').map((letter, i) => (
              <span key={i} className="inline-block mx-1 p-2 bg-gray-700 rounded-lg">
                {letter}
              </span>
            ))}
          </div>
        </div>

        {/* Input and Controls */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <input
              value={guess}
              onChange={e=>setGuess(e.target.value)}
              disabled={correct || showAnswer}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Enter your guess..."
              onKeyPress={(e) => e.key === 'Enter' && !correct && !showAnswer && check()}
            />
            <div className="flex gap-3">
              <button
                onClick={check}
                disabled={correct || showAnswer || !guess.trim()}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg"
              >
                Check
              </button>
              <button
                onClick={revealAnswer}
                disabled={correct || showAnswer}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg"
              >
                Reveal
              </button>
              <button
                onClick={load}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                New Word
              </button>
            </div>
          </div>
        </div>

        {/* Answer Reveal */}
        {(correct || showAnswer) && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 text-center shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">The Word Was:</h3>
            <div className="text-3xl font-mono font-bold text-green-400">
              {data.word}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="word-scramble" />
        </div>
      </div>
    </div>
  );
}
