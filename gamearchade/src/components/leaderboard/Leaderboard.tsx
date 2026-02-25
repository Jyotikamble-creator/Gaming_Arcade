'use client';

import React, { useEffect, useState } from 'react';

interface Score {
  _id?: string;
  score: number;
  playerName?: string;
  user?: {
    displayName?: string;
    username?: string;
  };
  createdAt: string;
  meta?: {
    attempts?: number;
    hintsUsed?: number;
    [key: string]: any;
  };
}

interface LeaderboardProps {
  gameType: string;
  limit?: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ gameType, limit = 10 }) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    let mounted = true;
    
    async function loadScores() {
      try {
        setLoading(true);
        setError(null);
        
        // // Mock API call for now
        // const mockScores: Score[] = [
        //   {
        //     _id: '1',
        //     score: 2500,
        //     playerName: 'EmojiMaster',
        //     createdAt: new Date().toISOString(),
        //     meta: { attempts: 1, hintsUsed: 0 }
        //   },
        //   {
        //     _id: '2',
        //     score: 2200,
        //     playerName: 'PuzzlePro',
        //     createdAt: new Date(Date.now() - 86400000).toISOString(),
        //     meta: { attempts: 2, hintsUsed: 1 }
        //   },
        //   {
        //     _id: '3',
        //     score: 1900,
        //     playerName: 'GameGuru',
        //     createdAt: new Date(Date.now() - 172800000).toISOString(),
        //     meta: { attempts: 3, hintsUsed: 2 }
        //   }
        // ];

      //   if (mounted) {
      //     let filteredScores = mockScores;
          
      //     if (timeFilter === 'week') {
      //       const weekAgo = new Date();
      //       weekAgo.setDate(weekAgo.getDate() - 7);
      //       filteredScores = mockScores.filter(score => new Date(score.createdAt) >= weekAgo);
      //     } else if (timeFilter === 'month') {
      //       const monthAgo = new Date();
      //       monthAgo.setMonth(monthAgo.getMonth() - 1);
      //       filteredScores = mockScores.filter(score => new Date(score.createdAt) >= monthAgo);
      //     }
          
      //     setScores(filteredScores.slice(0, limit));
      //   }
      // } catch (e) {
      //   if (mounted) {
      //     setError(e instanceof Error ? e.message : 'Failed to load scores');
      //   }
      // } finally {
      //   if (mounted) {
      //     setLoading(false);
      //   }
      // }
    }

    loadScores();
    return () => { mounted = false; };
  }, [gameType, limit, timeFilter]);

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-gray-300">Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
        <div className="text-center py-8">
          <div className="text-red-400 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-400">Failed to load leaderboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl w-full">
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">🏆 Leaderboard</h3>

        <div className="flex mb-4 border-b border-gray-700">
          <button
            className={`pb-2 px-4 text-center font-semibold transition duration-200 ${
              timeFilter === 'all' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setTimeFilter('all')}
          >
            All Time
          </button>
          <button
            className={`pb-2 px-4 text-center font-semibold transition duration-200 ${
              timeFilter === 'month' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setTimeFilter('month')}
          >
            This Month
          </button>
          <button
            className={`pb-2 px-4 text-center font-semibold transition duration-200 ${
              timeFilter === 'week' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setTimeFilter('week')}
          >
            This Week
          </button>
        </div>

        <div className="space-y-2">
          {scores.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-400">No scores found</p>
              <p className="text-gray-500 text-sm">Be the first to set a record!</p>
            </div>
          ) : (
            scores.map((score, idx) => {
              const isTopThree = idx < 3;
              const rankIcons = ['🥇', '🥈', '🥉'];

              return (
                <div key={score._id || idx} className="flex items-center p-3 rounded-lg hover:bg-gray-700/30 transition duration-150">
                  <div className="flex items-center">
                    {isTopThree ? (
                      <span className="text-lg mr-3">{rankIcons[idx]}</span>
                    ) : (
                      <span className="text-lg font-bold w-6 text-center mr-3 text-gray-400">
                        {idx + 1}
                      </span>
                    )}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      isTopThree ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-blue-500'
                    }`}>
                      {(score.playerName || (score.user && (score.user.displayName || score.user.username)) || 'A')[0].toUpperCase()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center flex-grow ml-3">
                    <div className="flex-1 min-w-0">
                      <span className={`font-medium block truncate ${isTopThree ? 'text-white' : 'text-gray-300'}`}>
                        {score.playerName || (score.user && (score.user.displayName || score.user.username)) || 'Anonymous'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(score.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: timeFilter === 'all' ? '2-digit' : undefined
                        })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${isTopThree ? 'text-green-400' : 'text-green-500'}`}>
                        {score.score.toLocaleString()}
                      </span>
                      {score.meta && Object.keys(score.meta).length > 0 && (
                        <div className="text-xs text-gray-400">
                          {score.meta.attempts && `Attempts: ${score.meta.attempts}`}
                          {score.meta.hintsUsed && ` • Hints: ${score.meta.hintsUsed}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;