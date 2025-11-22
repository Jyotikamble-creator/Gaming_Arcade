import React, {useEffect, useState} from 'react';
import { fetchTypingPassage, submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';
import Instructions from '../components/shared/Instructions';
import Leaderboard from '../components/Leaderboard';
import MetricCard from '../components/typetesting/MetricCard';
import TypingArea from '../components/typetesting/TypingArea';
import CompletionModal from '../components/typetesting/CompletionModal';

export default function TypingTest(){
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  useEffect(() => {
    const fetchData = async () => {
      await load();
    };
    fetchData();
  }, []);

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
          <MetricCard label="WPM" value={done ? wpm : '--'} />
          <MetricCard label="ACCURACY" value={`${accuracy}%`} />
          <MetricCard label="STATUS" value={done ? 'Completed' : 'Typing...'} />
        </div>

        {/* Typing Area */}
        <TypingArea 
          sourceText={text} 
          typedInput={input} 
          onChange={onChange} 
          disabled={done} 
        />

        {/* New Passage Button */}
        <div className="flex justify-center mt-6 mb-6">
          <button
            onClick={load}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition duration-200"
          >
            Load New Passage
          </button>
        </div>

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="typing-test" />
        </div>

        {/* Completion Modal */}
        {done && (
          <CompletionModal wpm={wpm} accuracy={accuracy} onRestart={load} />
        )}

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="typing-test" />
        </div>
      </div>
    </div>
  );
}
