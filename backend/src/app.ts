import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { errorHandler, notFound } from './middlewares/error.middleware';
import { config } from './config';
import logger from './utils/logger';
import { globalRateLimiter } from './middlewares/rateLimit.middleware';

const app: Application = express();

app.use(cors({
  origin: [config.frontend.url, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(globalRateLimiter);

app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode}`, {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: clientIp,
      userAgent: req.get('user-agent'),
    });
  });

  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use(errorHandler);
app.use(notFound);

export default app;
