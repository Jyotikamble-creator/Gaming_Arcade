// Board component for Memory Card Game
import MemoryCard from './Card';
// Render the game board with memory cards
const Board = ({ cards, flipped, matched, onCardClick, disabled }) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="grid grid-cols-4 gap-4 max-w-lg">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => !disabled && onCardClick(card.id)}
            className="cursor-pointer"
          >
            <MemoryCard
              isFlipped={flipped.includes(card.id)}
              isMatched={matched.includes(card.id)}
              imageContent={card.value}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;