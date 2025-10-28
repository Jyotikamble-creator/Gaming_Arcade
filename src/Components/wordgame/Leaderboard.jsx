import React, { useState } from 'react';

// Sub-component for a single leaderboard entry
const LeaderboardItem = ({ rank, name, score, image, isHighlighted = false }) => (
    <div className={`flex items-center p-2 rounded-lg ${isHighlighted ? 'bg-gray-700' : 'hover:bg-gray-700'} transition duration-150`}>
        <span className="text-lg font-bold w-6">{rank}.</span>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-400 mx-3">
            {/* Placeholder for user image */}
            <span className="text-white flex items-center justify-center h-full text-xs">{image}</span> 
        </div>
        <div className="flex justify-between items-center flex-grow">
            <span className="font-medium">{name}</span>
            <span className="text-sm text-subtle-text">{score}</span>
        </div>
    </div>
);

const dailyData = [
    { rank: 1, name: 'PixelPioneer', score: '2/6 - 0:45', image: 'PP' },
    { rank: 2, name: 'LogicLord', score: '3/6 - 1:12', image: 'LL' },
    { rank: 3, name: 'CodeQueen', score: '3/6 - 1:30', image: 'CQ' },
    { rank: 4, name: 'ByteBender', score: '4/6 - 2:05', image: 'BB' },
    { rank: 5, name: 'SyntaxSavvy', score: '4/6 - 2:15', image: 'SS' },
];

const allTimeData = [
    { rank: 1, name: 'MasterMind', score: '99 Wins', image: 'MM' },
    { rank: 2, name: 'WordWhiz', score: '88 Wins', image: 'WW' },
    // ... more data
];

const Leaderboard = () => {
    const [activeTab, setActiveTab] = useState('daily'); // 'daily' or 'all-time'
    const data = activeTab === 'daily' ? dailyData : allTimeData;

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 w-full">
            <h3 className="text-xl font-bold text-white mb-4">Leaderboard</h3>
            
            {/* Tabs */}
            <div className="flex mb-4 border-b border-gray-700">
                <button
                    className={`pb-2 px-4 text-center font-semibold transition duration-200 ${
                        activeTab === 'daily' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-subtle-text hover:text-white'
                    }`}
                    onClick={() => setActiveTab('daily')}
                >
                    Daily
                </button>
                <button
                    className={`pb-2 px-4 text-center font-semibold transition duration-200 ${
                        activeTab === 'all-time' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-subtle-text hover:text-white'
                    }`}
                    onClick={() => setActiveTab('all-time')}
                >
                    All-Time
                </button>
            </div>

            {/* List */}
            <div className="space-y-2">
                {data.map(item => (
                    <LeaderboardItem key={item.rank} {...item} />
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;