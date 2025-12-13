// Routes for Quiz game
import express from "express";

// Create router
const router = express.Router();

// Array of questions
// Each question has id, q (question), options (array), ans (correct answer)
const questions = [
  { id: 1, q: "What is 2+2?", options: ["3", "4", "5", "6"], ans: "4" },
  {
    id: 2,
    q: "Capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    ans: "Paris",
  },
  {
    id: 3,
    q: "Color of sky?",
    options: ["Red", "Blue", "Green", "Yellow"],
    ans: "Blue",
  },
  {
    id: 4,
    q: "What is the largest planet in our solar system?",
    options: ["Mars", "Jupiter", "Saturn", "Venus"],
    ans: "Jupiter",
  },
  {
    id: 5,
    q: "Who painted the Mona Lisa?",
    options: [
      "Vincent van Gogh",
      "Pablo Picasso",
      "Leonardo da Vinci",
      "Michelangelo",
    ],
    ans: "Leonardo da Vinci",
  },
  {
    id: 6,
    q: "What is the chemical symbol for water?",
    options: ["H2O", "CO2", "O2", "NaCl"],
    ans: "H2O",
  },
  {
    id: 7,
    q: 'Which programming language is known as the "mother of all languages"?',
    options: ["Python", "C", "Assembly", "Java"],
    ans: "C",
  },
  {
    id: 8,
    q: "What is the square root of 144?",
    options: ["10", "12", "14", "16"],
    ans: "12",
  },
  {
    id: 9,
    q: "Which ocean is the largest?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    ans: "Pacific",
  },
  {
    id: 10,
    q: "What year did World War II end?",
    options: ["1944", "1945", "1946", "1947"],
    ans: "1945",
  },
  {
    id: 11,
    q: "Which element has atomic number 1?",
    options: ["Helium", "Hydrogen", "Lithium", "Beryllium"],
    ans: "Hydrogen",
  },
  {
    id: 12,
    q: "What is the capital of Japan?",
    options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
    ans: "Tokyo",
  },
  {
    id: 13,
    q: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    ans: "Mars",
  },
];

// GET /api/games/quiz/questions
// Get all questions
router.get("/questions", (req, res) => {
  res.json({ questions });
});

export default router;
