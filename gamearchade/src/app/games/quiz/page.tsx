"use client"
import React, { useEffect, useState, useCallback } from 'react'
import QuestionCard from '@/components/games/quiz/QuestionCard'
import QuizStats from '@/components/games/quiz/QuizStats'
import Instructions from '@/components/shared/Instructions'
import QuizCompletedModal from '@/components/games/quiz/QuizCompletedModal'
import Leaderboard from '@/components/leaderboard/Leaderboard'
import DashboardLayout from '@/components/shared/DashboardLayout'

interface QuizQuestion {
  id: number
  q: string
  options: string[]
  ans: string
  points?: number
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await fetch('/api/games/quiz/start')
        if (!res.ok) throw new Error('Failed to load questions')
        const json = await res.json()
        if (mounted) setQuestions(json.questions || [])
      } catch (e) {
        console.error(e)
        if (mounted) setQuestions([])
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const handleAnswer = useCallback((answer: string) => {
    // Prevent answering when quiz is completed
    if (isCompleted) return

    const q = questions[currentIndex]
    setSelectedAnswer(answer)
    setShowResult(true)

    if (q && answer === q.ans) {
      setScore(s => s + (q.points || 10))
    }

    setTimeout(() => {
      setShowResult(false)
      setSelectedAnswer(null)
      
      // Check if this is the last question
      if (currentIndex >= questions.length - 1) {
        // Quiz is complete, show completion modal
        setIsCompleted(true)
      } else {
        // Move to next question
        setCurrentIndex(i => i + 1)
      }
    }, 800)
  }, [questions, currentIndex, isCompleted])

  const handleRestart = useCallback(() => {
    setCurrentIndex(0)
    setScore(0)
    setShowResult(false)
    setSelectedAnswer(null)
    setIsCompleted(false)
  }, [])

  if (questions.length === 0) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center text-light-text">
        <div>Loading quiz...</div>
      </div>
    )
  }

  const current = questions[currentIndex]

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8 bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 text-light-text">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Quiz</h1>

          <div className="mb-6">
            <Instructions gameType="quiz" />
          </div>

          <QuizStats current={currentIndex + 1} total={questions.length} score={score} progress={Math.round(((currentIndex+1)/questions.length)*100)} />

          {!isCompleted && (
            <QuestionCard
              question={current.q}
              options={current.options}
              onAnswer={handleAnswer}
              showResult={showResult}
              selectedAnswer={selectedAnswer}
              correctAnswer={current.ans}
            />
          )}

          {isCompleted && (
            <QuizCompletedModal
              score={score}
              totalQuestions={questions.length}
              onRestart={handleRestart}
            />
          )}

          {/* Leaderboard */}
          <div className="mt-12">
            <Leaderboard gameType="quiz" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
