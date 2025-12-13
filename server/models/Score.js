// the Score model defines the structure of score documents in the database
// it includes fields for game identification, user reference, player name, score value, metadata, and creation timestamp

import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema({
  game: { type: String, required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  playerName: { type: String, default: "guest" },
  score: { type: Number, required: true },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Score", ScoreSchema);
