// MongoDB model for Score with TypeScript
import mongoose, { Schema, Model } from 'mongoose';
// import { IScore } from '@/types/common/score';

// Define IScore interface locally to avoid import issues
interface IScore {
  _id?: any;
  game: string;
  user?: any;
  playerName: string;
  score: number;
  meta: Record<string, any>;
  createdAt: Date;
}

const ScoreSchema = new Schema<IScore>({
  game: { type: String, required: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  playerName: { type: String, default: 'guest' },
  score: { type: Number, required: true },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
});

// Indexes for better query performance
ScoreSchema.index({ game: 1, score: -1 });
ScoreSchema.index({ playerName: 1, createdAt: -1 });
ScoreSchema.index({ createdAt: -1 });

// Prevent model recompilation in development (Next.js hot reload)
const ScoreModel: Model<IScore> = 
  mongoose.models.Score || mongoose.model<IScore>('Score', ScoreSchema);

export default ScoreModel;
