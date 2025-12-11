import express from 'express';

const router = express.Router();

// Generate a math problem based on difficulty
function generateProblem(difficulty = 'medium') {
  const operations = ['+', '-', '*'];
  let a, b, op, answer;

  if (difficulty === 'easy') {
    op = Math.random() > 0.5 ? '+' : '-';
    if (op === '+') {
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      answer = a + b;
    } else {
      a = Math.floor(Math.random() * 30) + 10;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
    }
  } else if (difficulty === 'medium') {
    op = operations[Math.floor(Math.random() * operations.length)];
    if (op === '+') {
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      answer = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 100) + 20;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
    } else {
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 12) + 1;
      answer = a * b;
    }
  } else { // hard
    op = operations[Math.floor(Math.random() * operations.length)];
    if (op === '+') {
      a = Math.floor(Math.random() * 100) + 50;
      b = Math.floor(Math.random() * 100) + 50;
      answer = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 200) + 50;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
    } else {
      a = Math.floor(Math.random() * 20) + 5;
      b = Math.floor(Math.random() * 20) + 5;
      answer = a * b;
    }
  }

  return {
    question: `${a} ${op} ${b}`,
    answer: answer,
    operation: op
  };
}

// GET /api/games/speed-math/problem?difficulty=easy|medium|hard
router.get('/problem', (req, res) => {
  try {
    const difficulty = req.query.difficulty || 'medium';
    
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty. Must be easy, medium, or hard.' });
    }

    const problem = generateProblem(difficulty);
    res.json({ problem });
  } catch (error) {
    console.error('Error generating problem:', error);
    res.status(500).json({ error: 'Failed to generate problem' });
  }
});

// POST /api/games/speed-math/validate
// Body: { question: "5 + 3", userAnswer: 8, correctAnswer: 8 }
router.post('/validate', (req, res) => {
  try {
    const { question, userAnswer, correctAnswer } = req.body;

    if (!question || userAnswer === undefined || correctAnswer === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: question, userAnswer, correctAnswer' 
      });
    }

    const isCorrect = parseInt(userAnswer) === parseInt(correctAnswer);

    res.json({
      isCorrect,
      userAnswer: parseInt(userAnswer),
      correctAnswer: parseInt(correctAnswer),
      question
    });
  } catch (error) {
    console.error('Error validating answer:', error);
    res.status(500).json({ error: 'Failed to validate answer' });
  }
});

// GET /api/games/speed-math/batch?difficulty=medium&count=10
// Generate multiple problems at once for offline play
router.get('/batch', (req, res) => {
  try {
    const difficulty = req.query.difficulty || 'medium';
    const count = parseInt(req.query.count) || 10;

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty. Must be easy, medium, or hard.' });
    }

    if (count < 1 || count > 50) {
      return res.status(400).json({ error: 'Count must be between 1 and 50.' });
    }

    const problems = [];
    for (let i = 0; i < count; i++) {
      problems.push(generateProblem(difficulty));
    }

    res.json({ problems, difficulty, count });
  } catch (error) {
    console.error('Error generating batch problems:', error);
    res.status(500).json({ error: 'Failed to generate problems' });
  }
});

export default router;
