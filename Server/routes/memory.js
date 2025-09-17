const express = require('express');
const router = express.Router();

function shuffle(a){ return a.sort(()=> Math.random()-0.5) }

router.get('/start', (req,res) => {
  // example small deck
  const pairs = ['🍎','🍌','🍇','🍊'];
  let cards = pairs.concat(pairs).map((c,i)=>({ id:i, value:c, matched:false }));
  cards = shuffle(cards);
  res.json({ cards });
});

module.exports = router;
