import { Response } from 'express';
import { IAuthRequest } from '../types';
import User from '../models/user';
import { create, getAll, getById, updateById, deleteById } from './utils/controllerUtils';

export const createUser = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ message: 'Username, email, and password are required' });
    return;
  }

  const body = { username, email, password };
  const filterFindOne = { $or: [{ email }, { username }] };

  await create(User, body, res, filterFindOne);
};

export const getUsers = async (_req: IAuthRequest, res: Response): Promise<void> => {
  await getAll(User, res, undefined, undefined, '-password');
};

export const getUserById = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await getById(User, id, res, undefined, '-password');
};

export const updateUser = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { password, ...updateData } = req.body;
  
  const updatePayload: any = { ...updateData };

  if (password) {
    updatePayload.password = password;
  }

  await updateById(User, id, updatePayload, res, undefined, '-password');
};

export const deleteUser = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  await deleteById(User, id, res);
};

