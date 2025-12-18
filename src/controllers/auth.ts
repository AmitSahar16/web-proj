import { Request, Response } from 'express';
import User from '../models/user';
import { IUserDTO, IAuthResponse } from '../types';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, revokeRefreshToken } from '../services/authService';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password }: IUserDTO = req.body;

    if (!username || !email || !password) {
      throw Error('Username, email, and password are required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      throw Error('User with this email or username already exists');
    }

    const user = await User.create({ username, email, password });
    
    const tokenPayload = {
      userId: user._id.toString(),
      username: user.username,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const response: IAuthResponse = {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
    };

    res.status(201).json(response);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw Error('Email and password are required');
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      throw Error('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw Error('Invalid credentials');
    }

    const tokenPayload = {
      userId: user._id.toString(),
      username: user.username,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const response: IAuthResponse = {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
    };

    res.json(response);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      revokeRefreshToken(refreshToken);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw Error('Refresh token is required');
    }

    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw Error('User not found');
    }

    const tokenPayload = {
      userId: user._id.toString(),
      username: user.username,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Revoke old refresh token
    revokeRefreshToken(refreshToken);

    const response: IAuthResponse = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
    };

    res.json(response);
  } catch (err: any) {
    res.status(401).json({ message: err.message || 'Invalid refresh token' });
  }
};

