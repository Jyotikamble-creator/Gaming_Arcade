// WordBuilderMessage component for displaying game messages
import React from 'react';
import { WordBuilderMessageProps } from '@/types/games/word-builder';

export default function WordBuilderMessage({
  message,
  messageType
}: WordBuilderMessageProps): JSX.Element {
  if (!message || !messageType) return <></>;

  const getMessageStyles = () => {
    switch (messageType) {
      case 'success':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'hint':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getMessageIcon = () => {
    switch (messageType) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'hint':
        return '💡';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`
      text-center mb-6 p-4 rounded-lg border transition-all duration-300 animate-pulse
      ${getMessageStyles()}
    `}>
      <p className="text-lg font-semibold flex items-center justify-center gap-2">
        <span>{getMessageIcon()}</span>
        {message}
      </p>
    </div>
  );
}