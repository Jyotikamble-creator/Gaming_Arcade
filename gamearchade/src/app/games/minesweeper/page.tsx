import Minesweeper from '@/components/games/minesweeper/Minesweeper';

export const metadata = {
  title: 'Minesweeper - GameArchade',
  description: 'Play the classic Minesweeper game. Find all mines without detonating any!',
};

export default function MinesweeperRoutePage() {
  return <Minesweeper />;
}