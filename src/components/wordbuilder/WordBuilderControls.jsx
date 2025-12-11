import React from 'react';

export default function WordBuilderControls({ 
  onSubmit,
  onClear,
  onShuffle,
  onHint,
  onNewGame,
  onDifficultyChange,
  difficulty,
  isCompleted,
  canSubmit,
  hintsUsed,
  maxHints
}) {
  const difficultyLevels = [
    { value: 'easy', label: 'Easy', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'hard', label: 'Hard', color: 'red' }
  ];

  return (
    <div className="word-builder-controls">
      {/* Difficulty Selector */}
      <div className="control-section">
        <label className="control-label">Difficulty</label>
        <div className="difficulty-buttons">
          {difficultyLevels.map(level => (
            <button
              key={level.value}
              onClick={() => onDifficultyChange(level.value)}
              className={`difficulty-btn difficulty-${level.color} ${
                difficulty === level.value ? 'active' : ''
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="control-section">
        <label className="control-label">Actions</label>
        <div className="action-buttons">
          <button
            onClick={onSubmit}
            disabled={!canSubmit || isCompleted}
            className="action-btn submit-btn"
            title="Submit word"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Submit
          </button>

          <button
            onClick={onClear}
            disabled={isCompleted}
            className="action-btn clear-btn"
            title="Clear current word"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>

          <button
            onClick={onShuffle}
            disabled={isCompleted}
            className="action-btn shuffle-btn"
            title="Shuffle letters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Shuffle
          </button>

          <button
            onClick={onHint}
            disabled={isCompleted || hintsUsed >= maxHints}
            className="action-btn hint-btn"
            title={`Get hint (${hintsUsed}/${maxHints} used)`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Hint ({hintsUsed}/{maxHints})
          </button>
        </div>
      </div>

      {/* Game Controls */}
      <div className="control-section">
        <label className="control-label">Game</label>
        <button onClick={onNewGame} className="game-btn new-game-btn">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          New Game
        </button>
      </div>

      <style jsx>{`
        .word-builder-controls {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          min-width: 280px;
        }

        .control-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .control-label {
          font-size: 14px;
          font-weight: 600;
          color: #e2e8f0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .difficulty-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .difficulty-btn {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
          border: 2px solid transparent;
          cursor: pointer;
        }

        .difficulty-green {
          background: rgba(72, 187, 120, 0.2);
          color: #68d391;
        }

        .difficulty-green:hover {
          background: rgba(72, 187, 120, 0.3);
        }

        .difficulty-green.active {
          background: #48bb78;
          color: white;
          border-color: #38a169;
        }

        .difficulty-yellow {
          background: rgba(237, 137, 54, 0.2);
          color: #ecc94b;
        }

        .difficulty-yellow:hover {
          background: rgba(237, 137, 54, 0.3);
        }

        .difficulty-yellow.active {
          background: #ed8936;
          color: white;
          border-color: #dd6b20;
        }

        .difficulty-red {
          background: rgba(245, 101, 101, 0.2);
          color: #fc8181;
        }

        .difficulty-red:hover {
          background: rgba(245, 101, 101, 0.3);
        }

        .difficulty-red.active {
          background: #f56565;
          color: white;
          border-color: #e53e3e;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
        }

        .submit-btn {
          background: rgba(34, 197, 94, 0.2);
          color: #86efac;
        }

        .submit-btn:hover:not(:disabled) {
          background: rgba(34, 197, 94, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .clear-btn {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }

        .clear-btn:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.3);
        }

        .shuffle-btn {
          background: rgba(168, 85, 247, 0.2);
          color: #c4b5fd;
        }

        .shuffle-btn:hover:not(:disabled) {
          background: rgba(168, 85, 247, 0.3);
        }

        .hint-btn {
          background: rgba(251, 191, 36, 0.2);
          color: #fcd34d;
        }

        .hint-btn:hover:not(:disabled) {
          background: rgba(251, 191, 36, 0.3);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .game-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
        }

        .new-game-btn {
          background: rgba(59, 130, 246, 0.2);
          color: #93c5fd;
        }

        .new-game-btn:hover {
          background: rgba(59, 130, 246, 0.3);
        }

        @media (max-width: 768px) {
          .word-builder-controls {
            min-width: 100%;
            padding: 1rem;
          }

          .action-buttons {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
