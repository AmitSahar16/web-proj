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
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!message) {
      res.status(400).json({ message: 'Message is required' });
      return;
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

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }

  try {
    const post = await Post.findById(id).populate('user', 'username email');

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    res.json(post);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePost = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }

  try {
    const updated = await Post.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('user', 'username email');

    if (!updated) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deletePost = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }

  try {
    const deleted = await Post.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    res.json({ message: 'Post deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

