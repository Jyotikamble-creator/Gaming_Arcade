const express = require('express');
const router = express.Router();
router.get('/start', (req,res) => res.json({ gridSize: 9, duration: 30 }));
module.exports = router;
const express = require('express');
const router = express.Router();
router.get('/start', (req,res) => res.json({ gridSize: 9, duration: 30 })); // frontend uses this
module.exports = router;
