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
      throw Error('Unauthorized');
    }

    if (!post || !text) {
      throw Error('Post and text are required');
    }

    if (!isValidObjectId(post)) {
      throw Error('Invalid post id');
    }

    const postExists = await Post.exists({ _id: post });

    if (!postExists) {
      throw Error('Post not found');
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
      throw Error('Invalid post id');
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

  try {
    if (!isValidObjectId(id)) {
      throw Error('Invalid id');
    }

    const comment = await Comment.findById(id)
      .populate('user', 'username email')
      .populate('post', 'message');

    if (!comment) {
      throw Error('Comment not found');
    }

    res.json(comment);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateComment = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    if (!isValidObjectId(id)) {
      throw Error('Invalid id');
    }

    const updated = await Comment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('user', 'username email')
      .populate('post', 'message');

    if (!updated) {
      throw Error('Comment not found');
    }

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteComment = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    if (!isValidObjectId(id)) {
      throw Error('Invalid id');
    }

    const deleted = await Comment.findByIdAndDelete(id);

    if (!deleted) {
      throw Error('Comment not found');
    }

    res.json({ message: 'Comment deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

