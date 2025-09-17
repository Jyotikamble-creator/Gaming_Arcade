const express = require('express');
const router = express.Router();

const questions = [
  { id:1, q: 'If x+2=7, x^2 = ?', options: ['25','35','20','49'], ans:'25' },
  { id:2, q: 'Solve: 5*(2+3)-4^2 = ?', options:['5','9','1','-3'], ans:'5' },
  { id:3, q: 'What is 15% of 200?', options:['20','30','15','25'], ans:'30' },
  { id:4, q: 'Tricky: (1/2 + 1/3) * 6 = ?', options:['4','3','2','5'], ans:'4' }
];

router.get('/questions', (req,res) => {
  res.json({ questions });
});

module.exports = router;
