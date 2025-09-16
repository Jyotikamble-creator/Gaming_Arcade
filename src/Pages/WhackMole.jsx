import React, {useEffect, useState, useRef} from 'react';
import { startWhack, submitScore } from '../api/Api';

export default function WhackAMole(){
  const [grid, setGrid] = useState([]);
  const [active, setActive] = useState(null);
  const [score, setScore] = useState(0);
  const timerRef = useRef(null);

  useEffect(()=> init(), []);
  async function init(){
    const r = await startWhack();
    setGrid(Array.from({length:r.data.gridSize}, (_,i)=>i));
    setScore(0);
    // pop moles
    timerRef.current = setInterval(()=> setActive(Math.floor(Math.random()*r.data.gridSize)), 800);
    setTimeout(()=> endGame(), r.data.duration*1000);
  }

  function whack(i){
    if(i===active){ setScore(s=>s+10); setActive(null); }
  }

  async function endGame(){
    clearInterval(timerRef.current);
    await submitScore({game:'whack-a-mole', score});
    alert('Game over. Score: '+score);
  }

  return (
    <div style={{padding:20}}>
      <h2>Whack-a-Mole</h2>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3,80px)', gap:8}}>
        {grid.map(i=>(
          <div key={i} onClick={()=>whack(i)} style={{height:80,display:'flex',alignItems:'center',justifyContent:'center',background: i===active ? 'orange' : '#ddd', cursor:'pointer'}}>
            {i===active ? 'Mole' : ''}
          </div>
        ))}
      </div>
      <div>Score: {score}</div>
    </div>
  );
}
