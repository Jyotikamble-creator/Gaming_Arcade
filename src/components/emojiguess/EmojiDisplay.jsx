// A React component that displays emojis along with their category and difficulty level.
// It provides a visual representation for the Emoji Guess game.
const EmojiDisplay = ({ emojis, category, difficulty }) => {
  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'easy': return 'bg-green-600';
      case 'medium': return 'bg-yellow-600';
      case 'hard': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  // Render the emoji display card with category and difficulty badges.
  return (
    <div className="bg-card-bg rounded-lg p-8 border border-gray-700 mb-6">
      <div className="text-center">
        <div className="flex justify-center gap-3 mb-4">
          <span className="inline-block bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            {category || 'General'}
          </span>
          <span className={`inline-block text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${getDifficultyColor(difficulty)}`}>
            {difficulty || 'Medium'}
          </span>
        </div>
        <div className="text-6xl md:text-7xl mb-4 animate-pulse">
          {emojis}
        </div>
        <p className="text-subtle-text text-sm">
          What do these emojis represent?
        </p>
      </div>
    </div>
  );
};

export default EmojiDisplay;