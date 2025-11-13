import React, {useEffect, useState} from 'react';
import { fetchQuiz, submitScore } from '../api/Api';

export default function Quiz(){
  const [qs, setQs] = useState([]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  useEffect(()=> load(), []);
  async function load(){ 
    try {
      const r = await fetchQuiz(); 
      setQs(r.data.questions || []);
    } catch (error) {
      console.error('Failed to load quiz:', error);
      setQs([]);
    }
  }

  function answer(opt){
    if(qs[i].ans === opt) setScore(s=>s+10);
    if(i+1 === qs.length){ submitScore({game:'quiz', playerName:'guest', score}); alert('Done: '+score); }
    else setI(i+1);
  }

  if(!qs.length) return <div>Loading...</div>;
  const q = qs[i];
  return (
    <div style={{padding:20}}>
      <h2>Quiz</h2>
      <div>{q.q}</div>
      <div>{q.options.map(o=> <button key={o} onClick={()=>answer(o)} style={{margin:6}}>{o}</button>)}</div>
      <div>Score: {score}</div>
    </div>
  );
}
