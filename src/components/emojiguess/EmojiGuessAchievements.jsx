// A React component that displays achievement badges for the Emoji Guess game.
import AchievementBadge from './AchievementBadge';

// Displays achievement badges for the Emoji Guess game.
export default function EmojiGuessAchievements({ achievements }) {
  return (
    <div className="mb-6 flex flex-wrap justify-center gap-4">
      {achievements.firstWin && <AchievementBadge type="first-win" unlocked={achievements.firstWin} />}
      {achievements.streak5 && <AchievementBadge type="streak-5" unlocked={achievements.streak5} />}
      {achievements.streak10 && <AchievementBadge type="streak-10" unlocked={achievements.streak10} />}
      {achievements.perfectGame && <AchievementBadge type="perfect-game" unlocked={achievements.perfectGame} />}
    </div>
  );
}