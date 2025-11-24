// src/components/LettersRow.jsx
import React from 'react'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function LettersRow({ chosenLetters = [], onSelect = () => {} }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {ALPHABET.map(letter => (
        <button
          key={letter}
          onClick={() => onSelect(letter)}
          disabled={chosenLetters.includes(letter)}
          aria-pressed={chosenLetters.includes(letter)}
          style={{
            padding: '8px 10px',
            borderRadius: 4,
            border: '1px solid #ddd',
            background: chosenLetters.includes(letter) ? '#1976d2' : '#2196f3',
            color: '#fff',
            cursor: chosenLetters.includes(letter) ? 'not-allowed' : 'pointer',
          }}
        >
          {letter}
        </button>
      ))}
    </div>
  )
}