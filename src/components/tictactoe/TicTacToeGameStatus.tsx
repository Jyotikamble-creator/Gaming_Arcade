// TicTacToeGameStatus component to display the game status
import React from 'react';
import { TicTacToeGameStatusProps } from '../../types/ticTacToe';
import { getPlayerColor, getWinnerMessage } from '../../utils/ticTacToeUtils';

export default function TicTacToeGameStatus({ winner }: TicTacToeGameStatusProps): JSX.Element | null {
  if (!winner) return null;
  
  // Render the game status
  return (
    <div className="text-center mb-6">
      <div className={`text-2xl font-bold ${getPlayerColor(winner)}`}>
        {getWinnerMessage(winner)}
      </div>
    </div>
  );
}