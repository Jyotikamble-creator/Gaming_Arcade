import React, {useEffect, useState, useRef} from 'react';
import { fetchTypingPassage, submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/Leaderboard';

export default function TypingTest(){
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const textareaRef = useRef(null);

  useEffect(()=> load(), []);

  async function load(){
    try {
      setIsLoading(true);
      logger.info('Loading typing passage', {}, LogTags.TYPING_TEST);
      const res = await fetchTypingPassage();
      setText(res.data.text || 'Loading failed. Please try again.');
      setInput('');
      setStartTime(null);
      setDone(false);
      setWpm(0);
      setAccuracy(100);
      logger.info('Typing passage loaded', { length: res.data.text?.length }, LogTags.TYPING_TEST);
    } catch (error) {
      logger.error('Failed to load typing passage', error, {}, LogTags.TYPING_TEST);
      setText('Failed to load typing passage. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  }

  function onChange(e){
    if(!startTime) setStartTime(Date.now());
    setInput(e.target.value);

    // Calculate accuracy
    const inputChars = e.target.value.split('');
    const textChars = text.slice(0, inputChars.length).split('');
    const correctChars = inputChars.filter((char, i) => char === textChars[i]).length;
    const newAccuracy = inputChars.length > 0 ? Math.round((correctChars / inputChars.length) * 100) : 100;
    setAccuracy(newAccuracy);

    if(e.target.value.trim() === text.trim()){ finish(); }
  }

  async function finish(){
    setDone(true);
    const seconds = (Date.now()-startTime)/1000;
    const words = text.split(/\s+/).length;
    const calculatedWpm = Math.round((words / seconds)*60);
    setWpm(calculatedWpm);

    await submitScore({ game:'typing-test', score: calculatedWpm, meta:{seconds, words, accuracy} });
    logger.info('Typing test completed', { wpm: calculatedWpm, accuracy, seconds }, LogTags.SAVE_SCORE);
  }

  if(isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text">Loading typing passage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-light-text">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⌨️ Typing Test</h1>
          <p className="text-subtle-text">Test your typing speed and accuracy!</p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <span className="text-sm font-medium text-gray-300">WPM</span>
            <div className="text-2xl font-bold text-white">{done ? wpm : '--'}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <span className="text-sm font-medium text-gray-300">ACCURACY</span>
            <div className="text-2xl font-bold text-white">{accuracy}%</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <span className="text-sm font-medium text-gray-300">STATUS</span>
            <div className="text-lg font-bold text-white">{done ? 'Completed' : 'Typing...'}</div>
          </div>
        </div>

        {/* Passage Display */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-2xl">
          <div className="text-lg leading-relaxed text-gray-200 mb-4 font-mono">
            {text.split('').map((char, i) => {
              let className = '';
              if (i < input.length) {
                className = input[i] === char ? 'text-green-400' : 'text-red-400 bg-red-900/30';
              } else if (i === input.length) {
                className = 'bg-blue-500/30';
              }
              return (
                <span key={i} className={className}>
                  {char}
                </span>
              );
            })}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-2xl">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={onChange}
            rows={6}
            disabled={done}
            className="w-full bg-transparent border border-gray-600 rounded-lg p-4 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Start typing here..."
          />
        </div>

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="typing-test" />
        </div>

        {/* Completion Modal */}
        {done && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">Test Completed!</h2>
              <div className="space-y-2 mb-6">
                <p className="text-gray-600">Words per minute:</p>
                <p className="text-4xl font-bold text-blue-600">{wpm} WPM</p>
                <p className="text-gray-600">Accuracy: {accuracy}%</p>
              </div>
              <button
                onClick={load}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Take Test Again
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="typing-test" />
        </div>
      </div>
    </div>
  );
}
