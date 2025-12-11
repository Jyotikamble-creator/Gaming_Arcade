import React from 'react';

// Shape components
const ShapeRenderer = ({ shape, color, size = 'large' }) => {
  const sizeClass = size === 'large' ? 'w-24 h-24' : size === 'medium' ? 'w-16 h-16' : 'w-12 h-12';
  const colorMap = {
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    purple: '#a855f7',
    orange: '#f97316',
    pink: '#ec4899',
    cyan: '#06b6d4'
  };

  const shapeColor = colorMap[color] || '#fff';

  const renderShape = () => {
    switch (shape) {
      case 'circle':
        return (
          <div 
            className={`${sizeClass} rounded-full`}
            style={{ backgroundColor: shapeColor }}
          />
        );
      case 'square':
        return (
          <div 
            className={`${sizeClass} rounded-lg`}
            style={{ backgroundColor: shapeColor }}
          />
        );
      case 'triangle':
        return (
          <div 
            className={sizeClass}
            style={{
              width: 0,
              height: 0,
              borderLeft: size === 'large' ? '48px solid transparent' : size === 'medium' ? '32px solid transparent' : '24px solid transparent',
              borderRight: size === 'large' ? '48px solid transparent' : size === 'medium' ? '32px solid transparent' : '24px solid transparent',
              borderBottom: size === 'large' ? `83px solid ${shapeColor}` : size === 'medium' ? `55px solid ${shapeColor}` : `41px solid ${shapeColor}`
            }}
          />
        );
      case 'diamond':
        return (
          <div 
            className={`${sizeClass} rotate-45 rounded-md`}
            style={{ backgroundColor: shapeColor }}
          />
        );
      case 'star':
        return (
          <div className={sizeClass} style={{ color: shapeColor }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        );
      case 'hexagon':
        return (
          <div className={sizeClass} style={{ color: shapeColor }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9z" />
            </svg>
          </div>
        );
      default:
        return <div className={`${sizeClass} bg-gray-500 rounded`} />;
    }
  };

  return <div className="flex items-center justify-center">{renderShape()}</div>;
};

export default function BrainTeaserDisplay({ puzzle, onAnswer, feedback }) {
  if (!puzzle) return null;

  const renderMatchShapePuzzle = () => (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-6">{puzzle.question}</h3>
        <div className="bg-purple-600/20 border-2 border-purple-500/50 rounded-2xl p-8 inline-block">
          <ShapeRenderer shape={puzzle.target.shape} color={puzzle.target.color} size="large" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {puzzle.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswer(index)}
            disabled={!!feedback}
            className="bg-gray-700/50 hover:bg-gray-600/70 border-2 border-gray-600 hover:border-purple-500 rounded-xl p-6 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShapeRenderer shape={option.shape} color={option.color} size="medium" />
          </button>
        ))}
      </div>
    </div>
  );

  const renderFindOddPuzzle = () => (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6 text-center">{puzzle.question}</h3>
      
      <div className="grid grid-cols-5 gap-4">
        {puzzle.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswer(index)}
            disabled={!!feedback}
            className="bg-gray-700/50 hover:bg-gray-600/70 border-2 border-gray-600 hover:border-purple-500 rounded-xl p-6 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShapeRenderer shape={option.shape} color={option.color} size="medium" />
          </button>
        ))}
      </div>
    </div>
  );

  const renderPatternPuzzle = () => (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6 text-center">{puzzle.question}</h3>
      
      {/* Pattern Display */}
      <div className="bg-purple-600/20 border-2 border-purple-500/50 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-center gap-6">
          {puzzle.pattern.map((shape, index) => (
            <div key={index}>
              <ShapeRenderer shape={shape} color="purple" size="medium" />
            </div>
          ))}
          <div className="text-4xl font-bold text-purple-400">?</div>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {puzzle.options.map((shape, index) => (
          <button
            key={index}
            onClick={() => onAnswer(index)}
            disabled={!!feedback}
            className="bg-gray-700/50 hover:bg-gray-600/70 border-2 border-gray-600 hover:border-purple-500 rounded-xl p-6 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShapeRenderer shape={shape} color="purple" size="medium" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-purple-500/30 shadow-2xl">
      {/* Puzzle Type Badge */}
      <div className="flex justify-center mb-6">
        <span className="bg-purple-600/30 text-purple-300 px-4 py-2 rounded-full text-sm font-bold border border-purple-500/50">
          {puzzle.type === 'match-shape' ? '🎯 Match Shape' : 
           puzzle.type === 'find-odd' ? '🔍 Find Odd One' : 
           '🧩 Pattern Test'}
        </span>
      </div>

      {/* Render appropriate puzzle */}
      {puzzle.type === 'match-shape' && renderMatchShapePuzzle()}
      {puzzle.type === 'find-odd' && renderFindOddPuzzle()}
      {puzzle.type === 'pattern' && renderPatternPuzzle()}

      {/* Feedback */}
      {feedback && (
        <div className={`mt-6 px-6 py-3 rounded-xl font-semibold text-center text-lg ${
          feedback.type === 'success' 
            ? 'bg-green-600/30 text-green-300 border-2 border-green-500/50' 
            : 'bg-red-600/30 text-red-300 border-2 border-red-500/50'
        }`}>
          {feedback.message}
        </div>
      )}
    </div>
  );
}
