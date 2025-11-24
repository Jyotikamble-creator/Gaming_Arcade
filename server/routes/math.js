import express from 'express';

const router = express.Router();

function generateMathQuestion() {
  const operations = ['+', '-', '*'];
  const op = operations[Math.floor(Math.random() * operations.length)];
  let a, b, ans;
  if (op === '+') {
    a = Math.floor(Math.random() * 50) + 1;
    b = Math.floor(Math.random() * 50) + 1;
    ans = a + b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * 50) + 10;
    b = Math.floor(Math.random() * a) + 1;
    ans = a - b;
  } else {
    a = Math.floor(Math.random() * 10) + 1;
    b = Math.floor(Math.random() * 10) + 1;
    ans = a * b;
  }
  const q = `${a} ${op} ${b} = ?`;
  const options = [ans, ans + Math.floor(Math.random() * 10) + 1, ans - Math.floor(Math.random() * 10) + 1, ans + Math.floor(Math.random() * 20) - 10].filter((val, idx, arr) => arr.indexOf(val) === idx); // unique
  while (options.length < 4) {
    const extra = ans + Math.floor(Math.random() * 20) - 10;
    if (!options.includes(extra)) options.push(extra);
  }
  options.sort(() => Math.random() - 0.5);
  return { q, options, ans: ans.toString() };
}

router.get('/questions', (req,res) => {
  const questions = [];
  for (let i = 0; i < 10; i++) {
    questions.push({ id: i + 1, ...generateMathQuestion() });
  }
  res.json({ questions });
});

export default router;
