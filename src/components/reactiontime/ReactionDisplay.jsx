import React from 'react';

export default function ReactionDisplay({ 
  gameState, 
  tooEarly, 
  currentRound, 
  totalRounds, 
  reactionTimes,
  onStartRound,
  onClick 
}) {
  const getBackgroundColor = () => {
    if (tooEarly) return 'from-red-600 to-red-800';
    if (gameState === 'ready') return 'from-green-500 to-green-700';
    if (gameState === 'clicked') return 'from-blue-600 to-blue-800';
    return 'from-gray-700 to-gray-900';
  };

  const getMessage = () => {
    if (tooEarly) {
      return {
        title: '❌ Too Early!',
        subtitle: 'Wait for the green screen',
        icon: '⏸️'
      };
    }
    
    if (gameState === 'waiting') {
      return {
        title: 'Wait...',
        subtitle: 'Get ready to click',
        icon: '⏳'
      };
    }
    
    if (gameState === 'ready') {
      return {
        title: 'CLICK NOW!',
        subtitle: 'As fast as you can!',
        icon: '⚡'
      };
    }
    
    if (gameState === 'clicked') {
      const lastTime = reactionTimes[reactionTimes.length - 1];
      return {
        title: `${lastTime}ms`,
        subtitle: getRatingText(lastTime),
        icon: getRatingEmoji(lastTime)
      };
    }
    
    // ready-to-start or idle state
    return {
      title: `Round ${currentRound + 1}/${totalRounds}`,
      subtitle: 'Click to start',
      icon: '👆'
    };
  };

  const getRatingText = (time) => {
    if (time < 200) return 'Incredible!';
    if (time < 250) return 'Excellent!';
    if (time < 300) return 'Great!';
    if (time < 350) return 'Good!';
    if (time < 400) return 'Not bad!';
    return 'Keep trying!';
  };

  const getRatingEmoji = (time) => {
    if (time < 200) return '🏆';
    if (time < 250) return '⭐';
    if (time < 300) return '👍';
    if (time < 350) return '👌';
    if (time < 400) return '😊';
    return '💪';
  };

  const message = getMessage();

  const handleClick = () => {
    if (gameState === 'idle' || gameState === 'ready-to-start') {
      onStartRound();
    } else {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`max-w-4xl mx-auto bg-gradient-to-br ${getBackgroundColor()} rounded-3xl p-12 mb-6 border-4 ${
        gameState === 'ready' ? 'border-green-300 animate-pulse' : 
        tooEarly ? 'border-red-300' :
        'border-gray-600'
      } shadow-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] min-h-[400px] flex flex-col items-center justify-center`}
      style={{ userSelect: 'none' }}
    >
      <div className="text-center">
        {/* Icon */}
        <div className="text-8xl mb-6 animate-bounce">
          {message.icon}
        </div>
        
        {/* Title */}
        <h2 className="text-6xl font-bold text-white mb-4">
          {message.title}
        </h2>
        
        {/* Subtitle */}
        <p className="text-2xl text-white/90 font-medium">
          {message.subtitle}
        </p>

        {/* Instruction hint */}
        {gameState === 'idle' && (
          <div className="mt-8 text-lg text-white/70">
            Click anywhere to start round {currentRound + 1}
          </div>
        )}
      </div>
    </div>
  );
}
