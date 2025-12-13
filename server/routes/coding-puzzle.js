// Routes for coding puzzles: fetching puzzles, validating answers, and categories
import express from "express";

// Create router
const router = express.Router();

// Puzzle categories
// Each category has an array of puzzles with question, answer, hint, and difficulty
const PUZZLE_CATEGORIES = {
  patterns: [
    {
      question: "What comes next in the sequence? 2, 4, 8, 16, 32, ?",
      answer: "64",
      hint: "Each number is multiplied by 2",
      difficulty: "easy",
    },
    {
      question: "Complete the pattern: 1, 1, 2, 3, 5, 8, 13, ?",
      answer: "21",
      hint: "Fibonacci sequence - add previous two numbers",
      difficulty: "medium",
    },
    {
      question: "What's next? 100, 90, 81, 73, 66, ?",
      answer: "60",
      hint: "Subtract 10, then 9, then 8, then 7, then 6...",
      difficulty: "medium",
    },
    {
      question: "Find the missing number: 3, 9, 27, 81, ?",
      answer: "243",
      hint: "Each number is multiplied by 3",
      difficulty: "easy",
    },
    {
      question: "Continue the sequence: 1, 4, 9, 16, 25, ?",
      answer: "36",
      hint: "Perfect squares: 1², 2², 3², 4², 5², ?",
      difficulty: "easy",
    },
  ],

  // Logical reasoning puzzles
  // Each puzzle has question, answer, hint, and difficulty
  codeOutput: [
    {
      question: "What does this print?\nfor i in range(3):\n    print(i * 2)",
      answer: "0 2 4",
      hint: "Loop runs 3 times (0,1,2), each multiplied by 2",
      difficulty: "easy",
    },
    {
      question: "What's the output?\nx = 5\ny = x + 3\nprint(x * y)",
      answer: "40",
      hint: "x=5, y=8, so 5*8=40",
      difficulty: "easy",
    },
    {
      question:
        "Predict the result:\nlist = [1, 2, 3]\nprint(list[1] + list[2])",
      answer: "5",
      hint: "Index 1 is 2, index 2 is 3. 2+3=5",
      difficulty: "easy",
    },
    {
      question:
        "What prints?\ncount = 0\nfor i in range(5):\n    if i % 2 == 0:\n        count += 1\nprint(count)",
      answer: "3",
      hint: "Count even numbers: 0, 2, 4 (3 total)",
      difficulty: "medium",
    },
    {
      question:
        "Output?\nresult = 1\nfor i in range(1, 4):\n    result *= i\nprint(result)",
      answer: "6",
      hint: "Factorial: 1*1*2*3=6",
      difficulty: "medium",
    },
  ],
  // Logical reasoning puzzles
  // Each puzzle has question, answer, hint, and difficulty
  logic: [
    {
      question:
        "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?",
      answer: "yes",
      hint: "Follow the chain: Bloops → Razzies → Lazzies",
      difficulty: "easy",
    },
    {
      question:
        "A bat and ball cost $1.10. The bat costs $1 more than the ball. How much does the ball cost? (in cents)",
      answer: "5",
      hint: "If ball = x, bat = x+100, so x + x+100 = 110",
      difficulty: "hard",
    },
    {
      question: "How many times can you subtract 10 from 100?",
      answer: "1",
      hint: "After first subtraction, it's not 100 anymore",
      difficulty: "easy",
    },
    {
      question:
        "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
      answer: "5",
      hint: "Each machine makes 1 widget in 5 minutes",
      difficulty: "medium",
    },
    {
      question:
        "What's the minimum number of cuts needed to divide a cake into 8 equal pieces?",
      answer: "3",
      hint: "Cut vertically twice (4 pieces), then horizontally once",
      difficulty: "medium",
    },
  ],
  // Bitwise operation puzzles
  // Each puzzle has question, answer, hint, and difficulty
  bitwise: [
    {
      question: "What is 5 & 3 in binary operation? (AND operation)",
      answer: "1",
      hint: "5=101, 3=011, AND gives 001 = 1",
      difficulty: "hard",
    },
    {
      question: "What is 6 | 3 in binary operation? (OR operation)",
      answer: "7",
      hint: "6=110, 3=011, OR gives 111 = 7",
      difficulty: "hard",
    },
    {
      question: "What is 5 ^ 3 in binary operation? (XOR operation)",
      answer: "6",
      hint: "5=101, 3=011, XOR gives 110 = 6",
      difficulty: "hard",
    },
    {
      question: "What is 8 >> 2? (Right shift by 2)",
      answer: "2",
      hint: "8=1000, shift right by 2 gives 10 = 2",
      difficulty: "hard",
    },
    {
      question: "What is 3 << 2? (Left shift by 2)",
      answer: "12",
      hint: "3=11, shift left by 2 gives 1100 = 12",
      difficulty: "hard",
    },
  ],
};

// Get random puzzle from category
// returns a random puzzle object from the specified category
router.get("/puzzle/:category", (req, res) => {
  try {
    // Get category from params
    const { category } = req.params;

    // Validate category
    if (!PUZZLE_CATEGORIES[category]) {
      return res.status(400).json({ error: "Invalid category" });
    }
    // Select random puzzle
    const puzzles = PUZZLE_CATEGORIES[category];
    const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    // Respond with puzzle
    res.json({
      success: true,
      puzzle: randomPuzzle,
    });
  } catch (error) {
    console.error("Error getting puzzle:", error);
    res.status(500).json({ error: "Failed to get puzzle" });
  }
});

// Get all categories
// returns an array of category objects
router.get("/categories", (req, res) => {
  try {
    // Get all categories
    // Map categories to include id, name, and count of puzzles
    const categories = Object.keys(PUZZLE_CATEGORIES).map((key) => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      count: PUZZLE_CATEGORIES[key].length,
    }));

    // Respond with categories
    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({ error: "Failed to get categories" });
  }
});

// Validate answer
// returns a boolean indicating whether the answer is correct
router.post("/validate", (req, res) => {
  try {
    // Get answer and correctAnswer from body
    const { answer, correctAnswer } = req.body;

    // Validate input
    if (!answer || !correctAnswer) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if answer is correct
    const isCorrect =
      answer.trim().toLowerCase() === correctAnswer.toLowerCase();
    // Respond with result
    res.json({
      success: true,
      isCorrect,
    });
  } catch (error) {
    console.error("Error validating answer:", error);
    res.status(500).json({ error: "Failed to validate answer" });
  }
});

export default router;
