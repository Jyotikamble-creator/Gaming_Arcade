import React, {useEffect, useState} from 'react';
import { fetchScramble, submitScore } from '../api/Api';

export default function WordScramble(){
  const [data, setData] = useState(null);
  const [guess, setGuess] = useState('');
  useEffect(()=> load(), []);
  async function load(){ const r = await fetchScramble(); setData(r.data); setGuess(''); }

  async function check(){
    if(guess.toUpperCase() === data.word.toUpperCase()){
      await submitScore({game:'word-scramble', score:100});
      alert('Correct!');
    } else alert('Wrong!');
  }

  if(!data) return <div>Loading...</div>;
  return (
    <div style={{padding:20}}>
      <h2>Word Scramble</h2>
      <p>Scrambled: <strong>{data.scrambled}</strong></p>
      <input value={guess} onChange={e=>setGuess(e.target.value)} />
      <button onClick={check}>Check</button>
      <button onClick={load}>New</button>
    </div>
  );
}
