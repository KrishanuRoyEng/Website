import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { JWTPayload } from '../types';

export const generateToken = (userId: number, role: string): string => {
  const payload: JWTPayload = { userId, role };
  
  const options: SignOptions = {
  expiresIn: parseInt(config.jwt.expire, 10),
};
  
  return jwt.sign(payload, config.jwt.secret, options);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};