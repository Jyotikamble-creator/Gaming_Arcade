// import React from 'react'
// import { Routes, Route, Link } from 'react-router-dom'


// import WordGuess from './Pages/WordGuess'

// function Home() {
// 	return (
// 		<div style={{ padding: 20 }}>
// 			<h1>Welcome to Game Arcade</h1>
// 			<p>Choose a game from the Games hub.</p>
// 		</div>
// 	)
// }

// function GamesHub() {
// 	return (
// 		<div style={{ padding: 20 }}>
// 			<h2>Games</h2>
// 			<ul>
// 				<li><Link to="/games/word-guess">Word Guess</Link></li>
// 				{/* add other games here as you build them */}
// 			</ul>
// 		</div>
// 	)
// }

// export default function App() {
// 	return (
// 		<div>
// 			<header style={{padding:16, borderBottom:'1px solid #ddd'}}>
// 				<Link to="/">Home</Link> | <Link to="/games">Games</Link>
// 			</header>
// 			<Routes>
// 				<Route path="/" element={<Home />} />
// 				<Route path="/games" element={<GamesHub />} />
// 				<Route path="/games/word-guess" element={<WordGuess />} />
// 			</Routes>
// 		</div>
// 	)
// }





import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import WordGuess from './pages/WordGuess'
import MemoryCard from './pages/MemoryCard'
import MathQuiz from './pages/MathQuiz'
import TypingTest from './pages/TypingTest'
import Game2048 from './pages/Game2048'
import WordScramble from './pages/WordScramble'
import Quiz from './pages/Quiz'
import EmojiGuess from './pages/EmojiGuess'
import WhackAMole from './pages/WhackMole'
import SimonSays from './pages/SimonSays'

export default function App() {
  return (
    <BrowserRouter>
      <header style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
        <Link to="/">Home</Link> | <Link to="/word">Word</Link> | <Link to="/memory">Memory</Link> | <Link to="/math">Math</Link>
      </header>
      <Routes>
        <Route path="/" element={<div style={{ padding: 20 }}><h1>Gaming Arcade</h1></div>} />
        <Route path="/word" element={<WordGuess />} />
        <Route path="/memory" element={<MemoryCard />} />
        <Route path="/math" element={<MathQuiz />} />
        <Route path="/typing" element={<TypingTest />} />
        <Route path="/2048" element={<Game2048 />} />
        <Route path="/scramble" element={<WordScramble />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/emoji" element={<EmojiGuess />} />
        <Route path="/whack" element={<WhackAMole />} />
        <Route path="/simon" element={<SimonSays />} />
      </Routes>
    </BrowserRouter>
  )
}
