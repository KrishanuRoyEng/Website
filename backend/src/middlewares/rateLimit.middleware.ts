import rateLimit from "express-rate-limit";
import logger from "../utils/logger";

export const globalRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1000,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    logger.warn(`Rate limit exceeded for IP: ${clientIp}`, {
      ip: clientIp,
      endpoint: req.originalUrl,
      method: req.method,
    });
    res.status(429).json({
      error: "Too many requests, please try again later.",
    });
  },
  skip: (req) => {
    return (
      req.path === "/health" ||
      req.path.includes("/static") ||
      req.path.includes(".ico") || // Favicon
      req.path.includes(".css") || // CSS files
      req.path.includes(".js") // JavaScript files
    );
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30,
  message: "Too many login attempts, please try again after 5 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    logger.warn(`Auth rate limit exceeded for IP: ${clientIp}`, {
      ip: clientIp,
      endpoint: req.originalUrl,
    });
    res.status(429).json({
      error: "Too many authentication attempts, please try again in 5 minutes.",
    });
  },
  skip: (req) => {
    return req.path.includes("callback") || req.method === "GET";
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: "Too many API requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    logger.warn(`API rate limit exceeded for IP: ${clientIp}`, {
      ip: clientIp,
      endpoint: req.originalUrl,
      method: req.method,
    });
    res.status(429).json({
      error: "Too many API requests, please try again later.",
    });
  },
});

export const authRoutesLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50,
  message: "Too many requests to authentication endpoints.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: (req) => {
    return req.path.includes('callback'); // Skip GitHub callbacks
  }
});
