import express from 'express';

const router = express.Router();
router.get('/start', (req,res) => {
  res.json({ colors: ['red','blue','green','yellow','purple','orange','pink','cyan'], seed: Date.now() });
});
export default router;
