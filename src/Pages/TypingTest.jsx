import React, {useEffect, useState, useRef} from 'react';
import { fetchTypingPassage, submitScore } from '../api/Api';

export default function TypingTest(){
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(()=> load(), []);
  async function load(){ const res = await fetchTypingPassage(); setText(res.data.text); }

  function onChange(e){
    if(!startTime) setStartTime(Date.now());
    setInput(e.target.value);
    if(e.target.value.trim() === text.trim()){ finish(); }
  }

  async function finish(){
    setDone(true);
    const seconds = (Date.now()-startTime)/1000;
    const words = text.split(/\s+/).length;
    const wpm = Math.round((words / seconds)*60);
    await submitScore({ game:'typing-test', score: wpm, meta:{seconds, words} });
    alert('WPM: '+wpm);
  }

  return (
    <div style={{padding:20}}>
      <h2>Typing Test</h2>
      <p>{text}</p>
      <textarea value={input} onChange={onChange} rows={4} cols={60} disabled={done}></textarea>
      <div>{done ? 'Done' : 'Typing...'}</div>
    </div>
  );
}
