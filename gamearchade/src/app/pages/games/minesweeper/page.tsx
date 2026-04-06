import { redirect } from 'next/navigation';

export default function LegacyMinesweeperPage() {
  redirect('/games/minesweeper');
}