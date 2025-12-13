// Routes for Hangman game
// Includes generating words, validating guesses, and fetching categories

import express from "express";

// Create router
const router = express.Router();

// Word categories
// Each category has an array of words
// Animals, Countries, Fruits, Technology, Sports, Nature
const WORD_CATEGORIES = {
  animals: [
    "elephant",
    "giraffe",
    "penguin",
    "dolphin",
    "kangaroo",
    "cheetah",
    "rhinoceros",
    "octopus",
    "butterfly",
    "crocodile",
    "leopard",
    "flamingo",
    "peacock",
    "hamster",
    "squirrel",
  ],
  countries: [
    "australia",
    "brazil",
    "canada",
    "denmark",
    "egypt",
    "france",
    "germany",
    "india",
    "japan",
    "mexico",
    "norway",
    "portugal",
    "sweden",
    "thailand",
    "vietnam",
  ],
  fruits: [
    "strawberry",
    "pineapple",
    "watermelon",
    "blueberry",
    "raspberry",
    "mango",
    "orange",
    "banana",
    "coconut",
    "papaya",
    "apricot",
    "kiwi",
    "lemon",
    "cherry",
    "peach",
  ],
  technology: [
    "computer",
    "keyboard",
    "software",
    "internet",
    "database",
    "algorithm",
    "programming",
    "smartphone",
    "wireless",
    "blockchain",
    "cybersecurity",
    "artificial",
    "network",
    "server",
    "laptop",
  ],
  sports: [
    "basketball",
    "football",
    "volleyball",
    "cricket",
    "baseball",
    "swimming",
    "gymnastics",
    "badminton",
    "tennis",
    "hockey",
    "archery",
    "cycling",
    "skiing",
    "surfing",
    "boxing",
  ],
  nature: [
    "mountain",
    "rainbow",
    "volcano",
    "thunder",
    "hurricane",
    "waterfall",
    "glacier",
    "desert",
    "forest",
    "ocean",
    "canyon",
    "valley",
    "river",
    "island",
    "cliff",
  ],
};

// Generate hint based on word
// Simple hints based on category and word length
function generateHint(word, category) {
  // Predefined hints per category
  const hints = {
    animals: `A ${word.length}-letter animal`,
    countries: `A ${word.length}-letter country name`,
    fruits: `A ${word.length}-letter fruit`,
    technology: `A ${word.length}-letter tech-related word`,
    sports: `A ${word.length}-letter sport or activity`,
    nature: `A ${word.length}-letter natural phenomenon or place`,
  };
  return hints[category] || `A ${word.length}-letter word`;
}

// GET /api/games/hangman/word?category=animals
// Query param: category
// Returns a random word from the specified category with a hint
router.get("/word", (req, res) => {
  try {
    // Get category from query, default to 'animals'
    const category = req.query.category || "animals";

    // Validate category
    if (!WORD_CATEGORIES[category]) {
      return res.status(400).json({
        error:
          "Invalid category. Must be one of: animals, countries, fruits, technology, sports, nature",
      });
    }

    // Select random word
    const words = WORD_CATEGORIES[category];
    // const randomWord = words[Math.floor(Math.random() * words.length)];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    // Generate hint
    const hint = generateHint(randomWord, category);

    // Send response
    res.json({
      word: randomWord.toLowerCase(),
      hint,
      category,
      length: randomWord.length,
    });
  } catch (error) {
    console.error("Error generating hangman word:", error);
    res.status(500).json({ error: "Failed to generate word" });
  }
});

// GET /api/games/hangman/categories
// Returns available word categories
// GET /api/games/hangman/categories
router.get("/categories", (req, res) => {
  try {
    // Fetch categories
    const categories = Object.keys(WORD_CATEGORIES).map((category) => ({
      name: category,
      wordCount: WORD_CATEGORIES[category].length,
    }));

    // Respond with categories
    res.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// POST /api/games/hangman/validate
// Body: { word: "elephant", guessedLetters: ["e", "l", "p", "h", "a", "n", "t"] }
router.post("/validate", (req, res) => {
  try {
    // Extract word and guessedLetters from body
    const { word, guessedLetters } = req.body;

    // Validate input
    if (!word || !Array.isArray(guessedLetters)) {
      return res.status(400).json({
        error: "Missing required fields: word, guessedLetters (array)",
      });
    }

    // Check if word is complete
    const wordLetters = word.toLowerCase().split("");
    // const isComplete = guessedLetters.every(letter => wordLetters.includes(letter));
    const isComplete = wordLetters.every((letter) =>
      guessedLetters.includes(letter.toLowerCase())
    );
    // Count wrong guesses
    const wrongGuesses = guessedLetters.filter(
      (letter) => !wordLetters.includes(letter)
    );

    // Respond with result
    res.json({
      isComplete,
      wrongGuessCount: wrongGuesses.length,
      word: word.toLowerCase(),
    });
  } catch (error) {
    console.error("Error validating hangman:", error);
    res.status(500).json({ error: "Failed to validate" });
  }
});

export default router;
