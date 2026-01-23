// User model for MongoDB with TypeScript
import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '@/types/auth/auth';

const UserSchema = new Schema<IUser>({
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
  lastLogin: { type: Date, default: Date.now },
});

// Prevent model recompilation in development (Next.js hot reload)
const UserModel: Model<IUser> = 
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
