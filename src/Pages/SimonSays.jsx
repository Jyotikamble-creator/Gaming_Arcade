import React, {useEffect, useState} from 'react';
import { startSimon, submitScore } from '../api/Api';

export default function SimonSays(){
  const [colors, setColors] = useState([]);
  const [seq, setSeq] = useState([]);
  const [playerSeq, setPlayerSeq] = useState([]);
  const [round, setRound] = useState(0);

  useEffect(()=> init(), []);
  async function init(){
    try {
      const r = await startSimon();
      setColors(r.data.colors || ['red', 'blue', 'green', 'yellow']);
      nextRound([]);
    } catch (error) {
      console.error('Failed to start Simon Says:', error);
      setColors(['red', 'blue', 'green', 'yellow']);
      nextRound([]);
    }
  }

  function nextRound(prev){
    const next = [...prev, colors[Math.floor(Math.random()*colors.length)]];
    setSeq(next);
    setPlayerSeq([]);
    setRound(next.length);
    // show to user (skip animation for simplicity)
    alert('Sequence: '+next.join(','));
  }

  function press(c){
    const pos = playerSeq.length;
    const newSeq = [...playerSeq, c];
    setPlayerSeq(newSeq);
    if(seq[pos] !== c){ alert('Wrong!'); submitScore({game:'simon-says', score: round-1}); init(); }
    else if(newSeq.length === seq.length){ if(newSeq.length===10){ submitScore({game:'simon-says', score: 100}); alert('You win!'); init(); } else nextRound(seq); }
  }

  return (
    <div style={{padding:20}}>
      <h2>Simon Says</h2>
      {colors.map(c=> <button key={c} onClick={()=>press(c)} style={{margin:6}}>{c}</button>)}
      <div>Round: {round}</div>
    </div>
  );
}
