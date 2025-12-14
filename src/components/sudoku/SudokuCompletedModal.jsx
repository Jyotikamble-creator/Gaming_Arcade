// Component to display a modal when Sudoku puzzle is completed
import React, { useEffect, useRef } from 'react';

// Exported SudokuCompletedModal component
export default function SudokuCompletedModal({
  isOpen,
  score,
  time,
  difficulty,
  mistakes,
  hintsUsed,
  onClose,
  onNewGame
}) {
  const modalRef = useRef(null);

  // Focus the modal when it's opened
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Helper function to format time in mm:ss
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  // Difficulty configuration
  const difficultyConfig = {
    easy: { color: 'green', label: 'Easy', emoji: '😊' },
    medium: { color: 'yellow', label: 'Medium', emoji: '🤔' },
    hard: { color: 'red', label: 'Hard', emoji: '😤' }
  };

  const config = difficultyConfig[difficulty] || difficultyConfig.easy;

  // Performance rating based on score
  const getRating = () => {
    if (score >= 900) return { stars: 5, label: 'Perfect!', color: '#fbbf24' };
    if (score >= 750) return { stars: 4, label: 'Excellent!', color: '#a78bfa' };
    if (score >= 600) return { stars: 3, label: 'Great!', color: '#60a5fa' };
    if (score >= 450) return { stars: 2, label: 'Good!', color: '#34d399' };
    return { stars: 1, label: 'Completed!', color: '#94a3b8' };
  };

  const rating = getRating();

  // Render the modal
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
      >
        {/* Confetti Animation */}
        <div className="confetti-container">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: ['#fbbf24', '#a78bfa', '#60a5fa', '#34d399', '#f87171'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>

        {/* Trophy Icon */}
        <div className="trophy-icon">
          <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="modal-title">Puzzle Solved!</h2>

        {/* Rating Stars */}
        <div className="rating-container">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`star ${i < rating.stars ? 'filled' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="rating-label" style={{ color: rating.color }}>{rating.label}</p>
        </div>

        {/* Score Display */}
        <div className="score-display">
          <div className="score-label">Final Score</div>
          <div className="score-value">{score}</div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className={`stat-item difficulty-${config.color}`}>
            <div className="stat-emoji">{config.emoji}</div>
            <div className="stat-name">Difficulty</div>
            <div className="stat-number">{config.label}</div>
          </div>

          <div className="stat-item">
            <svg className="stat-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="stat-name">Time</div>
            <div className="stat-number">{formatTime(time)}</div>
          </div>

          <div className="stat-item">
            <svg className="stat-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="stat-name">Mistakes</div>
            <div className="stat-number">{mistakes}</div>
          </div>

          <div className="stat-item">
            <svg className="stat-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div className="stat-name">Hints</div>
            <div className="stat-number">{hintsUsed}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="modal-actions">
          <button onClick={onNewGame} className="btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            New Game
          </button>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
            animation: fadeIn 0.3s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .modal-content {
            position: relative;
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-radius: 24px;
            padding: 3rem 2rem;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
            animation: slideUp 0.4s ease;
            outline: none;
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .confetti-container {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            overflow: hidden;
            border-radius: 24px;
          }

          .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            top: -10px;
            animation: fall 3s linear infinite;
          }

          @keyframes fall {
            to {
              transform: translateY(600px) rotate(360deg);
            }
          }

          .trophy-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 10px 25px rgba(251, 191, 36, 0.3);
            animation: bounce 1s ease infinite;
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          .modal-title {
            font-size: 32px;
            font-weight: 700;
            color: white;
            text-align: center;
            margin-bottom: 1.5rem;
          }

          .rating-container {
            text-align: center;
            margin-bottom: 2rem;
          }

          .stars {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
            margin-bottom: 0.5rem;
          }

          .star {
            width: 32px;
            height: 32px;
            color: #334155;
            transition: all 0.3s;
          }

          .star.filled {
            color: #fbbf24;
            filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
            animation: starPop 0.5s ease backwards;
          }

          .star.filled:nth-child(1) { animation-delay: 0.1s; }
          .star.filled:nth-child(2) { animation-delay: 0.2s; }
          .star.filled:nth-child(3) { animation-delay: 0.3s; }
          .star.filled:nth-child(4) { animation-delay: 0.4s; }
          .star.filled:nth-child(5) { animation-delay: 0.5s; }

          @keyframes starPop {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          .rating-label {
            font-size: 20px;
            font-weight: 700;
          }

          .score-display {
            text-align: center;
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            margin-bottom: 1.5rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .score-label {
            font-size: 14px;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 0.5rem;
          }

          .score-value {
            font-size: 48px;
            font-weight: 700;
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .stat-item {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 1rem;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .stat-emoji {
            font-size: 32px;
            margin-bottom: 0.5rem;
          }

          .stat-svg {
            width: 32px;
            height: 32px;
            margin: 0 auto 0.5rem;
            color: #94a3b8;
          }

          .difficulty-green .stat-emoji,
          .difficulty-green .stat-svg {
            color: #48bb78;
          }

          .difficulty-yellow .stat-emoji,
          .difficulty-yellow .stat-svg {
            color: #ed8936;
          }

          .difficulty-red .stat-emoji,
          .difficulty-red .stat-svg {
            color: #f56565;
          }

          .stat-name {
            font-size: 12px;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.25rem;
          }

          .stat-number {
            font-size: 24px;
            font-weight: 700;
            color: #e2e8f0;
          }

          .modal-actions {
            display: flex;
            gap: 1rem;
          }

          .btn-primary,
          .btn-secondary {
            flex: 1;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }

          .btn-primary {
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
          }

          .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: #e2e8f0;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.15);
          }

          @media (max-width: 640px) {
            .modal-content {
              padding: 2rem 1.5rem;
            }

            .modal-title {
              font-size: 24px;
            }

            .score-value {
              font-size: 36px;
            }

            .stats-grid {
              grid-template-columns: 1fr;
            }

            .modal-actions {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
