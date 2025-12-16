import { Request } from 'express';
import { Document } from 'mongoose';

// User types
export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserDTO {
  username: string;
  email: string;
  password: string;
}

// Post types
export interface IPost extends Document {
  _id: string;
  message: string;
  user: string; // User ID reference
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostDTO {
  message: string;
}

// Comment types
export interface IComment extends Document {
  _id: string;
  post: string; // Post ID reference
  text: string;
  user: string; // User ID reference
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentDTO {
  post: string;
  text: string;
}

// Auth types
export interface IAuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

export interface ITokenPayload {
  userId: string;
  username: string;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

