// Word Guess Game
import React, { useEffect, useState } from 'react';
// API
import { fetchWords } from '../api/wordApi';
// Logger
import { saveScore } from '../api/scoreApi';
// Components
import Leaderboard from '../components/leaderboard/Leaderboard';
import WordDisplay from '../components/wordguess/WordDisplay';
import LetterSelector from '../components/wordguess/LetterSelector';
import GameControls from '../components/wordguess/GameControls';
import GameStats from '../components/wordguess/GameStats';
import GameMessage from '../components/wordguess/GameMessage';
import Instructions from '../components/shared/Instructions';
import { logger, LogTags } from '../lib/logger';

// Main component
export default function WordGuess() {
  const [wordData, setWordData] = useState({ word: '', description: '' })
  const [chosen, setChosen] = useState([])
  const [wrong, setWrong] = useState(0)
  const [hints, setHints] = useState(3)
  const [msg, setMsg] = useState('')
  const [displayWord, setDisplayWord] = useState(false)
  const [score, setScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load a new word 
  async function load() {
    try {
      setIsLoading(true)
      logger.info('Loading word for WordGuess game', {}, LogTags.WORD_GUESS)
      const rows = await fetchWords('word-guess')
      const pick = rows && rows.length ? rows[Math.floor(Math.random() * rows.length)] : { word: 'APPLE', description: 'A fruit' }
      setWordData({ id: pick.id, word: String(pick.word || '').toUpperCase(), description: pick.description || '' })
      setChosen([])
      setWrong(0)
      setHints(3)
      setMsg('')
      setDisplayWord(false)
      setScore(0)
      logger.info('Word loaded successfully', { word: pick.word }, LogTags.WORD_GUESS)
    } catch (e) {
      logger.error('Failed to load word', e, {}, LogTags.WORD_GUESS)
      // fallback
      setWordData({ word: 'APPLE', description: 'A fruit' })
    } finally {
      setIsLoading(false)
    }
  }

  // Select a letter
  function select(l) {
    if (chosen.includes(l) || msg) return
    setChosen(prev => [...prev, l])
    if (!wordData.word.includes(l)) {
      setWrong(w => w + 1)
      setScore(s => Math.max(0, s - 2))
    } else {
      setScore(s => s + 10)
    }
  }

  // Game over
  useEffect(() => {
    if (wrong >= 3) {
      setMsg('Game Over')
      setDisplayWord(true)
      // save score (best-effort)
      saveScore({ game: 'word-guess', playerName: 'guest', score }).catch(() => { })
    }
  }, [wrong])

  // Use a hint
  function useHint() {
    if (hints <= 0) return
    const unrevealed = wordData.word.split('').filter(c => !chosen.includes(c))
    if (!unrevealed.length) return
    const pick = unrevealed[Math.floor(Math.random() * unrevealed.length)]
    setChosen(prev => [...prev, pick])
    setHints(h => h - 1)
    setScore(s => Math.max(0, s - 5))
  }
  // Remove the last letter
  function removeLast() {
    setChosen(prev => prev.slice(0, -1))
  }

  // Check win
  async function checkWin() {
    const ok = wordData.word.split('').every(c => chosen.includes(c))
    if (ok) {
      setMsg('You Win!')
      try {
        await saveScore({ game: 'word-guess', playerName: 'guest', score: score + 50 })
        logger.info('WordGuess game won', { score: score + 50 }, LogTags.SAVE_SCORE)
      } catch (e) {
        logger.error('Failed to save score on win', e, { score: score + 50 }, LogTags.SAVE_SCORE)
      }
    } else {
      setMsg('Wrong guess')
      setDisplayWord(true)
      logger.warn('WordGuess wrong guess', { word: wordData.word, chosen }, LogTags.WORD_GUESS)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text">Loading word...</p>
        </div>
      </div>
    )
  }

  // Render
  return (
    <div className="min-h-screen text-light-text">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Word Guess</h1>
          <p className="text-subtle-text">Guess the word by selecting letters. You have 3 wrong guesses allowed!</p>
        </div>

        {/* Word Description */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="text-center">
            <div className="mb-3">
              <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                {wordData.category || 'General'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Word Hint</h3>
            <p className="text-gray-300 leading-relaxed text-sm md:text-base max-w-2xl mx-auto">
              {wordData.description}
            </p>
          </div>
        </div>

        {/* Word Display */}
        <WordDisplay word={wordData.word} chosenLetters={chosen} />

        {/* Game Stats */}
        <GameStats score={score} wrongGuesses={wrong} />

        {/* Game Message */}
        <GameMessage message={msg} word={wordData.word} showWord={displayWord} />

        {/* Instructions */}
        <div className="max-w-md mx-auto mb-6">
          <Instructions gameType="word-guess" />
        </div>

        {/* Letter Selector */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-white mb-3">Select Letters</h3>
          <LetterSelector
            chosenLetters={chosen}
            onSelectLetter={select}
            disabled={!!msg}
          />
        </div>

        {/* Game Controls */}
        <GameControls
          onRemoveLast={removeLast}
          onUseHint={useHint}
          onGuess={checkWin}
          onRestart={load}
          chosenLetters={chosen}
          hints={hints}
          disabled={!!msg}
        />

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard game="word-guess" />
        </div>
      </div>
    </div>
  )
}
