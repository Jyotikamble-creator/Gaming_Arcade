// Custom hook for Typing Test game logic
import { useState, useCallback, useEffect } from 'react';
import { TypingTestState, TypingTestStats, TypingPassage } from '../types/typingTest';
import { 
  calculateWPM, 
  calculateAccuracy, 
  calculateStats, 
  isTestComplete,
  TYPING_CONFIG 
} from '../utils/typingTestUtils';
import { fetchTypingPassage, submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';

export interface UseTypingTestReturn {
  text: string;
  input: string;
  startTime: number | null;
  done: boolean;
  isLoading: boolean;
  wpm: number;
  accuracy: number;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  loadNewPassage: () => Promise<void>;
  resetTest: () => void;
}

export function useTypingTest(): UseTypingTestReturn {
  const [state, setState] = useState<TypingTestState>({
    text: '',
    input: '',
    startTime: null,
    done: false,
    isLoading: true,
    wpm: 0,
    accuracy: 100
  });

  // Load typing passage
  const loadNewPassage = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      logger.info('Loading typing passage', {}, LogTags.TYPING_TEST);
      
      const response = await fetchTypingPassage();
      const newText = response.data.text || 'Loading failed. Please try again.';
      
      setState(prev => ({
        ...prev,
        text: newText,
        input: '',
        startTime: null,
        done: false,
        wpm: 0,
        accuracy: 100,
        isLoading: false
      }));
      
      logger.info('Typing passage loaded', { length: newText.length }, LogTags.TYPING_TEST);
    } catch (error) {
      logger.error('Failed to load typing passage', error, {}, LogTags.TYPING_TEST);
      setState(prev => ({
        ...prev,
        text: 'Failed to load typing passage. Please refresh.',
        isLoading: false
      }));
    }
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const newInput = e.target.value;
    const currentTime = Date.now();

    setState(prev => {
      // Start timer on first character
      const startTime = prev.startTime || currentTime;
      
      // Calculate real-time accuracy
      const accuracy = calculateAccuracy(newInput, prev.text);
      
      // Calculate real-time WPM
      const wpm = startTime ? calculateWPM(newInput.length, currentTime - startTime) : 0;
      
      return {
        ...prev,
        input: newInput,
        startTime,
        accuracy,
        wpm
      };
    });

    // Check for completion
    if (isTestComplete(newInput, state.text)) {
      finishTest(newInput, currentTime);
    }
  }, [state.text]);

  // Finish the test
  const finishTest = useCallback(async (finalInput: string, endTime: number): Promise<void> => {
    if (!state.startTime) return;

    const stats = calculateStats(finalInput, state.text, state.startTime, endTime);
    
    setState(prev => ({
      ...prev,
      done: true,
      wpm: stats.wpm,
      accuracy: stats.accuracy
    }));

    try {
      await submitScore({ 
        game: TYPING_CONFIG.GAME_NAME, 
        score: stats.wpm, 
        meta: { 
          seconds: stats.elapsedTime, 
          words: Math.ceil(state.text.split(/\s+/).length), 
          accuracy: stats.accuracy 
        } 
      });
      
      logger.info('Typing test completed', {
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        elapsedTime: stats.elapsedTime
      }, LogTags.SAVE_SCORE);
    } catch (error) {
      logger.error('Failed to submit typing test score', error, {}, LogTags.SAVE_SCORE);
    }
  }, [state.startTime, state.text]);

  // Reset test
  const resetTest = useCallback((): void => {
    setState(prev => ({
      ...prev,
      input: '',
      startTime: null,
      done: false,
      wpm: 0,
      accuracy: 100
    }));
  }, []);

  // Load initial passage on mount
  useEffect(() => {
    loadNewPassage();
  }, [loadNewPassage]);

  return {
    text: state.text,
    input: state.input,
    startTime: state.startTime,
    done: state.done,
    isLoading: state.isLoading,
    wpm: state.wpm,
    accuracy: state.accuracy,
    handleInputChange,
    loadNewPassage,
    resetTest
  };
}