import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const Instructions = ({ gameType }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getInstructions = () => {
    switch (gameType) {
      case 'emoji-guess':
        return {
          title: 'How to Play Emoji Guess',
          rules: [
            '• Look at the emoji combination displayed',
            '• Type your guess for what the emojis represent',
            '• You have 3 attempts to guess correctly',
            '• Use hints if you get stuck (costs points)',
            '• Higher difficulty puzzles give more points!'
          ],
          tip: '💡 Tip: Think about common phrases, movies, or concepts that these emojis might represent!'
        };
      case 'word-guess':
        return {
          title: 'How to Play Word Guess',
          rules: [
            '• Read the word description carefully',
            '• Click on letters to guess the hidden word',
            '• You have limited wrong guesses allowed',
            '• Use hints if you need help',
            '• Complete words quickly for bonus points!'
          ],
          tip: '💡 Tip: Start with common letters like A, E, I, O, U and look for patterns!'
        };
      case 'memory-card':
        return {
          title: 'How to Play Memory Cards',
          rules: [
            '• Click on cards to flip them over',
            '• Find matching pairs of cards',
            '• Remember card positions as you play',
            '• Match all pairs to win the game',
            '• Try to complete it in the fewest moves!'
          ],
          tip: '💡 Tip: Start with cards you\'re sure about, then work on the harder matches!'
        };
      case 'math-quiz':
        return {
          title: 'How to Play Math Quiz',
          rules: [
            '• Answer math questions as quickly as possible',
            '• Choose the correct answer from options',
            '• Questions get progressively harder',
            '• Watch the timer - speed matters!',
            '• Earn bonus points for quick correct answers'
          ],
          tip: '💡 Tip: Read questions carefully and use mental math shortcuts when possible!'
        };
      case 'typing-test':
        return {
          title: 'How to Play Typing Test',
          rules: [
            '• Type the displayed text as fast and accurately as possible',
            '• Your WPM (Words Per Minute) will be calculated',
            '• Accuracy affects your final score',
            '• Try to maintain steady typing speed',
            '• Practice regularly to improve your skills!'
          ],
          tip: '💡 Tip: Focus on accuracy first, then work on speed. Good posture helps!'
        };
      case 'word-scramble':
        return {
          title: 'How to Play Word Scramble',
          rules: [
            '• Unscramble the jumbled letters to form a word',
            '• Type your answer in the input field',
            '• You have limited time for each word',
            '• Longer words give more points',
            '• Beat your high score!'
          ],
          tip: '💡 Tip: Look for common prefixes/suffixes and try different letter combinations!'
        };
      case 'whack-mole':
        return {
          title: 'How to Play Whack-a-Mole',
          rules: [
            '• Click on moles as they appear from holes',
            '• Each mole hit gives you points',
            '• Don\'t miss too many or the game ends',
            '• Speed and accuracy are key!',
            '• Try to beat your high score'
          ],
          tip: '💡 Tip: Anticipate where moles will appear and keep your cursor ready!'
        };
      case 'simon-says':
        return {
          title: 'How to Play Simon Says',
          rules: [
            '• Watch the color sequence carefully',
            '• Repeat the sequence by clicking the colors',
            '• Each round adds one more color to remember',
            '• Sequences get longer and faster',
            '• How far can you go?'
          ],
          tip: '💡 Tip: Focus on the pattern and try to memorize groups of colors!'
        };
      case 'tic-tac-toe':
        return {
          title: 'How to Play Tic-Tac-Toe',
          rules: [
            '• Get three of your marks in a row to win',
            '• You play as X, computer plays as O',
            '• Click on empty squares to place your mark',
            '• Try to block your opponent\'s winning moves',
            '• Plan ahead and think strategically!'
          ],
          tip: '💡 Tip: Corners are powerful positions - control them when possible!'
        };
      case 'quiz':
        return {
          title: 'How to Play Quiz',
          rules: [
            '• Answer multiple choice questions',
            '• Choose the best answer from options',
            '• Questions cover various topics',
            '• Speed and accuracy both matter',
            '• Learn something new while having fun!'
          ],
          tip: '💡 Tip: Read all options carefully before selecting your answer!'
        };
      case 'sudoku':
        return {
          title: 'How to Play Sudoku',
          rules: [
            '• Fill the 9×9 grid with numbers 1-9',
            '• Each row must contain all digits 1-9',
            '• Each column must contain all digits 1-9',
            '• Each 3×3 box must contain all digits 1-9',
            '• Use notes mode to mark possible numbers',
            '• Get hints when stuck, but they reduce your score!'
          ],
          tip: '💡 Tip: Start by looking for cells with only one possible number. Use the process of elimination!'
        };
      case 'word-builder':
        return {
          title: 'How to Play Word Builder',
          rules: [
            '• Click letters to form valid words',
            '• Words must be at least 3 letters long',
            '• Click letters in your word to remove them',
            '• Use Shuffle to rearrange available letters',
            '• Find the minimum required words to complete',
            '• Longer words give bonus points!'
          ],
          tip: '💡 Tip: Start with smaller words, then try to find longer ones. Use all the letters if possible!'
        };
      case 'speed-math':
        return {
          title: 'How to Play Speed Math',
          rules: [
            '• Solve as many math problems as you can in 60 seconds',
            '• Type your answer and press Enter or click Submit',
            '• Correct answers earn points based on difficulty',
            '• Build a streak for bonus points',
            '• Skip problems if you get stuck (breaks your streak)',
            '• Choose your difficulty: Easy (5 pts), Medium (10 pts), Hard (15 pts)'
          ],
          tip: '💡 Tip: Speed and accuracy both matter! Build streaks for bonus points - every 3 correct answers in a row adds extra points!'
        };
      default:
        return {
          title: 'How to Play',
          rules: ['• Follow the game instructions', '• Have fun!', '• Try your best!'],
          tip: '💡 Tip: Enjoy the game and learn as you play!'
        };
    }
  };

  const instructions = getInstructions();

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 shadow-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-white hover:text-blue-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          <span className="font-medium">{instructions.title}</span>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isExpanded && (
        <div className="mt-4 text-gray-300 text-sm space-y-2">
          {instructions.rules.map((rule, index) => (
            <p key={index}>{rule}</p>
          ))}
          <div className="mt-3 p-3 bg-blue-500/20 rounded-lg">
            <p className="text-blue-300 font-medium">{instructions.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Instructions;