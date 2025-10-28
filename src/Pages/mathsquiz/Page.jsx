import React, { useState } from 'react';
import Header from '../components/Header';
import QuestionCard from '../components/QuestionCard';
import ActionButtons from '../components/ActionButtons';

const MathQuizPage = () => {
    // Simulated State
    const [currentQuestion, setCurrentQuestion] = useState(5);
    const [feedback, setFeedback] = useState('correct'); // 'correct', 'incorrect', 'none'
    const totalQuestions = 10;
    const currentProblem = "12 × 8 = ?";
    
    // Handlers
    const handleSkip = () => {
        console.log("Question skipped.");
        // Logic to move to the next question
        setCurrentQuestion(prev => Math.min(prev + 1, totalQuestions));
        setFeedback('none');
    };

    const handleSubmit = () => {
        console.log("Answer submitted.");
        // Logic to check answer, update feedback, and potentially move on
        // For demonstration, we'll toggle the feedback
        setFeedback(prev => (prev === 'correct' ? 'incorrect' : 'correct'));
    };

    return (
        <div className="min-h-screen bg-dark-bg text-light-text">
            <Header />
            
            <main className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-4xl font-extrabold text-white mb-2">Math Quiz</h1>
                <p className="text-lg text-subtle-text mb-12">
                    Solve as many problems as you can before the timer runs out.
                </p>

                {/* Main Quiz Card */}
                <QuestionCard 
                    currentQ={currentQuestion}
                    totalQ={totalQuestions}
                    question={currentProblem}
                    feedbackStatus={feedback}
                />

                {/* Action Buttons */}
                <ActionButtons 
                    onSkip={handleSkip}
                    onSubmit={handleSubmit}
                />

            </main>
        </div>
    );
};

export default MathQuizPage;