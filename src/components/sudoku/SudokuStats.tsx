// Component to display Sudoku game statistics including difficulty, time, mistakes, and hints used
import React from 'react';
import type { SudokuStatsProps, SudokuDifficulty } from '../../types/games/sudoku';

export default function SudokuStats({
  difficulty,
  time,
  mistakes,
  hintsUsed,
  maxHints,
  maxMistakes = 3
}: SudokuStatsProps): JSX.Element {
  // Helper function to format time in mm:ss
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Difficulty configuration
  const difficultyConfig: Record<SudokuDifficulty, { color: string, label: string, emoji: string }> = {
    easy: { color: 'green', label: 'Easy', emoji: '😊' },
    medium: { color: 'yellow', label: 'Medium', emoji: '🤔' },
    hard: { color: 'red', label: 'Hard', emoji: '😤' }
  };

  const config = difficultyConfig[difficulty] || difficultyConfig.easy;

  // Render the Sudoku statistics component
  return (
    <div className="sudoku-stats">
      {/* Difficulty Badge */}
      <div className={`stat-card difficulty-card difficulty-${config.color}`}>
        <div className="stat-icon">{config.emoji}</div>
        <div className="stat-content">
          <div className="stat-label">Difficulty</div>
          <div className="stat-value">{config.label}</div>
        </div>
      </div>

      {/* Timer */}
      <div className="stat-card timer-card">
        <div className="stat-icon">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="stat-content">
          <div className="stat-label">Time</div>
          <div className="stat-value timer-value">{formatTime(time)}</div>
        </div>
      </div>

      {/* Mistakes */}
      <div className="stat-card mistakes-card">
        <div className="stat-icon">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="stat-content">
          <div className="stat-label">Mistakes</div>
          <div className="stat-value">
            <span className={mistakes >= maxMistakes ? 'text-error' : ''}>{mistakes}</span>
            <span className="stat-max">/{maxMistakes}</span>
          </div>
          <div className="mistakes-dots">
            {[...Array(maxMistakes)].map((_, i) => (
              <div
                key={i}
                className={`mistake-dot ${i < mistakes ? 'filled' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Hints */}
      <div className="stat-card hints-card">
        <div className="stat-icon">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="stat-content">
          <div className="stat-label">Hints Used</div>
          <div className="stat-value">
            <span className={hintsUsed >= maxHints ? 'text-warning' : ''}>{hintsUsed}</span>
            <span className="stat-max">/{maxHints}</span>
          </div>
          <div className="hints-progress">
            <div
              className="hints-progress-bar"
              style={{ width: `${(hintsUsed / maxHints) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .sudoku-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s;
        }

        .stat-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-2px);
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 10px;
          font-size: 24px;
          flex-shrink: 0;
        }

        .difficulty-card .stat-icon {
          background: rgba(255, 255, 255, 0.1);
        }

        .difficulty-green .stat-icon {
          background: rgba(72, 187, 120, 0.2);
        }

        .difficulty-yellow .stat-icon {
          background: rgba(237, 137, 54, 0.2);
        }

        .difficulty-red .stat-icon {
          background: rgba(245, 101, 101, 0.2);
        }

        .timer-card .stat-icon {
          background: rgba(59, 130, 246, 0.2);
          color: #93c5fd;
        }

        .mistakes-card .stat-icon {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }

        .hints-card .stat-icon {
          background: rgba(251, 191, 36, 0.2);
          color: #fcd34d;
        }

        .stat-content {
          flex: 1;
          min-width: 0;
        }

        .stat-label {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #e2e8f0;
          line-height: 1;
        }

        .timer-value {
          font-family: 'Courier New', monospace;
          color: #93c5fd;
        }

        .stat-max {
          font-size: 16px;
          color: #64748b;
          font-weight: 500;
        }

        .text-error {
          color: #fca5a5;
        }

        .text-warning {
          color: #fcd34d;
        }

        .mistakes-dots {
          display: flex;
          gap: 0.25rem;
          margin-top: 0.5rem;
        }

        .mistake-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.3);
          border: 1px solid rgba(239, 68, 68, 0.5);
          transition: all 0.3s;
        }

        .mistake-dot.filled {
          background: #ef4444;
          border-color: #dc2626;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
        }

        .hints-progress {
          width: 100%;
          height: 4px;
          background: rgba(251, 191, 36, 0.2);
          border-radius: 2px;
          margin-top: 0.5rem;
          overflow: hidden;
        }

        .hints-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #fbbf24, #f59e0b);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        @media (max-width: 768px) {
          .sudoku-stats {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 0.75rem;
          }

          .stat-icon {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }

          .stat-value {
            font-size: 20px;
          }

          .stat-max {
            font-size: 14px;
          }
        }

        @media (min-width: 1024px) {
          .sudoku-stats {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
