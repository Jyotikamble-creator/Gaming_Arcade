// Component to render the Sudoku board with cells, highlights, notes, and pause overlay
import React from 'react';
import type { SudokuBoardProps } from '../../types/games/sudoku';

export default function SudokuBoard({
  board,
  initialBoard,
  selectedCell,
  solution,
  notes,
  onCellClick,
  isPaused
}: SudokuBoardProps): JSX.Element {
  // Helper function to get cell classes
  function getCellClasses(row: number, col: number): string {
    const classes = ['sudoku-cell'];

    // Initial cells (not editable)
    if (initialBoard[row][col] !== 0) {
      classes.push('sudoku-cell-initial');
    }

    // Selected cell
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      classes.push('sudoku-cell-selected');
    }

    // Highlight same row, column, and 3x3 box
    if (selectedCell) {
      const sameRow = selectedCell.row === row;
      const sameCol = selectedCell.col === col;
      const sameBox =
        Math.floor(selectedCell.row / 3) === Math.floor(row / 3) &&
        Math.floor(selectedCell.col / 3) === Math.floor(col / 3);

      if (sameRow || sameCol || sameBox) {
        classes.push('sudoku-cell-highlighted');
      }
    }

    // Highlight same numbers
    if (selectedCell && board[selectedCell.row][selectedCell.col] !== 0) {
      if (board[row][col] === board[selectedCell.row][selectedCell.col]) {
        classes.push('sudoku-cell-same-number');
      }
    }

    // Wrong number (if filled and doesn't match solution)
    if (board[row][col] !== 0 && initialBoard[row][col] === 0) {
      if (board[row][col] !== solution[row][col]) {
        classes.push('sudoku-cell-wrong');
      }
    }

    return classes.join(' ');
  }

  // Helper function to render cell content
  function renderCellContent(row: number, col: number): JSX.Element | null {
    const value = board[row][col];
    const key = `${row}-${col}`;
    const cellNotes = notes[key] || [];

    if (value !== 0) {
      return <span className="sudoku-number">{value}</span>;
    }

    // Render notes
    if (cellNotes.length > 0) {
      return (
        <div className="sudoku-notes">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <span key={num} className="sudoku-note">
              {cellNotes.includes(num) ? num : ''}
            </span>
          ))}
        </div>
      );
    }

    return null;
  }

  // Render the Sudoku board
  return (
    <div className="sudoku-board-wrapper">
      {isPaused && (
        <div className="sudoku-pause-overlay">
          <div className="sudoku-pause-message">
            <svg className="w-16 h-16 mx-auto mb-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-2xl font-bold text-white">Game Paused</p>
            <p className="text-gray-300 mt-2">Click Resume to continue</p>
          </div>
        </div>
      )}
      {/* Render the Sudoku board */}
      <div className="sudoku-board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="sudoku-row">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={getCellClasses(rowIndex, colIndex)}
                onClick={() => onCellClick(rowIndex, colIndex)}
              >
                {renderCellContent(rowIndex, colIndex)}
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* Render the Sudoku board */}

      <style jsx>{`
        .sudoku-board-wrapper {
          position: relative;
          display: inline-block;
        }
        
        .sudoku-pause-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          border-radius: 12px;
        }
        
        .sudoku-pause-message {
          text-align: center;
          padding: 2rem;
        }
        
        .sudoku-board {
          display: inline-grid;
          grid-template-columns: repeat(9, 1fr);
          gap: 0;
          background: #4a5568;
          padding: 4px;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
        }
        
        .sudoku-row {
          display: contents;
        }
        
        .sudoku-cell {
          width: 70px;
          height: 70px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          font-size: 28px;
          font-weight: 600;
          color: #2d3748;
        }
        
        .sudoku-cell:hover {
          background: #edf2f7;
        }
        
        .sudoku-cell-initial {
          background: #e2e8f0;
          color: #1a202c;
          font-weight: 700;
          cursor: default;
        }
        
        .sudoku-cell-initial:hover {
          background: #e2e8f0;
        }
        
        .sudoku-cell-selected {
          background: #bee3f8 !important;
          box-shadow: inset 0 0 0 2px #3182ce;
        }
        
        .sudoku-cell-highlighted {
          background: #f7fafc;
        }
        
        .sudoku-cell-same-number {
          background: #c6f6d5 !important;
        }
        
        .sudoku-cell-wrong {
          background: #fed7d7 !important;
          color: #c53030;
        }
        
        .sudoku-number {
          font-size: 32px;
          font-weight: 700;
        }
        
        .sudoku-notes {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(3, 1fr);
          width: 100%;
          height: 100%;
          padding: 4px;
          gap: 2px;
        }
        
        .sudoku-note {
          font-size: 10px;
          font-weight: 500;
          color: #718096;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Add thick borders for 3x3 boxes */
        .sudoku-cell:nth-child(3n) {
          border-right: 2px solid #4a5568;
        }
        
        .sudoku-cell:nth-child(n):nth-child(-n+9) {
          border-bottom: none;
        }
        
        .sudoku-cell:nth-child(n+19):nth-child(-n+27),
        .sudoku-cell:nth-child(n+46):nth-child(-n+54) {
          border-bottom: 2px solid #4a5568;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .sudoku-cell {
            width: 40px;
            height: 40px;
            font-size: 18px;
          }
          
          .sudoku-number {
            font-size: 20px;
          }
          
          .sudoku-note {
            font-size: 8px;
          }
        }
        
        @media (max-width: 480px) {
          .sudoku-cell {
            width: 35px;
            height: 35px;
            font-size: 16px;
          }
          
          .sudoku-number {
            font-size: 18px;
          }
          
          .sudoku-note {
            font-size: 7px;
          }
        }
      `}</style>
    </div>
  );
}
