import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'


import WordGuess from './Pages/WordGuess'

function Home() {
	return (
		<div style={{ padding: 20 }}>
			<h1>Welcome to Game Arcade</h1>
			<p>Choose a game from the Games hub.</p>
		</div>
	)
}

function GamesHub() {
	return (
		<div style={{ padding: 20 }}>
			<h2>Games</h2>
			<ul>
				<li><Link to="/games/word-guess">Word Guess</Link></li>
				{/* add other games here as you build them */}
			</ul>
		</div>
	)
}

export default function App() {
	return (
		<div>
			<header style={{padding:16, borderBottom:'1px solid #ddd'}}>
				<Link to="/">Home</Link> | <Link to="/games">Games</Link>
			</header>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/games" element={<GamesHub />} />
				<Route path="/games/word-guess" element={<WordGuess />} />
			</Routes>
		</div>
	)
}