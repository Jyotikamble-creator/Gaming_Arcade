// This component displays the statistics for the Word Builder game mode, including difficulty, timer, words found, and score.
export default function WordBuilderStats({
  difficulty,
  time,
  wordsFound,
  totalWords,
  minWords,
  score,
  hintsUsed
}) {
  // Helper function to format time in mm:ss
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Difficulty configuration
  const difficultyConfig = {
    easy: { color: 'green', label: 'Easy', emoji: '😊' },
    medium: { color: 'yellow', label: 'Medium', emoji: '🤔' },
    hard: { color: 'red', label: 'Hard', emoji: '😤' }
  };

  // Calculate progress
  const config = difficultyConfig[difficulty] || difficultyConfig.easy;
  const progress = (wordsFound / minWords) * 100;

  // Render the Word Builder statistics
  return (
    <div className="word-builder-stats">
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

      {/* Words Found */}
      <div className="stat-card words-card">
        <div className="stat-icon">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="stat-content">
          <div className="stat-label">Words Found</div>
          <div className="stat-value">
            <span className={wordsFound >= minWords ? 'text-success' : ''}>{wordsFound}</span>
            <span className="stat-max">/{totalWords}</span>
          </div>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${Math.min(progress, 100)}%` }}></div>
          </div>
          <div className="stat-hint">Need {minWords} to complete</div>
        </div>
      </div>

      {/* Score */}
      <div className="stat-card score-card">
        <div className="stat-icon">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <div className="stat-content">
          <div className="stat-label">Score</div>
          <div className="stat-value score-value">{score}</div>
        </div>
      </div>

      <style jsx>{`
        .word-builder-stats {
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

        .words-card .stat-icon {
          background: rgba(168, 85, 247, 0.2);
          color: #c4b5fd;
        }

        .score-card .stat-icon {
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

        .score-value {
          color: #fcd34d;
        }

        .stat-max {
          font-size: 16px;
          color: #64748b;
          font-weight: 500;
        }

        .text-success {
          color: #86efac;
        }

        .progress-container {
          width: 100%;
          height: 6px;
          background: rgba(168, 85, 247, 0.2);
          border-radius: 3px;
          margin-top: 0.5rem;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #a855f7, #c084fc);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .stat-hint {
          font-size: 11px;
          color: #64748b;
          margin-top: 0.25rem;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .word-builder-stats {
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
          .word-builder-stats {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
