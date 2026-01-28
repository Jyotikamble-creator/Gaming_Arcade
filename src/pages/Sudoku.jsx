import React from 'react';
import SudokuContainer from '../components/sudoku/SudokuContainer';

/**
 * Sudoku page component - handles routing and page-level concerns
 * The actual game logic and UI is handled by SudokuContainer
 */
const Sudoku = () => {
  return <SudokuContainer />;
};

export default Sudoku;
