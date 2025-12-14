// Component to display a hint for the coding puzzle

export default function PuzzleHint({ hint }) {
  return (
    <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-2xl p-6 mb-6 border-2 border-yellow-500/40 shadow-2xl animate-pulse">
      <div className="flex items-start gap-4">
        <div className="text-4xl">💡</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-yellow-300 mb-2">Hint:</h3>
          <p className="text-white text-base leading-relaxed">{hint}</p>
        </div>
      </div>
      <div className="mt-3 text-yellow-400 text-sm text-center">
        ⚠️ Using hints reduces your bonus points
      </div>
    </div>
  );
}
