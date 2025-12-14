// This component renders the Word Builder game board, including available letters, current word, and found words.
export default function WordBuilderBoard({
  availableLetters,
  currentWord,
  foundWords,
  onLetterClick,
  onRemoveLetter
}) {
  // Render the Word Builder game board
  return (
    <div className="word-builder-board">
      {/* Current Word Display */}
      <div className="current-word-section">
        <label className="section-label">Your Word</label>
        <div className="current-word-display">
          {currentWord.length === 0 ? (
            <div className="empty-word-placeholder">
              Click letters below to form a word
            </div>
          ) : (
            <div className="word-letters">
              {currentWord.map((letterObj, index) => (
                <button
                  key={`${letterObj.id}-${index}`}
                  onClick={() => onRemoveLetter(index)}
                  className="current-letter"
                >
                  {letterObj.letter}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Available Letters */}
      <div className="available-letters-section">
        <label className="section-label">Available Letters</label>
        <div className="letter-tiles">
          {availableLetters.map((letterObj) => (
            <button
              key={letterObj.id}
              onClick={() => onLetterClick(letterObj.id)}
              disabled={letterObj.used}
              className={`letter-tile ${letterObj.used ? 'used' : ''}`}
            >
              {letterObj.letter}
            </button>
          ))}
        </div>
      </div>

      {/* Found Words */}
      <div className="found-words-section">
        <label className="section-label">
          Found Words ({foundWords.length})
        </label>
        <div className="found-words-grid">
          {foundWords.length === 0 ? (
            <p className="no-words-text">No words found yet</p>
          ) : (
            foundWords.map((word, index) => (
              <div key={index} className="found-word-chip">
                <svg className="check-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {word}
                <span className="word-score">+{word.length * 10 * (word.length >= 6 ? 2 : 1)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .word-builder-board {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          min-width: 400px;
          max-width: 500px;
        }

        .section-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        .current-word-section {
          background: rgba(255, 255, 255, 0.03);
          padding: 1.5rem;
          border-radius: 12px;
          border: 2px dashed rgba(255, 255, 255, 0.2);
        }

        .current-word-display {
          min-height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-word-placeholder {
          color: #64748b;
          font-size: 14px;
          font-style: italic;
        }

        .word-letters {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .current-letter {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 24px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);
        }

        .current-letter:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 12px rgba(99, 102, 241, 0.4);
        }

        .available-letters-section {
          background: rgba(255, 255, 255, 0.03);
          padding: 1.5rem;
          border-radius: 12px;
        }

        .letter-tiles {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
          gap: 0.75rem;
        }

        .letter-tile {
          aspect-ratio: 1;
          min-height: 60px;
          background: rgba(59, 130, 246, 0.2);
          color: #93c5fd;
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-radius: 10px;
          font-size: 28px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .letter-tile:hover:not(:disabled) {
          background: rgba(59, 130, 246, 0.4);
          transform: scale(1.1);
          border-color: rgba(59, 130, 246, 0.6);
        }

        .letter-tile.used {
          background: rgba(100, 116, 139, 0.2);
          color: #475569;
          border-color: rgba(100, 116, 139, 0.3);
          cursor: not-allowed;
          opacity: 0.5;
        }

        .found-words-section {
          background: rgba(255, 255, 255, 0.03);
          padding: 1.5rem;
          border-radius: 12px;
          max-height: 300px;
          overflow-y: auto;
        }

        .found-words-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .no-words-text {
          color: #64748b;
          font-size: 14px;
          font-style: italic;
          text-align: center;
          padding: 1rem;
        }

        .found-word-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(34, 197, 94, 0.2);
          color: #86efac;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .check-icon {
          width: 16px;
          height: 16px;
          color: #22c55e;
        }

        .word-score {
          color: #fbbf24;
          font-size: 12px;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .word-builder-board {
            min-width: 100%;
            padding: 1rem;
          }

          .letter-tiles {
            grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
            gap: 0.5rem;
          }

          .letter-tile {
            min-height: 50px;
            font-size: 24px;
          }

          .current-letter {
            width: 45px;
            height: 45px;
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}
