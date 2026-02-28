"use client"
import React, { useEffect, useState, useCallback } from 'react'
import QuestionCard from '@/components/games/quiz/QuestionCard'
import QuizStats from '@/components/games/quiz/QuizStats'

interface QuizQuestion {
  id: number
  q: string
  options: string[]
  ans: string
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

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
    const q = questions[currentIndex]
    setSelectedAnswer(answer)
    setShowResult(true)

    if (q && answer === q.ans) {
      setScore(s => s + (q.points || 10))
    }

    setTimeout(() => {
      setShowResult(false)
      setSelectedAnswer(null)
      setCurrentIndex(i => Math.min(i + 1, questions.length - 1))
    }, 800)
  }, [questions, currentIndex])

  if (questions.length === 0) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center text-light-text">
        <div>Loading quiz...</div>
      </div>
    )
  }

  const current = questions[currentIndex]

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-light-text">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Quiz</h1>

        <QuizStats current={currentIndex + 1} total={questions.length} score={score} progress={Math.round(((currentIndex+1)/questions.length)*100)} />

        <QuestionCard
          question={current.q}
          options={current.options}
          onAnswer={handleAnswer}
          showResult={showResult}
          selectedAnswer={selectedAnswer}
          correctAnswer={current.ans}
        />
      </div>
    </div>
  )
}
