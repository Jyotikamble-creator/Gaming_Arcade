// A placeholder component for the 2048 game page.
import React, { useState } from 'react';
// Assuming submitScore is a function to submit the score to the backend.
import { submitScore } from '../api/Api';

// Placeholder component for 2048 game
export default function Game2048() {
  const [score, setScore] = useState(0);
  // Render a simple interface to simulate score submission
  return (
    <div style={{ padding: 20 }}>
      <h2>2048 (placeholder)</h2>
      <p>Implement board in future. For now, simulate and submit score.</p>
      <input type="number" value={score} onChange={e => setScore(+e.target.value)} />
      <button onClick={() => submitScore({ game: '2048', player: 'guest', score })}>Submit Score</button>
    </div>
  );
}
