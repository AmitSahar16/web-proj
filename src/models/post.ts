import { Schema, model } from 'mongoose';
import { IPost } from '../types';

const postSchema = new Schema<IPost>(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IPost>('Post', postSchema, 'posts');

