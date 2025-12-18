import { Response } from 'express';
import { IAuthRequest, ICommentDTO } from '../types';
import Comment from '../models/comment';
import Post from '../models/post';
import { create, getAll, getById, updateById, deleteById, isValidObjectId } from './utils/controllerUtils';

export const createComment = async (req: IAuthRequest, res: Response): Promise<void> => {
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

  const body = { post, text, user: userId };
  await create(Comment, body, res, undefined, ['user', 'post']);
};

export const getComments = async (req: IAuthRequest, res: Response): Promise<void> => {
  const postId = req.query.post as string;

  if (postId && !isValidObjectId(postId)) {
    res.status(400).json({ message: 'Invalid post id' });
    return;
  }

  const query = postId ? { post: postId } : {};
  await getAll(Comment, res, query, ['user', 'post']);
};

export const getCommentById = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await getById(Comment, id, res, ['user', 'post']);
};

export const updateComment = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await updateById(Comment, id, req.body, res, ['user', 'post']);
};

export const deleteComment = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await deleteById(Comment, id, res);
};

