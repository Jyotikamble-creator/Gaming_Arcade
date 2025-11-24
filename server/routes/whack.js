import express from 'express';

const router = express.Router();
router.get('/start', (req,res) => res.json({ gridSize: 9, duration: 30 }));
export default router;
