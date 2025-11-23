import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  displayName: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 500 },
  avatar: { type: String, default: '' },
  favoriteGame: { type: String, default: '' },
  profileCompleted: { type: Boolean, default: false },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
})

export default mongoose.model('User', UserSchema)
