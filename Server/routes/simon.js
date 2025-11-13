import express from 'express';

const router = express.Router();
router.get('/start', (req,res) => {
  res.json({ colors: ['red','green','blue','yellow'], seed: Date.now() });
});
export default router;
