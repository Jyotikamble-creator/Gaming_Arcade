// Component for Sudoku game controls including number pad, difficulty selector, and action buttons
import React from 'react';
import type { SudokuControlsProps, SudokuDifficulty } from '@/types/games/sudoku';

const SudokuControls: React.FC<SudokuControlsProps> = ({
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
}) => {
  const numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  // Difficulty levels - includes all 4 difficulties
  const difficultyLevels: Array<{ value: SudokuDifficulty, label: string, color: string }> = [
    { value: 'easy', label: 'Easy', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'hard', label: 'Hard', color: 'red' },
    { value: 'expert', label: 'Expert', color: 'purple' }
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
          gap: 1.75rem;
          padding: 1.75rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .control-section {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }

        .control-label {
          font-size: 11px;
          font-weight: 700;
          color: #cbd5e1;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .difficulty-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 0.6rem;
        }

        .difficulty-btn {
          padding: 0.7rem 1rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid transparent;
          cursor: pointer;
          text-transform: capitalize;
          position: relative;
          overflow: hidden;
        }

        .difficulty-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.1);
          transition: left 0.3s;
          z-index: -1;
        }

        .difficulty-btn:hover::before {
          left: 0;
        }

        .difficulty-green {
          background: rgba(72, 187, 120, 0.2);
          color: #86efac;
          border-color: rgba(72, 187, 120, 0.3);
        }

        .difficulty-green:hover {
          background: rgba(72, 187, 120, 0.35);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(72, 187, 120, 0.2);
        }

        .difficulty-green.active {
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
          color: white;
          border-color: #2f8659;
          box-shadow: 0 8px 20px rgba(72, 187, 120, 0.3);
        }

        .difficulty-yellow {
          background: rgba(251, 191, 36, 0.2);
          color: #fcd34d;
          border-color: rgba(251, 191, 36, 0.3);
        }

        .difficulty-yellow:hover {
          background: rgba(251, 191, 36, 0.35);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
        }

        .difficulty-yellow.active {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: white;
          border-color: #d97706;
          box-shadow: 0 8px 20px rgba(251, 191, 36, 0.3);
        }

        .difficulty-red {
          background: rgba(245, 101, 101, 0.2);
          color: #fca5a5;
          border-color: rgba(245, 101, 101, 0.3);
        }

        .difficulty-red:hover {
          background: rgba(245, 101, 101, 0.35);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 101, 101, 0.2);
        }

        .difficulty-red.active {
          background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
          color: white;
          border-color: #c53030;
          box-shadow: 0 8px 20px rgba(245, 101, 101, 0.3);
        }

        .difficulty-purple {
          background: rgba(168, 85, 247, 0.2);
          color: #d8b4fe;
          border-color: rgba(168, 85, 247, 0.3);
        }

        .difficulty-purple:hover {
          background: rgba(168, 85, 247, 0.35);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.2);
        }

        .difficulty-purple.active {
          background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
          color: white;
          border-color: #7e22ce;
          box-shadow: 0 8px 20px rgba(168, 85, 247, 0.3);
        }

        .number-pad {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.8rem;
          min-width: 220px;
        }

        .number-btn {
          aspect-ratio: 1;
          min-height: 65px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(79, 70, 229, 0.15) 100%);
          color: #c7d2fe;
          border: 2px solid rgba(99, 102, 241, 0.5);
          border-radius: 12px;
          font-size: 24px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        }

        .number-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(255, 255, 255, 0.3), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .number-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.4) 0%, rgba(79, 70, 229, 0.25) 100%);
          color: #e0e7ff;
          transform: translateY(-3px) scale(1.05);
          border-color: rgba(99, 102, 241, 0.7);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }

        .number-btn::before:hover {
          opacity: 1;
        }

        .number-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.6rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.8rem 0.75rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 12px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          border: none;
          position: relative;
          overflow: hidden;
        }

        .clear-btn {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.15) 100%);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.4);
        }

        .clear-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.4) 0%, rgba(220, 38, 38, 0.25) 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }

        .notes-btn {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(147, 51, 234, 0.15) 100%);
          color: #d8b4fe;
          border: 1px solid rgba(168, 85, 247, 0.4);
        }

        .notes-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(147, 51, 234, 0.25) 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.2);
        }

        .notes-btn.active {
          background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
          color: white;
          border-color: #7e22ce;
          box-shadow: 0 6px 16px rgba(168, 85, 247, 0.3);
        }

        .hint-btn {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.15) 100%);
          color: #fde047;
          border: 1px solid rgba(251, 191, 36, 0.4);
        }

        .hint-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.4) 0%, rgba(245, 158, 11, 0.25) 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .game-controls {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.6rem;
        }

        .game-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 0.85rem 1rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          border: none;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .pause-btn {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(217, 119, 6, 0.2) 100%);
          color: #fcd34d;
          border: 1px solid rgba(245, 158, 11, 0.4);
        }

        .pause-btn:hover {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.45) 0%, rgba(217, 119, 6, 0.3) 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.25);
        }

        .resume-btn {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(5, 150, 105, 0.2) 100%);
          color: #86efac;
          border: 1px solid rgba(34, 197, 94, 0.4);
        }

        .resume-btn:hover {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.45) 0%, rgba(5, 150, 105, 0.3) 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(34, 197, 94, 0.25);
        }

        .new-game-btn {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.2) 100%);
          color: #93c5fd;
          border: 1px solid rgba(59, 130, 246, 0.4);
        }

        .new-game-btn:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.45) 0%, rgba(37, 99, 235, 0.3) 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
        }

        @media (max-width: 1024px) {
          .sudoku-controls {
            gap: 1.5rem;
            padding: 1.5rem;
          }

          .difficulty-buttons {
            grid-template-columns: repeat(2, 1fr);
          }

          .number-btn {
            min-height: 55px;
            font-size: 20px;
          }

          .action-buttons {
            grid-template-columns: 1fr;
          }

          .game-controls {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .sudoku-controls {
            padding: 1.25rem;
            gap: 1.25rem;
          }

          .difficulty-buttons {
            grid-template-columns: repeat(2, 1fr);
          }

          .action-buttons {
            grid-template-columns: 1fr;
          }

          .game-controls {
            grid-template-columns: 1fr;
          }

          .number-btn {
            min-height: 50px;
            font-size: 18px;
          }

          .action-btn {
            padding: 0.7rem 0.6rem;
            font-size: 11px;
          }

          .game-btn {
            padding: 0.75rem 0.8rem;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .sudoku-controls {
            padding: 1rem;
            gap: 1rem;
          }

          .difficulty-buttons {
            grid-template-columns: 1fr;
          }

          .number-pad {
            gap: 0.6rem;
          }

          .number-btn {
            min-height: 45px;
            font-size: 16px;
          }

          .action-btn {
            padding: 0.6rem 0.5rem;
            font-size: 10px;
          }

          .game-btn {
            padding: 0.65rem 0.6rem;
            font-size: 11px;
          }

          .action-btn svg,
          .game-btn svg {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default SudokuControls;
