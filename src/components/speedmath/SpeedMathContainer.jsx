import React from 'react';
import { useSpeedMath } from '../../hooks/useSpeedMath';

// Components
import Instructions from '../shared/Instructions';
import Leaderboard from '../leaderboard/Leaderboard';
import SpeedMathProblem from '../speedmath/SpeedMathProblem';
import SpeedMathStats from '../speedmath/SpeedMathStats';
import SpeedMathTimer from '../speedmath/SpeedMathTimer';
import SpeedMathCompletedModal from '../speedmath/SpeedMathCompletedModal';
import AnimatedBackground from '../AnimatedBackground';

/**
 * Main Speed Math container component
 */
const SpeedMathContainer = () => {
  const {
    difficulty,
    isPlaying,
    currentProblem,
    userAnswer,
    score,
    problemsSolved,
    timeLeft,
    gameCompleted,
    streak,
    bestStreak,
    feedback,
    totalProblems,
    accuracy,
    difficultyConfig,
    setDifficulty,
    setUserAnswer,
    startGame,
    checkAnswer,
    skipProblem,
    handleKeyPress,
    backToMenu
  } = useSpeedMath();

  return (
    <div className="min-h-screen text-light-text relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <SpeedMathHeader />

        {/* Instructions */}
        {!isPlaying && !gameCompleted && (
          <div className="max-w-md mx-auto mb-8">
            <Instructions gameType="speed-math" />
          </div>
        )}

        {/* Difficulty Selection Screen */}
        {!isPlaying && !gameCompleted && (
          <DifficultySelection
            difficulty={difficulty}
            difficultyConfig={difficultyConfig}
            onDifficultySelect={setDifficulty}
            onStartGame={startGame}
          />
        )}

        {/* Game Screen */}
        {isPlaying && currentProblem && (
          <GameScreen
            score={score}
            problemsSolved={problemsSolved}
            streak={streak}
            bestStreak={bestStreak}
            timeLeft={timeLeft}
            currentProblem={currentProblem}
            userAnswer={userAnswer}
            feedback={feedback}
            onAnswerChange={setUserAnswer}
            onSubmit={checkAnswer}
            onSkip={skipProblem}
            onKeyPress={handleKeyPress}
          />
        )}

        {/* Game Completed Modal */}
        {gameCompleted && (
          <SpeedMathCompletedModal
            score={score}
            problemsSolved={problemsSolved}
            totalProblems={totalProblems}
            bestStreak={bestStreak}
            difficulty={difficulty}
            onRestart={startGame}
            onBackToMenu={backToMenu}
          />
        )}

        {/* Leaderboard */}
        {!isPlaying && (
          <div className="mt-12">
            <Leaderboard game="speed-math" />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Speed Math header component
 */
const SpeedMathHeader = () => (
  <div className="text-center mb-8">
    <h1 className="text-5xl font-bold text-white mb-2">⚡ Speed Math</h1>
    <p className="text-gray-300">Solve as many problems as you can in 60 seconds!</p>
  </div>
);

/**
 * Difficulty selection component
 */
const DifficultySelection = ({ 
  difficulty, 
  difficultyConfig, 
  onDifficultySelect, 
  onStartGame 
}) => (
  <div className="max-w-md mx-auto">
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose Difficulty</h2>

      <div className="space-y-4 mb-8">
        {Object.entries(difficultyConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => onDifficultySelect(key)}
            className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
              difficulty === key
                ? `bg-${config.color}-600 text-white shadow-lg shadow-${config.color}-500/50 scale-105`
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {config.label} ({config.points} pts)
            <div className="text-sm font-normal mt-1">{config.description}</div>
          </button>
        ))}
      </div>

      <button
        onClick={onStartGame}
        disabled={!difficulty}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed disabled:opacity-50 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/50 hover:scale-105 disabled:hover:scale-100"
      >
        {difficulty ? 'Start Game ▶' : 'Select a Difficulty First'}
      </button>
    </div>
  </div>
);

/**
 * Game screen component
 */
const GameScreen = ({
  score,
  problemsSolved,
  streak,
  bestStreak,
  timeLeft,
  currentProblem,
  userAnswer,
  feedback,
  onAnswerChange,
  onSubmit,
  onSkip,
  onKeyPress
}) => (
  <div className="max-w-2xl mx-auto">
    {/* Stats */}
    <SpeedMathStats
      score={score}
      problemsSolved={problemsSolved}
      streak={streak}
      bestStreak={bestStreak}
    />

    {/* Timer */}
    <SpeedMathTimer timeLeft={timeLeft} />

    {/* Problem */}
    <SpeedMathProblem
      problem={currentProblem}
      userAnswer={userAnswer}
      setUserAnswer={onAnswerChange}
      onSubmit={onSubmit}
      onSkip={onSkip}
      onKeyPress={onKeyPress}
      feedback={feedback}
    />
  </div>
);

export default SpeedMathContainer;