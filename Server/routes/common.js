const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

/* POST /api/common/score
  body: { game, player, score, meta }
*/
router.post('/score', async (req, res) => {
  try {
    const { game, player='guest', score=0, meta={} } = req.body;
    const s = await Score.create({ game, playerName: player, score, meta });
    res.json({ ok:true, score: s });
  } catch(err){ res.status(500).json({ ok:false, error: err.message }); }
});

/* GET /api/common/leaderboard?game=word-guess&limit=10 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { game='word-guess', limit=10 } = req.query;
    const top = await Score.find({ game }).sort({ score: -1 }).limit(parseInt(limit));
    res.json({ ok:true, data: top });
  } catch(err){ res.status(500).json({ ok:false, error: err.message }); }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

/* POST /api/common/score
  body: { game, player, score, meta }
*/
router.post('/score', async (req, res) => {
  try {
    const { game, player='guest', score=0, meta={} } = req.body;
    const s = await Score.create({ game, player, score, meta });
    res.json({ ok:true, score: s });
  } catch(err){ res.status(500).json({ ok:false, error: err.message }); }
});

/* GET /api/common/leaderboard?game=word-guess&limit=10 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { game='word-guess', limit=10 } = req.query;
    const top = await Score.find({ game }).sort({ score: -1 }).limit(parseInt(limit));
    res.json({ ok:true, data: top });
  } catch(err){ res.status(500).json({ ok:false, error: err.message }); }
});

module.exports = router;
