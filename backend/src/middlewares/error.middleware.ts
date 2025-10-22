import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  logger.error('Unhandled error occurred', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.originalUrl,
    ip: clientIp,
    ...(process.env.NODE_ENV === 'development' && { fullError: err }),
  });
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
};