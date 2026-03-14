// User model for MongoDB with TypeScript
import mongoose, { Schema, Model } from 'mongoose';
// import { IUser } from '@/types/auth/auth';

// Define IUser interface locally to avoid import issues
interface IUser {
  _id?: any;
  email: string;
  passwordHash: string;
  username?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  favoriteGame?: string;
  profileCompleted?: boolean;
  role?: string;
  stats?: {
    followerCount: number;
    followingCount: number;
    totalScore: number;
    gamesPlayed: number;
  };
  meta?: Record<string, any>;
  createdAt: Date;
  lastLogin?: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  displayName: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 500 },
  avatar: { type: String, default: '' },
  favoriteGame: { type: String, default: '' },
  profileCompleted: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  stats: {
    followerCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
  },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
});

// Prevent model recompilation in development (Next.js hot reload)
const UserModel: Model<IUser> = 
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
