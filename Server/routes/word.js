import express from 'express';

const router = express.Router();

const sampleWords = [
  { word: 'HELLO', description: 'A common greeting' },
  { word: 'WORLD', description: 'Our planet' },
  { word: 'JAVASCRIPT', description: 'Web language' },
  { word: 'REACT', description: 'UI library' },
  { word: 'PROGRAMMING', description: 'Coding' },
  { word: 'GEEKSFORGEEKS', description: 'Site' },
  { word: 'COMPUTER', description: 'Electronic device' },
  { word: 'ALGORITHM', description: 'Step-by-step procedure' },
  { word: 'DATABASE', description: 'Data storage' },
  { word: 'NETWORK', description: 'Connected systems' },
  { word: 'SECURITY', description: 'Protection' },
  { word: 'FRONTEND', description: 'User interface' },
  { word: 'BACKEND', description: 'Server side' },
  { word: 'FRAMEWORK', description: 'Software structure' },
  { word: 'LIBRARY', description: 'Reusable code' },
  { word: 'VARIABLE', description: 'Data holder' },
  { word: 'FUNCTION', description: 'Code block' },
  { word: 'ARRAY', description: 'Data collection' },
  { word: 'OBJECT', description: 'Data structure' },
  { word: 'STRING', description: 'Text data' },
  { word: 'NUMBER', description: 'Numeric data' },
  { word: 'BOOLEAN', description: 'True or false' },
  { word: 'CONDITION', description: 'Decision maker' },
  { word: 'LOOP', description: 'Repetition' },
  { word: 'CLASS', description: 'Blueprint' },
  { word: 'METHOD', description: 'Function in class' },
  { word: 'INHERITANCE', description: 'Class extension' },
  { word: 'POLYMORPHISM', description: 'Multiple forms' },
  { word: 'ENCRYPTION', description: 'Data protection' },
  { word: 'DECRYPTION', description: 'Data unlocking' },
  { word: 'AUTHENTICATION', description: 'Identity verification' },
  { word: 'AUTHORIZATION', description: 'Access control' }
];

router.get('/words', (req,res) => {
  // Return all words for now, frontend can randomize
  res.json(sampleWords);
});

export default router;
