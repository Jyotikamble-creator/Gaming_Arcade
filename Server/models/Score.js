const mongoose = require('mongoose')

const ScoreSchema = new mongoose.Schema({
  game: { type: String, required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  playerName: { type: String, default: 'guest' },
  score: { type: Number, required: true },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Score', ScoreSchema)
const mongoose = require('mongoose')

const ScoreSchema = new mongoose.Schema({
  game: { type: String, required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  playerName: { type: String, default: 'guest' },
  score: { type: Number, required: true },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Score', ScoreSchema)
const mongoose = require('mongoose');
const ScoreSchema = new mongoose.Schema({
  game: { type: String, required: true },
  player: { type: String, default: 'guest' },
  score: { type: Number, default: 0 },
  meta: { type: Object, default: {} }, // optional: time, moves, wpm etc
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Score', ScoreSchema);
