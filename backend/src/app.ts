import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { errorHandler, notFound } from './middlewares/error.middleware';
import { config } from './config';
import logger from './utils/logger';

const app: Application = express();

// Debug logging for CORS configuration
console.log('🔧 Environment Configuration:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FRONTEND_URL from env:', process.env.FRONTEND_URL);
console.log('Config frontend URL:', config.frontend.url);
console.log('Port:', config.port);

// Build allowed origins list with explicit Vercel domain
const allowedOrigins = [
  config.frontend.url,
  'https://svistcode.vercel.app',       // Production Vercel
  'https://svistcode.vercel.app/',      // With trailing slash
  'http://localhost:3000',               // Local development
  'http://127.0.0.1:3000',              // Local alternative
  process.env.FRONTEND_URL,              // Direct env var as backup
].filter((origin): origin is string => Boolean(origin) && origin !== 'undefined');

console.log('✅ Allowed CORS Origins:', allowedOrigins);

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked origin:', origin);
      console.warn('Allowed origins:', allowedOrigins);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // Cache preflight for 24 hours
}));

// Explicitly handle preflight OPTIONS requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    try {
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode}`, {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: clientIp,
        userAgent: req.get('user-agent'),
        origin: req.get('origin'),
      });
    } catch (error) {
      console.error('Logging error:', error);
    }
  });

  next();
});

// Enhanced health check with CORS info
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cors: {
      configured: true,
      allowedOrigins: allowedOrigins,
      frontendUrl: config.frontend.url,
      requestOrigin: req.get('origin'),
    },
  });
});

// Rate limiter (optional)
try {
  const { globalRateLimiter } = require('./middlewares/rateLimit.middleware');
  if (globalRateLimiter) {
    app.use(globalRateLimiter);
  }
} catch (error) {
  console.error('Error loading rate limiter:', error);
}

// API routes
app.use('/api', routes);

// Error handlers
app.use(errorHandler);
app.use(notFound);

export default app;