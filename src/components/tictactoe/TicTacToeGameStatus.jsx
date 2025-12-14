// TicTacToeGameStatus component to display the game status
export default function TicTacToeGameStatus({ winner }) {
  if (!winner) return null;
  // Render the game status
  return (
    <div className="text-center mb-6">
      <div className={`text-2xl font-bold ${winner === 'Draw' ? 'text-yellow-400' : winner === 'X' ? 'text-blue-400' : 'text-red-400'}`}>
        {winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`}
      </div>
    </div>
  );
}