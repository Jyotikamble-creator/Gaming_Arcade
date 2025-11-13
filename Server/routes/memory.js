import express from 'express';

const router = express.Router();

function shuffle(a){ return a.sort(()=> Math.random()-0.5) }

router.get('/start', (req,res) => {
  const pairs = ['🍎','🍌','🍇','🍊'];
  let cards = pairs.concat(pairs).map((c,i)=>({ id:i, value:c, matched:false }));
  cards = shuffle(cards);
  res.json({ cards });
});

export default router;
