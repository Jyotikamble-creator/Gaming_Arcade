'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Card {
  id: number;
  value: string;
  category?: string;
}

interface BoardProps {
  cards: Card[];
  flipped: number[];
  matched: number[];
  onCardClick: (id: number) => void;
  disabled: boolean;
  className?: string;
}

interface CardComponentProps {
  card: Card;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
  disabled: boolean;
}

const CardComponent: React.FC<CardComponentProps> = ({ 
  card, 
  isFlipped, 
  isMatched, 
  onClick, 
  disabled 
}) => {
  const handleClick = () => {
    if (!disabled && !isFlipped && !isMatched) {
      onClick();
    }
  };

  return (
    <motion.div
      className="relative aspect-square cursor-pointer"
      whileHover={{ scale: disabled || isFlipped || isMatched ? 1 : 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
    >
      <div className={`
        w-full h-full rounded-lg transition-all duration-300 relative
        ${isMatched ? 'opacity-75' : 'opacity-100'}
      `}>
        <AnimatePresence mode="wait">
          {isFlipped || isMatched ? (
            <motion.div
              key="front"
              initial={{ rotateY: 90 }}
              animate={{ rotateY: 0 }}
              exit={{ rotateY: 90 }}
              transition={{ duration: 0.3 }}
              className={`
                absolute inset-0 flex items-center justify-center rounded-lg text-4xl font-bold
                ${isMatched 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'bg-white text-gray-800 shadow-lg'
                }
              `}
            >
              {card.value}
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ rotateY: 90 }}
              animate={{ rotateY: 0 }}
              exit={{ rotateY: 90 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white/40 rounded-full"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Glow effect for matched cards */}
      {isMatched && (
        <div className="absolute inset-0 rounded-lg bg-green-400 opacity-30 blur-md"></div>
      )}
    </motion.div>
  );
};

const Board: React.FC<BoardProps> = ({ 
  cards, 
  flipped, 
  matched, 
  onCardClick, 
  disabled,
  className 
}) => {
  const gridSize = Math.ceil(Math.sqrt(cards.length));
  const isSmallGrid = cards.length <= 16;

  return (
    <div className={`flex justify-center mb-8 ${className || ''}`}>
      <div 
        className={`
          grid gap-3 md:gap-4 max-w-2xl w-full
          ${isSmallGrid 
            ? 'grid-cols-4' 
            : `grid-cols-${Math.min(gridSize, 6)}`
          }
        `}
        style={{
          gridTemplateColumns: `repeat(${isSmallGrid ? 4 : Math.min(gridSize, 6)}, 1fr)`
        }}
      >
        {cards.map((card) => (
          <CardComponent
            key={card.id}
            card={card}
            isFlipped={flipped.includes(card.id)}
            isMatched={matched.includes(card.id)}
            onClick={() => onCardClick(card.id)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};

export default Board;