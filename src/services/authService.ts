import jwt, { SignOptions } from 'jsonwebtoken';
import { ITokenPayload } from '../types';

const ACCESS_TOKEN_SECRET = (process.env.ACCESS_TOKEN_SECRET || 'access-token-secret') as string;
const REFRESH_TOKEN_SECRET = (process.env.REFRESH_TOKEN_SECRET || 'refresh-token-secret') as string;
const ACCESS_TOKEN_EXPIRY = (process.env.ACCESS_TOKEN_EXPIRY || '15m') as string;
const REFRESH_TOKEN_EXPIRY = (process.env.REFRESH_TOKEN_EXPIRY || '7d') as string;

const refreshTokens = new Set<string>();

export const generateAccessToken = (payload: ITokenPayload): string => {
  const options: SignOptions = { expiresIn: ACCESS_TOKEN_EXPIRY as SignOptions['expiresIn'] };

  return jwt.sign(payload, ACCESS_TOKEN_SECRET, options);
};

export const generateRefreshToken = (payload: ITokenPayload): string => {
  const options: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRY as SignOptions['expiresIn'] };
  const token = jwt.sign(payload, REFRESH_TOKEN_SECRET, options);
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

