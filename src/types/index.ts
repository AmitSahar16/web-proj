import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
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

export interface IPost extends Document {
  _id: Types.ObjectId;
  message: string;
  user: Types.ObjectId; // user id reference
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostDTO {
  message: string;
}

export interface IComment extends Document {
  _id: Types.ObjectId;
  post: Types.ObjectId; // post id reference
  text: string;
  user: Types.ObjectId; // user id reference
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentDTO {
  post: string;
  text: string;
}

export interface IAuthRequest extends Request {
  user?: {
    userId: Types.ObjectId;
    username: string;
  };
}

export interface ITokenPayload {
  userId: Types.ObjectId;
  username: string;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: Types.ObjectId;
    username: string;
    email: string;
  };
}

