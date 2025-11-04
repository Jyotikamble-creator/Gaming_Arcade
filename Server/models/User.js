const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String },
  profileCompleted: { type: Boolean, default: false },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('User', UserSchema)
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String },
  profileCompleted: { type: Boolean, default: false },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('User', UserSchema)
