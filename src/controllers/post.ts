import { Response } from 'express';
import { IAuthRequest, IPostDTO } from '../types';
import Post from '../models/post';
import mongoose from 'mongoose';

const isValidObjectId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

export const createPost = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { message }: IPostDTO = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw Error('Unauthorized');
    }

    if (!message) {
      throw Error('Message is required');
    }

    const post = await Post.create({ message, user: userId });
    await post.populate('user', 'username email');

    res.status(201).json(post);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getPosts = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.query.user as string;
    const query = userId ? { user: userId } : {};
    const posts = await Post.find(query).populate('user', 'username email').sort({ createdAt: -1 });

    res.json(posts);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getPostById = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    if (!isValidObjectId(id)) {
      throw Error('Invalid id');
    }

    const post = await Post.findById(id).populate('user', 'username email');

    if (!post) {
      throw Error('Post not found');
    }

    res.json(post);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePost = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    if (!isValidObjectId(id)) {
      throw Error('Invalid id');
    }

    const updated = await Post.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('user', 'username email');

    if (!updated) {
      throw Error('Post not found');
    }

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deletePost = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    if (!isValidObjectId(id)) {
      throw Error('Invalid id');
    }

    const deleted = await Post.findByIdAndDelete(id);

    if (!deleted) {
      throw Error('Post not found');
    }

    res.json({ message: 'Post deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

