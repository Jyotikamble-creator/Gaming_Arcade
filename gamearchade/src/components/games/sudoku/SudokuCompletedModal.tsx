// Component to display a modal when Sudoku puzzle is completed
import React, { useEffect, useRef } from 'react';
import type { SudokuCompletedModalProps, SudokuDifficulty } from '@/types/games/sudoku';

// Exported SudokuCompletedModal component
const SudokuCompletedModal: React.FC<SudokuCompletedModalProps> = ({
  isOpen,
  score,
  time,
  difficulty,
  mistakes,
  hintsUsed,
  onClose,
  onNewGame
}) => {
  const modalRef = useRef(null);

  // Focus the modal when it's opened
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Helper function to format time in mm:ss
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  // Difficulty configuration
  const difficultyConfig: Record<SudokuDifficulty, { color: string, label: string, emoji: string }> = {
    easy: { color: 'green', label: 'Easy', emoji: 'ðŸ˜Š' },
    medium: { color: 'yellow', label: 'Medium', emoji: 'ðŸ¤”' },
    hard: { color: 'red', label: 'Hard', emoji: 'ðŸ˜¤' }
  };

  const config = difficultyConfig[difficulty] || difficultyConfig.easy;

  // Performance rating based on score
  const getRating = (): { stars: number, label: string, color: string } => {
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
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(12px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
            animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .modal-content {
            position: relative;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
            border-radius: 28px;
            padding: 3.5rem 2.5rem;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(139, 92, 246, 0.1);
            border: 1px solid rgba(139, 92, 246, 0.25);
            animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            outline: none;
            overflow: hidden;
          }

          .modal-content::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%);
            animation: rotate 8s linear infinite;
            pointer-events: none;
          }

          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
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
            border-radius: 28px;
            z-index: 0;
          }

          .confetti {
            position: absolute;
            width: 12px;
            height: 12px;
            top: -20px;
            border-radius: 50%;
            animation: fall 3s linear infinite;
          }

          @keyframes fall {
            to {
              transform: translateY(700px) rotate(400deg);
              opacity: 0;
            }
          }

          .trophy-icon {
            width: 100px;
            height: 100px;
            margin: 0 auto 2rem;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #f97316 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 15px 40px rgba(251, 191, 36, 0.4), inset 0 -2px 10px rgba(0, 0, 0, 0.2);
            animation: bounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
            position: relative;
            z-index: 1;
          }

          .trophy-icon::before {
            content: '';
            position: absolute;
            inset: -4px;
            background: radial-gradient(circle, rgba(251, 191, 36, 0.3), transparent 70%);
            border-radius: 50%;
            animation: pulse 2s ease-in-out infinite;
          }

          @keyframes bounce {
            0% { transform: translateY(-30px) scale(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0) scale(1); }
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.15); opacity: 0.7; }
          }

          .modal-title {
            font-size: 36px;
            font-weight: 800;
            color: white;
            text-align: center;
            margin-bottom: 1.5rem;
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          .rating-container {
            text-align: center;
            margin-bottom: 2.5rem;
            position: relative;
            z-index: 1;
          }

          .stars {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            margin-bottom: 1rem;
          }

          .star {
            width: 40px;
            height: 40px;
            color: rgba(99, 102, 241, 0.2);
            transition: all 0.3s;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
          }

          .star.filled {
            color: #fbbf24;
            filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.8));
            animation: starPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
          }

          .star.filled:nth-child(1) { animation-delay: 0.1s; }
          .star.filled:nth-child(2) { animation-delay: 0.2s; }
          .star.filled:nth-child(3) { animation-delay: 0.3s; }
          .star.filled:nth-child(4) { animation-delay: 0.4s; }
          .star.filled:nth-child(5) { animation-delay: 0.5s; }

          @keyframes starPop {
            0% {
              transform: scale(0) rotate(-180deg);
              opacity: 0;
            }
            50% {
              transform: scale(1.3);
            }
            100% {
              transform: scale(1) rotate(0deg);
              opacity: 1;
            }
          }

          .rating-label {
            font-size: 22px;
            font-weight: 800;
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .score-display {
            text-align: center;
            padding: 2rem;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%);
            border-radius: 18px;
            margin-bottom: 2rem;
            border: 2px solid rgba(139, 92, 246, 0.3);
            position: relative;
            z-index: 1;
            box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15);
          }

          .score-label {
            font-size: 13px;
            font-weight: 700;
            color: #cbd5e1;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 0.75rem;
          }

          .score-value {
            font-size: 56px;
            font-weight: 900;
            background: linear-gradient(135deg, #fbbf24, #f59e0b, #f97316);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 2px 8px rgba(251, 191, 36, 0.2);
            line-height: 1;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
            margin-bottom: 2.5rem;
            position: relative;
            z-index: 1;
          }

          .stat-item {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
            border-radius: 16px;
            padding: 1.5rem;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.15);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(8px);
          }

          .stat-item:hover {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%);
            transform: translateY(-4px);
            border-color: rgba(255, 255, 255, 0.25);
            box-shadow: 0 8px 20px rgba(139, 92, 246, 0.15);
          }

          .stat-emoji {
            font-size: 40px;
            margin-bottom: 0.75rem;
            display: inline-block;
            animation: bounce 0.8s ease-in-out infinite;
          }

          .stat-svg {
            width: 36px;
            height: 36px;
            margin: 0 auto 0.75rem;
            color: #94a3b8;
            transition: all 0.3s;
          }

          .difficulty-green .stat-emoji,
          .difficulty-green .stat-svg {
            color: #86efac;
          }

          .difficulty-yellow .stat-emoji,
          .difficulty-yellow .stat-svg {
            color: #fcd34d;
          }

          .difficulty-red .stat-emoji,
          .difficulty-red .stat-svg {
            color: #fca5a5;
          }

          .stat-name {
            font-size: 11px;
            font-weight: 700;
            color: #cbd5e1;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 0.5rem;
          }

          .stat-number {
            font-size: 28px;
            font-weight: 800;
            color: #e2e8f0;
          }

          .modal-actions {
            display: flex;
            gap: 1rem;
            position: relative;
            z-index: 1;
          }

          .btn-primary,
          .btn-secondary {
            flex: 1;
            padding: 1.1rem 1.5rem;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            position: relative;
            overflow: hidden;
          }

          .btn-primary {
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 0%, #3730a3 100%);
            color: white;
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
          }

          .btn-primary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.2);
            transition: left 0.4s;
          }

          .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 32px rgba(99, 102, 241, 0.6);
          }

          .btn-primary:hover::before {
            left: 100%;
          }

          .btn-secondary {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
            color: #e2e8f0;
            border: 2px solid rgba(255, 255, 255, 0.2);
          }

          .btn-secondary:hover {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%);
            border-color: rgba(255, 255, 255, 0.35);
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(139, 92, 246, 0.15);
          }

          @media (max-width: 640px) {
            .modal-content {
              padding: 2.5rem 1.5rem;
            }

            .modal-title {
              font-size: 28px;
            }

            .score-value {
              font-size: 42px;
            }

            .stats-grid {
              grid-template-columns: 1fr;
              gap: 1rem;
            }

            .modal-actions {
              flex-direction: column;
            }

            .btn-primary,
            .btn-secondary {
              padding: 1rem 1.25rem;
              font-size: 14px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default SudokuCompletedModal;
