import rateLimit from 'express-rate-limit';
import logger from '../utils/logger';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    logger.warn(`Rate limit exceeded for IP: ${clientIp}`, {
      ip: clientIp,
      endpoint: req.originalUrl,
      method: req.method,
    });
    res.status(429).json({
      error: 'Too many requests, please try again later.',
    });
  },
  skip: (req) => {
    return req.path === '/health';
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    logger.warn(`Auth rate limit exceeded for IP: ${clientIp}`, {
      ip: clientIp,
      endpoint: req.originalUrl,
    });
    res.status(429).json({
      error: 'Too many authentication attempts, please try again later.',
    });
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many API requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    logger.warn(`API rate limit exceeded for IP: ${clientIp}`, {
      ip: clientIp,
      endpoint: req.originalUrl,
      method: req.method,
    });
    res.status(429).json({
      error: 'Too many API requests, please try again later.',
    });
  },
});
