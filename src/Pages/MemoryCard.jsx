import React, {useEffect, useState} from 'react';
import { startMemory, submitScore } from '../api/Api';

export default function MemoryCard(){
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(null);

  useEffect(()=> start(), []);
  async function start(){
    try {
      const res = await startMemory();
      setCards(res.data.cards || []); 
      setFlipped([]); 
      setMatched([]); 
      setMoves(0); 
      setStartTime(Date.now());
    } catch (error) {
      console.error('Failed to start memory game:', error);
      setCards([]);
    }
  }

  function flipCard(id){
    if(flipped.includes(id) || matched.includes(id)) return;
    const next = [...flipped, id];
    setFlipped(next);
    if(next.length===2){
      setMoves(m=>m+1);
      const a = cards.find(c=>c.id===next[0]).value;
      const b = cards.find(c=>c.id===next[1]).value;
      if(a===b){ 
        const newMatched = [...matched, ...next];
        setMatched(newMatched); 
        setFlipped([]); 
        if(newMatched.length===cards.length){ 
          setTimeout(() => onWin(), 500); 
        } 
      }
      else setTimeout(()=> setFlipped([]), 800);
    }
  }

  async function onWin(){
    const time = Math.floor((Date.now()-startTime)/1000);
    const score = Math.max(0, 100 - moves*2 - time);
    await submitScore({ game:'memory-card', player:'guest', score, meta:{moves, time} });
    alert('You Won! score: '+score);
  }

  return (
    <div style={{padding:20}}>
      <h2>Memory Card</h2>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,80px)', gap:10}}>
        {cards.map(card => (
          <div key={card.id} onClick={()=>flipCard(card.id)} style={{width:80,height:80,display:'flex',alignItems:'center',justifyContent:'center',background:'#eee',fontSize:24,border:'1px solid #ccc',cursor:'pointer'}}>
            {flipped.includes(card.id) || matched.includes(card.id) ? card.value : '❓'}
          </div>
        ))}
      </div>
      <div>Moves: {moves}</div>
      <button onClick={start}>Restart</button>
    </div>
  );
}
