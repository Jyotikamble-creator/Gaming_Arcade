// Routes for Whack-a-Mole game
import express from "express";

// Create router
const router = express.Router();
// Start Whack-a-Mole game
router.get("/start", (req, res) => res.json({ gridSize: 9, duration: 30 }));
export default router;
