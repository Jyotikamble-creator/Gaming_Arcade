import React, {useEffect, useState} from 'react';
import { fetchEmoji, submitScore } from '../api/Api';

export default function EmojiGuess(){
  const [p, setP] = useState(null);
  const [g, setG] = useState('');
  useEffect(()=> load(), []);
  async function load(){ const r = await fetchEmoji(); setP(r.data); setG(''); }
  async function check(){
    if(g.trim().toLowerCase() === p.answer.toLowerCase()){
      await submitScore({game:'emoji-guess', score:100});
      alert('Correct!');
    } else alert('Try again');
  }
  if(!p) return <div>Loading...</div>;
  return (
    <div style={{padding:20}}>
      <h2>Emoji Guess</h2>
      <div style={{fontSize:40}}>{p.emojis}</div>
      <input value={g} onChange={e=>setG(e.target.value)} />
      <button onClick={check}>Check</button>
      <button onClick={load}>New</button>
    </div>
  );
}
