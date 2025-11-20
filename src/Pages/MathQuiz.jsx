import React,{useEffect, useState} from 'react';
import { fetchMathQuestions, submitScore } from '../api/Api';
import { logger, LogTags } from '../lib/logger';

export default function MathQuiz(){
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(()=> load(), []);
  async function load(){
    try {
      logger.info('Loading math questions', {}, LogTags.MATH_QUIZ);
      const res = await fetchMathQuestions();
      setQuestions(res.data.questions || []);
      logger.info('Math questions loaded', { count: res.data.questions?.length }, LogTags.MATH_QUIZ);
    } catch (error) {
      logger.error('Failed to load math questions', error, {}, LogTags.MATH_QUIZ);
      setQuestions([]);
    }
  }

  function answer(opt){
    const correct = questions[index].ans === opt;
    if(correct){ setScore(s=>s+10); }
    logger.debug('Math quiz answer', { questionIndex: index, correct, score: correct ? score + 10 : score }, LogTags.MATH_QUIZ);
    const nextIndex = index + 1;
    if(nextIndex >= questions.length){
      submitScore({ game:'math-quiz', score, player:'guest' });
      logger.info('Math quiz completed', { finalScore: score }, LogTags.SAVE_SCORE);
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
