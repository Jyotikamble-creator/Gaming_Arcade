import React, { useState } from 'react';
import Header from '../components/Header';
import MetricCard from '../components/MetricCard';
import TypingArea from '../components/TypingArea';

const sampleText = "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. A wizard's job is to vex chumps quickly in fog. When zombies arrive, quickly fax judge Pat. The five boxing wizards jump quickly.";

const TypingTestPage = () => {
    // Simulated State
    const [wpm, setWpm] = useState(78);
    const [accuracy, setAccuracy] = useState(98);
    const [time, setTime] = useState('00:21');

    const handleRefresh = () => {
        console.log("Test restarted.");
        // Logic to reset WPM/Accuracy/Time and load a new text/reset input
    };
    
    const handleSubmitScore = () => {
        console.log("Score submitted.");
        // Logic to submit the final score
    };

    return (
        <div className="min-h-screen bg-dark-bg text-light-text">
            <Header />
            
            <main className="container mx-auto px-4 py-12">
                
                {/* Metrics Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
                    <MetricCard label="WPM" value={wpm} />
                    <MetricCard label="Accuracy" value={accuracy} unit="%" />
                    <MetricCard label="Time" value={time} />
                </div>

                {/* Typing Area */}
                <TypingArea 
                    sourceText={sampleText} 
                    onRefresh={handleRefresh} 
                />

                {/* Submit Button */}
                <div className="text-center mt-8">
                    <button 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-12 rounded-lg shadow-lg transition duration-200"
                        onClick={handleSubmitScore}
                    >
                        Submit Score
                    </button>
                </div>
            </main>
        </div>
    );
};

export default TypingTestPage;