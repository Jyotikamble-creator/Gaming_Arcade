'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface InstructionData {
  title: string;
  rules: string[];
  tip: string;
}

interface InstructionsProps {
  gameType: string;
}

const Instructions: React.FC<InstructionsProps> = ({ gameType }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getInstructions = (): InstructionData => {
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
      case 'brain-teaser':
        return {
          title: 'How to Play Brain Teasers',
          rules: [
            '• You have 60 seconds to solve as many puzzles as possible',
            '• Three types: Match Shape, Find Odd One, Pattern Test',
            '• Click the correct answer for each puzzle',
            '• Build streaks for bonus points (3+ in a row)',
            '• Harder puzzles give more points',
            '• Speed and accuracy both matter!'
          ],
          tip: '💡 Tip: Focus on one property at a time - shape, color, or pattern. Don\'t rush, accuracy builds your streak!'
        };
      case 'coding-puzzle':
        return {
          title: 'How to Play Coding Puzzle',
          rules: [
            '• Choose a puzzle category (Patterns, Code Output, Logic, or Bitwise)',
            '• Read the puzzle question carefully',
            '• Type your answer in the input field',
            '• Use hints if needed (reduces bonus points)',
            '• Solve 10 puzzles to complete the game',
            '• Build streaks for bonus points!'
          ],
          tip: '💡 Tip: For number patterns, look for common sequences (Fibonacci, powers, arithmetic). For code output, trace through the logic step by step!'
        };
      case 'hangman':
        return {
          title: 'How to Play Hangman',
          rules: [
            '• Choose a category to start playing',
            '• Click letters to guess the hidden word',
            '• You have 6 wrong guesses before game over',
            '• Use hints if you get stuck (costs 10 points)',
            '• Longer words give bonus points',
            '• Complete words to increase your score!'
          ],
          tip: '💡 Tip: Start with common vowels (A, E, I, O, U) and frequent consonants (R, S, T, N). Pay attention to word length!'
        };
      case '2048':
        return {
          title: 'How to Play 2048',
          rules: [
            '• Use arrow keys or buttons to move tiles',
            '• When two tiles with the same number touch, they merge into one',
            '• After every move, a new tile (2 or 4) appears',
            '• Goal is to create a tile with the number 2048',
            '• Game ends when no more moves are possible',
            '• You can continue playing after reaching 2048 for higher scores!'
          ],
          tip: '💡 Tip: Keep your highest value tile in one corner and build around it. Plan ahead to avoid getting stuck!'
        };
      case 'math-quiz':
        return {
          title: 'How to Play Math Quiz',
          rules: [
            '• Answer 10 randomly generated math questions',
            '• You have 30 seconds per question',
            '• Click on the correct answer option',
            '• Each correct answer gives you 10 points',
            '• Questions include addition, subtraction, multiplication, and division',
            '• Skip questions if you get stuck (no points awarded)',
            '• Try to answer all questions quickly and accurately!'
          ],
          tip: '💡 Tip: Don\'t spend too much time on one question. Use mental math shortcuts and remember basic multiplication tables!'
        };
      case 'memory-card':
        return {
          title: 'How to Play Memory Cards',
          rules: [
            '• Click on cards to flip them and reveal their values',
            '• Find matching pairs by remembering card positions',
            '• Only two cards can be flipped at a time',
            '• Matched pairs stay face up',
            '• Complete the game by matching all pairs',
            '• Score is based on moves and time taken',
            '• Fewer moves and less time = higher score!'
          ],
          tip: '💡 Tip: Focus on remembering the positions of unique cards. Start from corners and work systematically!'
        };
      case 'number-maze':
        return {
          title: 'How to Play Number Maze',
          rules: [
            '• Navigate through a 5x5 grid of numbers',
            '• Start at the top-left corner (always 0)',
            '• Move up, down, left, or right to adjacent cells',
            '• Cannot revisit cells you\'ve already been to',
            '• Each cell adds its value to your running sum',
            '• Goal is to reach the exact target number',
            '• Score is based on moves taken and time elapsed!'
          ],
          tip: '💡 Tip: Plan your path carefully! Think ahead and consider both positive and negative numbers to reach your target efficiently.'
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