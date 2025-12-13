// GET /api/simon/start
// Starts a new Simon game session

import express from "express";

// Create router
const router = express.Router();
// Start Simon game
router.get("/start", (req, res) => {
  res.json({
    colors: [
      "red",
      "blue",
      "green",
      "yellow",
      "purple",
      "orange",
      "pink",
      "cyan",
    ],
    seed: Date.now(),
  });
});
export default router;
