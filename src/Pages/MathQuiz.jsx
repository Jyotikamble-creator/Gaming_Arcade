import React,{useEffect, useState} from 'react';
import { fetchMathQuestions, submitScore } from '../api/Api';

export default function MathQuiz(){
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(()=> load(), []);
  async function load(){
    try {
      const res = await fetchMathQuestions();
      setQuestions(res.data.questions || []);
    } catch (error) {
      console.error('Failed to load questions:', error);
      setQuestions([]);
    }
  }

  function answer(opt){
    if(questions[index].ans === opt){ setScore(s=>s+10); }
    const nextIndex = index + 1;
    if(nextIndex >= questions.length){
      submitScore({ game:'math-quiz', score, player:'guest' });
      alert('Quiz finished. Score: '+score);
      return;
    }
    setIndex(nextIndex);
  }

  if(!questions.length) return <div>Loading...</div>;
  const q = questions[index];
  return (
    <div style={{padding:20}}>
      <h2>Math Quiz</h2>
      <div>{q.q}</div>
      <div style={{marginTop:12}}>{q.options.map(o=> <button key={o} onClick={()=>answer(o)} style={{margin:6}}>{o}</button>)}</div>
      <div>Score: {score}</div>
    </div>
  );
}
