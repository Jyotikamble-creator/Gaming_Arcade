const express = require('express');
const router = express.Router();
router.get('/start', (req,res) => {
  res.json({ colors: ['red','green','blue','yellow'], seed: Date.now() });
});
module.exports = router;
