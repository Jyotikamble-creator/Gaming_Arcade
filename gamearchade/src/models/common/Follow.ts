// Follow model — tracks follow relationships between users
import mongoose, { Schema, Model, Types } from 'mongoose';

export interface IFollow {
  follower: Types.ObjectId;   // the user who follows
  following: Types.ObjectId;  // the user being followed
  createdAt: Date;
}

const FollowSchema = new Schema<IFollow>({
  follower: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  following: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

// Unique compound index — enforce one follow relationship per pair
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

const FollowModel: Model<IFollow> =
  mongoose.models.Follow || mongoose.model<IFollow>('Follow', FollowSchema);

export default FollowModel;
