import React, { useState, useEffect } from 'react'
import { submitScore } from '../api/Api'

export default function Game2048(){
  const [board, setBoard] = useState(() => initBoard())
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  function initBoard() {
    const board = Array(4).fill().map(() => Array(4).fill(0))
    addRandomTile(board)
    addRandomTile(board)
    return board
  }

  function addRandomTile(board) {
    const empty = []
    for(let i = 0; i < 4; i++) {
      for(let j = 0; j < 4; j++) {
        if(board[i][j] === 0) empty.push([i, j])
      }
    }
    if(empty.length > 0) {
      const [row, col] = empty[Math.floor(Math.random() * empty.length)]
      board[row][col] = Math.random() < 0.9 ? 2 : 4
    }
  }

  function moveLeft(board) {
    let moved = false
    let newScore = 0
    for(let i = 0; i < 4; i++) {
      const row = board[i].filter(val => val !== 0)
      for(let j = 0; j < row.length - 1; j++) {
        if(row[j] === row[j + 1]) {
          row[j] *= 2
          newScore += row[j]
          row.splice(j + 1, 1)
        }
      }
      while(row.length < 4) row.push(0)
      for(let j = 0; j < 4; j++) {
        if(board[i][j] !== row[j]) moved = true
        board[i][j] = row[j]
      }
    }
    return { moved, score: newScore }
  }

  function handleMove(direction) {
    if(gameOver) return
    
    const newBoard = board.map(row => [...row])
    let result = { moved: false, score: 0 }
    
    if(direction === 'left') {
      result = moveLeft(newBoard)
    } else if(direction === 'right') {
      newBoard.forEach(row => row.reverse())
      result = moveLeft(newBoard)
      newBoard.forEach(row => row.reverse())
    } else if(direction === 'up') {
      const rotated = newBoard[0].map((_, i) => newBoard.map(row => row[i]))
      result = moveLeft(rotated)
      rotated.forEach((row, i) => row.forEach((val, j) => newBoard[j][i] = val))
    } else if(direction === 'down') {
      const rotated = newBoard[0].map((_, i) => newBoard.map(row => row[i]).reverse())
      result = moveLeft(rotated)
      rotated.reverse()
      rotated.forEach((row, i) => row.forEach((val, j) => newBoard[j][i] = val))
    }

    if(result.moved) {
      addRandomTile(newBoard)
      setBoard(newBoard)
      setScore(prev => prev + result.score)
      
      // Check for 2048
      if(newBoard.some(row => row.some(cell => cell === 2048))) {
        alert('You reached 2048! You win!')
        submitScore({ game: '2048', playerName: 'guest', score: score + result.score })
        setGameOver(true)
      }
    }
  }

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch(e.key) {
        case 'ArrowLeft': handleMove('left'); break
        case 'ArrowRight': handleMove('right'); break
        case 'ArrowUp': handleMove('up'); break
        case 'ArrowDown': handleMove('down'); break
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [board, gameOver])

  function restart() {
    setBoard(initBoard())
    setScore(0)
    setGameOver(false)
  }

  return (
    <div style={{padding:20}}>
      <h2>2048</h2>
      <div style={{marginBottom: 20}}>
        <div>Score: {score}</div>
        <button onClick={restart} style={{marginTop: 10}}>Restart</button>
      </div>
      
      <div style={{
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 80px)', 
        gap: 8,
        marginBottom: 20,
        background: '#bbada0',
        padding: 8,
        borderRadius: 6
      }}>
        {board.flat().map((value, index) => (
          <div key={index} style={{
            width: 80,
            height: 80,
            background: value ? '#eee4da' : '#cdc1b4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: value > 100 ? 20 : 24,
            fontWeight: 'bold',
            borderRadius: 3,
            color: value > 4 ? '#f9f6f2' : '#776e65'
          }}>
            {value || ''}
          </div>
        ))}
      </div>
      
      <div style={{marginBottom: 20}}>
        <button onClick={() => handleMove('up')} style={{display: 'block', margin: '0 auto 10px'}}>↑</button>
        <div style={{textAlign: 'center'}}>
          <button onClick={() => handleMove('left')} style={{marginRight: 20}}>←</button>
          <button onClick={() => handleMove('right')}>→</button>
        </div>
        <button onClick={() => handleMove('down')} style={{display: 'block', margin: '10px auto 0'}}>↓</button>
      </div>
      
      <p style={{fontSize: 14, color: '#666'}}>
        Use arrow keys or buttons to move tiles. Combine tiles with the same number to reach 2048!
      </p>
    </div>
  )
}
