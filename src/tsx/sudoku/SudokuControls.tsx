// Component for Sudoku game controls including number pad, difficulty selector, and action buttons
import React from 'react';
import type { SudokuControlsProps, SudokuDifficulty } from '../../types/games/sudoku';

export default function SudokuControls({
  difficulty,
  notesMode,
  isPaused,
  hintsUsed,
  maxHints,
  onNumberSelect,
  onClear,
  onHint,
  onNotesToggle,
  onDifficultyChange,
  onNewGame,
  onPause,
  onResume
}: SudokuControlsProps): JSX.Element {
  const numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  // Difficulty levels
  const difficultyLevels: Array<{ value: SudokuDifficulty, label: string, color: string }> = [
    { value: 'easy', label: 'Easy', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'hard', label: 'Hard', color: 'red' }
  ];

  // Render the component
  return (
    <div className="sudoku-controls">
      {/* Difficulty Selector */}
      <div className="control-section">
        <label className="control-label">Difficulty</label>
        <div className="difficulty-buttons">
          {difficultyLevels.map(level => (
            <button
              key={level.value}
              onClick={() => onDifficultyChange(level.value)}
              className={`difficulty-btn difficulty-${level.color} ${difficulty === level.value ? 'active' : ''
                }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Number Pad */}
      <div className="control-section">
        <label className="control-label">
          {notesMode ? 'Notes Mode - Select Numbers' : 'Select Number'}
        </label>
        <div className="number-pad">
          {numbers.map(num => (
            <button
              key={num}
              onClick={() => onNumberSelect(num)}
              className="number-btn"
              disabled={isPaused}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="control-section">
        <div className="action-buttons">
          <button
            onClick={onClear}
            className="action-btn clear-btn"
            disabled={isPaused}
            title="Clear selected cell"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>

          <button
            onClick={onNotesToggle}
            className={`action-btn notes-btn ${notesMode ? 'active' : ''}`}
            disabled={isPaused}
            title="Toggle notes mode"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Notes
          </button>

          <button
            onClick={onHint}
            className="action-btn hint-btn"
            disabled={isPaused || hintsUsed >= maxHints}
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
        <div className="game-controls">
          {isPaused ? (
            <button onClick={onResume} className="game-btn resume-btn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Resume
            </button>
          ) : (
            <button onClick={onPause} className="game-btn pause-btn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Pause
            </button>
          )}

          <button onClick={onNewGame} className="game-btn new-game-btn">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            New Game
          </button>
        </div>
      </div>

      <style jsx>{`
        .sudoku-controls {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
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

        .number-pad {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          min-width: 220px;
        }

        .number-btn {
          aspect-ratio: 1;
          min-height: 60px;
          background: rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
          border: 2px solid rgba(99, 102, 241, 0.3);
          border-radius: 8px;
          font-size: 24px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .number-btn:hover:not(:disabled) {
          background: rgba(99, 102, 241, 0.4);
          color: #c7d2fe;
          transform: scale(1.05);
        }

        .number-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
        }

        .clear-btn {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }

        .clear-btn:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.3);
        }

        .notes-btn {
          background: rgba(168, 85, 247, 0.2);
          color: #c4b5fd;
        }

        .notes-btn:hover:not(:disabled) {
          background: rgba(168, 85, 247, 0.3);
        }

        .notes-btn.active {
          background: #a855f7;
          color: white;
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

        .game-controls {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
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

        .pause-btn {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
        }

        .pause-btn:hover {
          background: rgba(245, 158, 11, 0.3);
        }

        .resume-btn {
          background: rgba(34, 197, 94, 0.2);
          color: #86efac;
        }

        .resume-btn:hover {
          background: rgba(34, 197, 94, 0.3);
        }

        .new-game-btn {
          background: rgba(59, 130, 246, 0.2);
          color: #93c5fd;
        }

        .new-game-btn:hover {
          background: rgba(59, 130, 246, 0.3);
        }

        @media (max-width: 768px) {
          .sudoku-controls {
            padding: 1rem;
          }

          .action-buttons {
            grid-template-columns: 1fr;
          }

          .game-controls {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
