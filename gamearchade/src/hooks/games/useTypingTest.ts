// Custom hook for Typing Test game logic
import { useState, useCallback, useEffect } from 'react';
import { 
  TypingTestStats, 
  TypingTestHookReturn, 
  TypingPassage,
  TypingTestDifficulty
} from '@/types/games/typing-test';
import { 
  calculateWPM, 
  calculateAccuracy, 
  calculateStats,
  isTestComplete,
  generateTypingPassages,
  TYPING_CONFIG 
} from '@/utility/games/typing-test';

export const useTypingTest = (initialDifficulty: TypingTestDifficulty = 'medium'): TypingTestHookReturn => {
  const [text, setText] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [done, setDone] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [difficulty, setDifficulty] = useState<TypingTestDifficulty>(initialDifficulty);

  // Initialize with a random passage
  useEffect(() => {
    resetTest(initialDifficulty);
  }, []);

  // Update stats in real-time
  useEffect(() => {
    if (startTime && input.length > 0) {
      const currentTime = Date.now();
      const currentWpm = calculateWPM(input.length, currentTime - startTime);
      const currentAccuracy = calculateAccuracy(input, text);
      
      setWpm(currentWpm);
      setAccuracy(currentAccuracy);
      
      // Check if test is complete
      if (isTestComplete(input, text)) {
        setDone(true);
      }
    }
  }, [input, text, startTime]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const newInput = e.target.value;
    
    // Start timer on first keystroke
    if (!startTime && newInput.length === 1) {
      setStartTime(Date.now());
    }
    
    // Prevent input longer than source text
    if (newInput.length <= text.length) {
      setInput(newInput);
    }
  }, [startTime, text.length]);

  const resetTest = useCallback((newDifficulty?: TypingTestDifficulty): void => {
    setIsLoading(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const diffToUse = newDifficulty || difficulty;
      setDifficulty(diffToUse);
      const passages = generateTypingPassages(diffToUse);
      const randomPassage = passages[Math.floor(Math.random() * passages.length)];
      
      setText(randomPassage);
      setInput('');
      setStartTime(null);
      setDone(false);
      setWpm(0);
      setAccuracy(100);
      setIsLoading(false);
    }, 300);
  }, [difficulty]);

  const stats: TypingTestStats = {
    wpm,
    accuracy,
    correctChars: input.split('').filter((char, i) => char === text[i]).length,
    totalChars: input.length,
    elapsedTime: startTime ? Math.round((Date.now() - startTime) / 1000) : 0
  };

  return {
    text,
    input,
    wpm,
    accuracy,
    isLoading,
    startTime,
    done,
    handleInputChange,
    resetTest,
    stats
  };
};