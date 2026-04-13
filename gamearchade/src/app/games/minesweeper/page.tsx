import Minesweeper from '@/components/games/minesweeper/Minesweeper';
import DashboardLayout from '@/components/shared/DashboardLayout';
import Leaderboard from '@/components/leaderboard/Leaderboard';

export const metadata = {
  title: 'Minesweeper - GameArchade',
  description: 'Play the classic Minesweeper game. Find all mines without detonating any!',
};

export default function MinesweeperRoutePage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-6xl mx-auto">
          <Minesweeper />

          {/* Leaderboard */}
          <div className="mt-12">
            <Leaderboard gameType="minesweeper" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}