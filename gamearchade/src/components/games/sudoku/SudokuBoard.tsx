'use client';

// Component to render the Sudoku board with cells, highlights, notes, and pause overlay
import React from 'react';
import type { SudokuBoardProps } from '@/types/games/sudoku';

const SudokuBoard: React.FC<SudokuBoardProps> = ({
  board,
  initialBoard,
  selectedCell,
  solution,
  notes,
  onCellClick,
  isPaused
}) => {
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
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .sudoku-pause-overlay {
          position: absolute;
          inset: 0;
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
          color: white;
        }
        
        .sudoku-board {
          display: inline-grid;
          grid-template-columns: repeat(9, 1fr);
          gap: 0;
          background: #fff;
          padding: 4px;
          border: 2px solid #000;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .sudoku-row {
          display: contents;
        }
        
        .sudoku-cell {
          width: 56px;
          height: 56px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 24px;
          font-weight: bold;
          color: #000;
          border: 1px solid #999;
          user-select: none;
          transition: background-color 0.1s ease;
        }
        
        /* 3x3 Box borders */
        .sudoku-cell:nth-child(3n):nth-child(-n+9),
        .sudoku-cell:nth-child(3n):nth-child(n+19):nth-child(-n+27),
        .sudoku-cell:nth-child(3n):nth-child(n+46):nth-child(-n+54),
        .sudoku-cell:nth-child(3n):nth-child(n+73):nth-child(-n+81) {
          border-right: 3px solid #000;
        }
        
        .sudoku-cell:nth-child(n+19):nth-child(-n+27),
        .sudoku-cell:nth-child(n+46):nth-child(-n+54),
        .sudoku-cell:nth-child(n+73):nth-child(-n+81) {
          border-bottom: 3px solid #000;
        }
        
        .sudoku-cell:hover {
          background: #f0f0f0;
        }
        
        .sudoku-cell-initial {
          background: #e8e8e8;
          font-weight: bold;
          cursor: default;
        }
        
        .sudoku-cell-initial:hover {
          background: #e8e8e8;
        }
        
        .sudoku-cell-selected {
          background: #b3d9ff !important;
          border: 2px solid #0066cc;
        }
        
        .sudoku-cell-highlighted {
          background: #e8f4f8;
        }
        
        .sudoku-cell-same-number {
          background: #c8e6c9 !important;
        }
        
        .sudoku-cell-wrong {
          background: #ffcccc !important;
          color: #cc0000;
        }
        
        .sudoku-number {
          font-size: 28px;
          font-weight: bold;
        }
        
        .sudoku-notes {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          width: 100%;
          height: 100%;
        }
        
        .sudoku-note {
          font-size: 10px;
          font-weight: 500;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .sudoku-cell {
            width: 48px;
            height: 48px;
            font-size: 18px;
          }
          
          .sudoku-number {
            font-size: 20px;
          }
        }
        
        @media (max-width: 480px) {
          .sudoku-board {
            padding: 2px;
          }
          
          .sudoku-cell {
            width: 36px;
            height: 36px;
            font-size: 14px;
            border-width: 0.5px;
          }
          
          .sudoku-cell:nth-child(3n):nth-child(-n+9),
          .sudoku-cell:nth-child(3n):nth-child(n+19):nth-child(-n+27),
          .sudoku-cell:nth-child(3n):nth-child(n+46):nth-child(-n+54),
          .sudoku-cell:nth-child(3n):nth-child(n+73):nth-child(-n+81) {
            border-right-width: 2px;
          }
          
          .sudoku-cell:nth-child(n+19):nth-child(-n+27),
          .sudoku-cell:nth-child(n+46):nth-child(-n+54),
          .sudoku-cell:nth-child(n+73):nth-child(-n+81) {
            border-bottom-width: 2px;
          }
          
          .sudoku-number {
            font-size: 16px;
          }
          
          .sudoku-note {
            font-size: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default SudokuBoard;