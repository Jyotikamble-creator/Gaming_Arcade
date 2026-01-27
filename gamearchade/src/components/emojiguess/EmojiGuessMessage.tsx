import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type MessageType = 'success' | 'error' | 'info' | '';

interface EmojiGuessMessageProps {
  message: string;
  messageType: MessageType;
}

export default function EmojiGuessMessage({ message, messageType }: EmojiGuessMessageProps) {
  if (!message) return null;

  const getMessageStyles = () => {
    switch (messageType) {
      case 'success':
        return 'bg-green-500/20 border-green-500/50 text-green-200';
      case 'error':
        return 'bg-red-500/20 border-red-500/50 text-red-200';
      case 'info':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-200';
      default:
        return 'bg-white/20 border-white/50 text-white';
    }
  };

  return (
    <div className="max-w-md mx-auto mb-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          className={`rounded-xl p-4 text-center font-medium border ${
            getMessageStyles()
          }`}
        >
          {message}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}