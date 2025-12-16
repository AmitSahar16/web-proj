import jwt from 'jsonwebtoken';
import { ITokenPayload } from '../types';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your-access-token-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

// In-memory store for refresh tokens (in production, use Redis or database)
const refreshTokens = new Set<string>();

export const generateAccessToken = (payload: ITokenPayload): string => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

export const generateRefreshToken = (payload: ITokenPayload): string => {
  const token = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  refreshTokens.add(token);
  return token;
};

export const verifyAccessToken = (token: string): ITokenPayload => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as ITokenPayload;
};

export const verifyRefreshToken = (token: string): ITokenPayload => {
  if (!refreshTokens.has(token)) {
    throw new Error('Invalid refresh token');
  }
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as ITokenPayload;
};

export const revokeRefreshToken = (token: string): void => {
  refreshTokens.delete(token);
};

export const revokeAllRefreshTokens = (): void => {
  refreshTokens.clear();
};

