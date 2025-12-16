import { Response } from 'express';
import { IAuthRequest } from '../types';
import User from '../models/user';
import mongoose from 'mongoose';

const isValidObjectId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

export const createUser = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: 'Username, email, and password are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email or username already exists' });
      return;
    }

    const user = await User.create({ username, email, password });
    const userResponse = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    res.status(201).json(userResponse);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getUsers = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    const usersResponse = users.map((user) => ({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
    res.json(usersResponse);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserById = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }

  try {
    const user = await User.findById(id).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const userResponse = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    res.json(userResponse);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }

  try {
    const { password, ...updateData } = req.body;

    // If password is being updated, hash it
    const updatePayload: any = { ...updateData };
    if (password) {
      updatePayload.password = password; // Will be hashed by pre-save hook
    }

    const updated = await User.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!updated) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const userResponse = {
      id: updated._id.toString(),
      username: updated.username,
      email: updated.email,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
    res.json(userResponse);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteUser = async (req: IAuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }

  try {
    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ message: 'User deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

