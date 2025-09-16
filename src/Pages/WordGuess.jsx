// src/Pages/WordGuess.jsx
import React, { useEffect, useState } from 'react'
import LettersRow from '../components/LettersRow' // create this file (I provide below)

// Sample words list — you can later load from JSON or server
const WORDS = [
  { word: 'APPLE', description: 'A fruit' },
  { word: 'MANGO', description: 'Tropical fruit' },
  { word: 'HOUSE', description: 'Place to live' },
]

async function saveScore(payload) {
  // Attempts to POST to /api/scores; catches errors and logs them.
  try {
    await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    console.error('Failed saving score:', e)
  }
}

export default function WordGuess() {
  const [wordData, setWordData] = useState(WORDS[0])
  const [chosenLetters, setChosenLetters] = useState([])
  const [hints, setHints] = useState(2)
  const [displayWord, setDisplayWord] = useState(false)
  const [score, setScore] = useState(0)
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    loadWord()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function loadWord() {
    const next = WORDS[Math.floor(Math.random() * WORDS.length)]
    setWordData(next)
    setChosenLetters([])
    setDisplayWord(false)
    setMsg('')
    setWrongGuesses(0)
  }

  function selectLetter(letter) {
    if (chosenLetters.includes(letter)) return
    setChosenLetters(prev => [...prev, letter])
  }

  function removeLast() {
    setChosenLetters(prev => prev.slice(0, -1))
  }

  function hint() {
    if (hints <= 0) return
    // reveal a random unrevealed letter
    const unrevealed = Array.from(new Set(wordData.word.split(''))).filter(
      c => !chosenLetters.includes(c)
    )
    if (!unrevealed.length) return
    const pick = unrevealed[Math.floor(Math.random() * unrevealed.length)]
    setChosenLetters(prev => [...prev, pick])
    setHints(h => h - 1)
  }

  function checkWin() {
    return wordData.word.split('').every(l => chosenLetters.includes(l))
  }

  async function guess() {
    if (checkWin()) {
      setMsg('You Won!')
      setScore(s => s + 50)
      try {
        await saveScore({ game: 'word-guess', player: 'guest', score: score + 50 })
      } catch (e) {
        console.error(e)
      }
    } else {
      setMsg('Wrong guess, reveal word!')
      setDisplayWord(true)
      setWrongGuesses(w => w + 1)
      setScore(s => Math.max(0, s - 5))
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Word Guess</h2>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {Array.from(wordData.word).map((ch, idx) => (
          <div
            key={idx}
            style={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#333',
              color: '#fff',
              borderRadius: 6,
              fontSize: 18,
            }}
            aria-hidden={!chosenLetters.includes(ch)}
            role="text"
          >
            {chosenLetters.includes(ch) ? ch : ''}
          </div>
        ))}
      </div>

      <p className="word-description" style={{ marginTop: 12 }}>
        {wordData.description}
      </p>

      <div style={{ marginTop: 16 }}>
        <LettersRow chosenLetters={chosenLetters} onSelect={selectLetter} />
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={removeLast} disabled={!chosenLetters.length}>
          Remove
        </button>
        <button onClick={hint} disabled={hints <= 0} style={{ marginLeft: 8 }}>
          Hint ({hints})
        </button>
        <button onClick={guess} disabled={!chosenLetters.length} style={{ marginLeft: 8 }}>
          Guess
        </button>
        <button onClick={loadWord} style={{ marginLeft: 8 }}>
          Restart
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <div>Score: {score}</div>
        <div>Wrong: {wrongGuesses}</div>
      </div>

      {msg && (
        <div style={{ marginTop: 16 }}>
          <strong>{msg}</strong>
          {displayWord && <div>Word: {wordData.word}</div>}
        </div>
      )}
    </div>
  )
}