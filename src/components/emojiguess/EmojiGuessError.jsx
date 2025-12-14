// A React component that displays an error message when the Emoji Guess puzzle fails to load,
import AnimatedBackground from '../AnimatedBackground';

// including a "Try Again" button to retry loading the puzzle.
export default function EmojiGuessError({ message, onRetry }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <AnimatedBackground />
      <div className="bg-card-bg/90 backdrop-blur-sm rounded-xl p-8 border border-gray-700 max-w-md w-full text-center relative z-10 shadow-2xl">
        <div className="text-red-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-light-text mb-2">Failed to Load Puzzle</h2>
        <p className="text-subtle-text mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}