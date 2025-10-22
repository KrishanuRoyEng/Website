import app from './app';
import { config } from './config';
import prisma from './config/database';
import logger from './utils/logger';

const PORT = config.port;

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        port: PORT,
        environment: config.nodeEnv,
        apiUrl: `http://localhost:${PORT}/api`,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  logger.info('SIGINT received - shutting down gracefully...');
  await prisma.$disconnect();
  logger.info('Database disconnected');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received - shutting down gracefully...');
  await prisma.$disconnect();
  logger.info('Database disconnected');
  process.exit(0);
});

startServer();
