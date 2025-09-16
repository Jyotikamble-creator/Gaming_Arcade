// // src/Pages/WordGuess.jsx
// import React, { useEffect, useState } from 'react'
// import LettersRow from '../components/LettersRow' // create this file (I provide below)

// // Sample words list — you can later load from JSON or server
// const WORDS = [
//   { word: 'APPLE', description: 'A fruit' },
//   { word: 'MANGO', description: 'Tropical fruit' },
//   { word: 'HOUSE', description: 'Place to live' },
// ]

// async function saveScore(payload) {
//   // Attempts to POST to /api/scores; catches errors and logs them.
//   try {
//     await fetch('/api/scores', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload),
//     })
//   } catch (e) {
//     console.error('Failed saving score:', e)
//   }
// }

// export default function WordGuess() {
//   const [wordData, setWordData] = useState(WORDS[0])
//   const [chosenLetters, setChosenLetters] = useState([])
//   const [hints, setHints] = useState(2)
//   const [displayWord, setDisplayWord] = useState(false)
//   const [score, setScore] = useState(0)
//   const [wrongGuesses, setWrongGuesses] = useState(0)
//   const [msg, setMsg] = useState('')

//   useEffect(() => {
//     loadWord()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   function loadWord() {
//     const next = WORDS[Math.floor(Math.random() * WORDS.length)]
//     setWordData(next)
//     setChosenLetters([])
//     setDisplayWord(false)
//     setMsg('')
//     setWrongGuesses(0)
//   }

//   function selectLetter(letter) {
//     if (chosenLetters.includes(letter)) return
//     setChosenLetters(prev => [...prev, letter])
//   }

//   function removeLast() {
//     setChosenLetters(prev => prev.slice(0, -1))
//   }

//   function hint() {
//     if (hints <= 0) return
//     // reveal a random unrevealed letter
//     const unrevealed = Array.from(new Set(wordData.word.split(''))).filter(
//       c => !chosenLetters.includes(c)
//     )
//     if (!unrevealed.length) return
//     const pick = unrevealed[Math.floor(Math.random() * unrevealed.length)]
//     setChosenLetters(prev => [...prev, pick])
//     setHints(h => h - 1)
//   }

//   function checkWin() {
//     return wordData.word.split('').every(l => chosenLetters.includes(l))
//   }

//   async function guess() {
//     if (checkWin()) {
//       setMsg('You Won!')
//       setScore(s => s + 50)
//       try {
//         await saveScore({ game: 'word-guess', player: 'guest', score: score + 50 })
//       } catch (e) {
//         console.error(e)
//       }
//     } else {
//       setMsg('Wrong guess, reveal word!')
//       setDisplayWord(true)
//       setWrongGuesses(w => w + 1)
//       setScore(s => Math.max(0, s - 5))
//     }
//   }

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Word Guess</h2>

//       <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
//         {Array.from(wordData.word).map((ch, idx) => (
//           <div
//             key={idx}
//             style={{
//               width: 48,
//               height: 48,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               background: '#333',
//               color: '#fff',
//               borderRadius: 6,
//               fontSize: 18,
//             }}
//             aria-hidden={!chosenLetters.includes(ch)}
//             role="text"
//           >
//             {chosenLetters.includes(ch) ? ch : ''}
//           </div>
//         ))}
//       </div>

//       <p className="word-description" style={{ marginTop: 12 }}>
//         {wordData.description}
//       </p>

//       <div style={{ marginTop: 16 }}>
//         <LettersRow chosenLetters={chosenLetters} onSelect={selectLetter} />
//       </div>

//       <div style={{ marginTop: 16 }}>
//         <button onClick={removeLast} disabled={!chosenLetters.length}>
//           Remove
//         </button>
//         <button onClick={hint} disabled={hints <= 0} style={{ marginLeft: 8 }}>
//           Hint ({hints})
//         </button>
//         <button onClick={guess} disabled={!chosenLetters.length} style={{ marginLeft: 8 }}>
//           Guess
//         </button>
//         <button onClick={loadWord} style={{ marginLeft: 8 }}>
//           Restart
//         </button>
//       </div>

//       <div style={{ marginTop: 16 }}>
//         <div>Score: {score}</div>
//         <div>Wrong: {wrongGuesses}</div>
//       </div>

//       {msg && (
//         <div style={{ marginTop: 16 }}>
//           <strong>{msg}</strong>
//           {displayWord && <div>Word: {wordData.word}</div>}
//         </div>
//       )}
//     </div>
//   )
// }










import React, {useEffect, useState} from 'react';
import { fetchRandomWord, submitScore } from '../api/Api';

export default function WordGuess(){
  const [wordData, setWordData] = useState({word:'', description:''});
  const [chosen, setChosen] = useState([]);
  const [wrong, setWrong] = useState(0);
  const [hints, setHints] = useState(3);
  const [msg, setMsg] = useState('');
  const [displayWord, setDisplayWord] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(()=>{ load() }, []);

  async function load(){
    try{
      const res = await fetchRandomWord();
      setWordData(res.data);
      setChosen([]); setWrong(0); setHints(3); setMsg(''); setDisplayWord(false); setScore(0);
    }catch(e){ console.error(e) }
  }

  const select = (l) => {
    if(chosen.includes(l) || msg) return;
    setChosen(prev=>[...prev,l]);
    if(!wordData.word.includes(l)){ setWrong(w=>w+1); setScore(s=>Math.max(0,s-2)); }
    else setScore(s=>s+10);
  };

  useEffect(()=>{
    if(wrong>=3){ setMsg('Game Over'); setDisplayWord(true); submitScore({game:'word-guess', score}); }
  },[wrong]);

  const useHint = () => {
    if(hints<=0) return;
    const idx = wordData.word.split('').findIndex(c=>!chosen.includes(c));
    if(idx!==-1){ setChosen(prev=>[...prev, wordData.word[idx]]); setHints(h=>h-1); setScore(s=>Math.max(0,s-5)); }
  }

  const checkWin = async () => {
    const ok = wordData.word.split('').every(c=>chosen.includes(c));
    if(ok){ setMsg('You Win!'); await submitScore({game:'word-guess', score: score+50}); }
    else{ setMsg('Wrong guess'); setDisplayWord(true); }
  }

  return (
    <div style={{padding:20}}>
      <h2>Word Guess</h2>
      <div style={{display:'flex', gap:8}}>
      {Array.from(wordData.word).map((c,i)=> (
        <div key={i} style={{width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',background:'#222',color:'#fff',borderRadius:6}}>
          {chosen.includes(c)?c:'_'}
        </div>
      ))}
      </div>
      <p>{wordData.description}</p>
      <div style={{marginTop:12}}>
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l=>(
          <button key={l} onClick={()=>select(l)} disabled={chosen.includes(l)||!!msg} style={{margin:3}}>{l}</button>
        ))}
      </div>
      <div style={{marginTop:12}}>
        <button onClick={()=>{setChosen(prev=>prev.slice(0,-1))}} disabled={!chosen.length}>Remove</button>
        <button onClick={useHint} disabled={hints<=0}>Hint({hints})</button>
        <button onClick={checkWin} disabled={!chosen.length||!!msg}>Guess</button>
        <button onClick={load}>Restart</button>
      </div>
      <div>Wrong: {wrong}/3 — Score: {score}</div>
      {msg && <div style={{marginTop:10}}>{msg}{displayWord && <div>Word: {wordData.word}</div>}</div>}
    </div>
  );
}
