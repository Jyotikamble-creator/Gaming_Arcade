// A React component that displays achievement badges for the Emoji Guess game.
import { Award, Star, Zap, Target } from 'lucide-react';

// Displays an achievement badge based on the type and whether it is unlocked.
const AchievementBadge = ({ type, unlocked }) => {
  // Returns achievement data based on the type.
  const getAchievementData = (type) => {
    switch (type) {
      case 'first-win':
        return {
          icon: <Award className="w-8 h-8" />,
          title: 'First Victory!',
          description: 'Win your first game',
          color: 'from-yellow-400 to-yellow-600'
        };
      case 'streak-5':
        return {
          icon: <Zap className="w-8 h-8" />,
          title: 'Hot Streak!',
          description: 'Get 5 correct in a row',
          color: 'from-orange-400 to-red-500'
        };
      case 'streak-10':
        return {
          icon: <Star className="w-8 h-8" />,
          title: 'Unstoppable!',
          description: 'Get 10 correct in a row',
          color: 'from-purple-400 to-pink-500'
        };
      case 'perfect-game':
        return {
          icon: <Target className="w-8 h-8" />,
          title: 'Perfection!',
          description: 'Complete a game without hints',
          color: 'from-green-400 to-blue-500'
        };
      default:
        return {
          icon: <Award className="w-8 h-8" />,
          title: 'Achievement',
          description: 'Unlocked!',
          color: 'from-gray-400 to-gray-600'
        };
    }
  };

  // Get the achievement data for the given type.
  const achievement = getAchievementData(type);
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${achievement.color} text-white shadow-lg transform transition-all duration-300 ${unlocked ? 'scale-100 opacity-100' : 'scale-95 opacity-70'}`}>
      <div className={`p-2 rounded-full bg-white bg-opacity-20 ${unlocked ? 'animate-pulse' : ''}`}>
        {achievement.icon}
      </div>
      <div>
        <h3 className="font-bold text-lg">{achievement.title}</h3>
        <p className="text-sm opacity-90">{achievement.description}</p>
      </div>
    </div>
  );
};

export default AchievementBadge;