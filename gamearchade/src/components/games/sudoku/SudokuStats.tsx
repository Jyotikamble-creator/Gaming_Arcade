// Component to display Sudoku game statistics including difficulty, time, mistakes, and hints used
import React from 'react';
import type { SudokuStatsProps, SudokuDifficulty } from '@/types/games/sudoku';

const SudokuStats: React.FC<SudokuStatsProps> = ({
  difficulty,
  time,
  mistakes,
  hintsUsed,
  maxHints,
  maxMistakes = 3
}) => {
  // Helper function to format time in mm:ss
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Difficulty configuration
  const difficultyConfig: Record<SudokuDifficulty, { color: string, label: string, emoji: string }> = {
    easy: { color: 'green', label: 'Easy', emoji: 'ðŸ˜Š' },
    medium: { color: 'yellow', label: 'Medium', emoji: 'ðŸ¤”' },
    hard: { color: 'red', label: 'Hard', emoji: 'ðŸ˜¤' }
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
          gap: 1.25rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s;
        }

        .stat-card:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%);
          transform: translateY(-3px);
          border-color: rgba(255, 255, 255, 0.25);
          box-shadow: 0 12px 24px -8px rgba(139, 92, 246, 0.15);
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 14px;
          font-size: 32px;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }

        .stat-icon::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 14px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        .difficulty-card .stat-icon {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(99, 102, 241, 0.15) 100%);
        }

        .difficulty-green .stat-icon {
          background: linear-gradient(135deg, rgba(72, 187, 120, 0.3) 0%, rgba(52, 211, 153, 0.15) 100%);
        }

        .difficulty-yellow .stat-icon {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.15) 100%);
        }

        .difficulty-red .stat-icon {
          background: linear-gradient(135deg, rgba(245, 101, 101, 0.3) 0%, rgba(239, 68, 68, 0.15) 100%);
        }

        .timer-card .stat-icon {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.15) 100%);
          color: #60a5fa;
        }

        .mistakes-card .stat-icon {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.15) 100%);
          color: #f87171;
        }

        .hints-card .stat-icon {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(217, 119, 6, 0.15) 100%);
          color: #fcd34d;
        }

        .stat-content {
          flex: 1;
          min-width: 0;
        }

        .stat-label {
          font-size: 11px;
          font-weight: 700;
          color: #cbd5e1;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.4rem;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .stat-value {
          font-size: 28px;
          font-weight: 800;
          color: #f1f5f9;
          line-height: 1;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .timer-value {
          font-family: 'Courier New', monospace;
          color: #60a5fa;
          font-weight: 800;
        }

        .stat-max {
          font-size: 14px;
          color: #94a3b8;
          font-weight: 600;
          margin-left: 0.25rem;
        }

        .text-error {
          color: #f87171;
        }

        .text-warning {
          color: #fcd34d;
        }

        .mistakes-dots {
          display: flex;
          gap: 0.4rem;
          margin-top: 0.6rem;
        }

        .mistake-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.2);
          border: 1.5px solid rgba(239, 68, 68, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .mistake-dot.filled {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-color: #b91c1c;
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        .hints-progress {
          width: 100%;
          height: 6px;
          background: rgba(251, 191, 36, 0.15);
          border-radius: 3px;
          margin-top: 0.6rem;
          overflow: hidden;
          border: 1px solid rgba(251, 191, 36, 0.2);
        }

        .hints-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #fbbf24, #f59e0b, #f97316);
          border-radius: 3px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 8px rgba(251, 191, 36, 0.4);
        }

        @media (max-width: 768px) {
          .sudoku-stats {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .stat-card {
            padding: 1rem;
          }

          .stat-icon {
            width: 52px;
            height: 52px;
            font-size: 26px;
          }

          .stat-value {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default SudokuStats;
