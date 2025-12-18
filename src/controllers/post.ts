import { Response } from 'express';
import { IAuthRequest, IPostDTO } from '../types';
import Post from '../models/post';
import { create, getAll, getById, updateById, deleteById } from './utils/controllerUtils';

export const createPost = async (req: IAuthRequest, res: Response): Promise<void> => {
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

  const body = { message, user: userId };
  await create(Post, body, res, undefined, 'user');
};

export const getPosts = async (req: IAuthRequest, res: Response): Promise<void> => {
  const userId = req.query.user as string;
  const query = userId ? { user: userId } : {};
  await getAll(Post, res, query, 'user');
};

export const getPostById = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await getById(Post, id, res, 'user');
};

export const updatePost = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await updateById(Post, id, req.body, res, 'user');
};

export const deletePost = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await deleteById(Post, id, res);
};

