// wordgame/server/routes/math.js
// Routes for Math Quiz game
// Provides math questions for quizzes
import express from "express";

// Create router
const router = express.Router();

// Generate a simple math question
function generateMathQuestion() {
  // Generate a simple math question
  const operations = ["+", "-", "*"];
  // Randomly pick operation
  const op = operations[Math.floor(Math.random() * operations.length)];
  // Generate question
  let a, b, ans;
  if (op === "+") {
    a = Math.floor(Math.random() * 50) + 1;
    b = Math.floor(Math.random() * 50) + 1;
    ans = a + b;
  } else if (op === "-") {
    a = Math.floor(Math.random() * 50) + 10;
    b = Math.floor(Math.random() * a) + 1;
    ans = a - b;
  } else {
    a = Math.floor(Math.random() * 10) + 1;
    b = Math.floor(Math.random() * 10) + 1;
    ans = a * b;
  }
  // Create question string and options
  const q = `${a} ${op} ${b} = ?`;
  // Generate options
  const options = [
    ans,
    ans + Math.floor(Math.random() * 10) + 1,
    ans - Math.floor(Math.random() * 10) + 1,
    ans + Math.floor(Math.random() * 20) - 10,
  ].filter((val, idx, arr) => arr.indexOf(val) === idx); // unique
  // Add extra options
  while (options.length < 4) {
    const extra = ans + Math.floor(Math.random() * 20) - 10;
    if (!options.includes(extra)) options.push(extra);
  }
  // Shuffle options
  options.sort(() => Math.random() - 0.5);
  return { q, options, ans: ans.toString() };
}

// GET /api/games/math/questions
// Generate 10 math questions
router.get("/questions", (req, res) => {
  // Generate 10 math questions
  const questions = [];
  for (let i = 0; i < 10; i++) {
    questions.push({ id: i + 1, ...generateMathQuestion() });
  }
  res.json({ questions });
});

export default router;
