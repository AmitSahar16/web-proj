import { Response } from 'express';
import { IAuthRequest, ICommentDTO } from '../types';
import Comment from '../models/comment';
import Post from '../models/post';
import mongoose from 'mongoose';

const isValidObjectId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

export const createComment = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { post, text }: ICommentDTO = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!post || !text) {
      res.status(400).json({ message: 'Post and text are required' });
      return;
    }

    if (!isValidObjectId(post)) {
      res.status(400).json({ message: 'Invalid post id' });
      return;
    }

    const postExists = await Post.exists({ _id: post });
    if (!postExists) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const comment = await Comment.create({ post, text, user: userId });
    await comment.populate('user', 'username email');
    await comment.populate('post', 'message');
    res.status(201).json(comment);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getComments = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const postId = req.query.post as string;

    if (postId && !isValidObjectId(postId)) {
      res.status(400).json({ message: 'Invalid post id' });
      return;
    }

    const query = postId ? { post: postId } : {};
    const comments = await Comment.find(query)
      .populate('user', 'username email')
      .populate('post', 'message')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getCommentById = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }

  try {
    const comment = await Comment.findById(id)
      .populate('user', 'username email')
      .populate('post', 'message');

    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    res.json(comment);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateComment = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }

  try {
    const updated = await Comment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('user', 'username email')
      .populate('post', 'message');

    if (!updated) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteComment = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }

  try {
    const deleted = await Comment.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    res.json({ message: 'Comment deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

